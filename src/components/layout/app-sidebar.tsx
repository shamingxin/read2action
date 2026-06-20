"use client";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockNotes } from "@/data/notes.mock";
import {
  readAllLocalSavedNotes,
  R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT,
} from "@/lib/local-saved-notes";
import { createClient } from "@/lib/supabase/client";
import { createProject, isDataError, listProjects } from "@/lib/supabase/projects";
import { cn } from "@/lib/utils";
import type { Note, Project } from "@/types";

function isMockDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("mock") === "true";
}

function mergeRecentNotes(includeMock: boolean): Note[] {
  const local = readAllLocalSavedNotes();
  const source = includeMock ? [...mockNotes, ...local] : local;
  return source
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);
}

function isProjectPathname(pathname: string, projectHref: string): boolean {
  return pathname === projectHref || pathname.startsWith(`${projectHref}/`);
}

function NavItem({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[34px] items-center gap-2 rounded-[var(--r2a-radius-md)] px-2 py-2 text-[13px] font-normal text-[var(--r2a-ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  /** 首次 auth 检查完成前为 false，避免未确认登录态时闪现 mock 项目 */
  const [authReady, setAuthReady] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<Project[] | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [createProjectError, setCreateProjectError] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [pendingProject, setPendingProject] = useState<{
    href: string;
    fromPathname: string;
  } | null>(null);

  useEffect(() => {
    const includeMock = isMockDebugEnabled();
    queueMicrotask(() => setRecentNotes(mergeRecentNotes(includeMock)));
    const bump = () =>
      queueMicrotask(() => setRecentNotes(mergeRecentNotes(includeMock)));
    window.addEventListener(R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    void (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setAuthUser(user);
      } catch (err) {
        console.error("[AppSidebar] getUser failed:", err);
        setAuthUser(null);
      } finally {
        setAuthReady(true);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) {
      queueMicrotask(() => setCloudProjects(null));
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    void (async () => {
      try {
        const result = await listProjects(supabase);
        if (cancelled) return;
        setCloudProjects(isDataError(result) ? [] : result);
      } catch (err) {
        console.error("[AppSidebar] listProjects failed:", err);
        if (!cancelled) setCloudProjects([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  useEffect(() => {
    if (pendingProject && pathname !== pendingProject.fromPathname) {
      const timeoutId = window.setTimeout(() => {
        setPendingProject((current) =>
          current?.href === pendingProject.href &&
          current.fromPathname === pendingProject.fromPathname
            ? null
            : current,
        );
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [pathname, pendingProject]);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setAuthUser(null);
      setCloudProjects(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[AppSidebar] signOut failed:", err);
      router.push("/");
    } finally {
      setIsSigningOut(false);
    }
  }

  function resetCreateProjectDialog() {
    setProjectName("");
    setCreateProjectError("");
  }

  function handleCreateProjectOpenChange(nextOpen: boolean) {
    if (isCreatingProject && !nextOpen) return;
    if (!nextOpen) resetCreateProjectDialog();
    setIsCreateProjectOpen(nextOpen);
  }

  async function handleCreateProjectSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (isCreatingProject) return;

    const name = projectName.trim();
    if (!name) {
      setCreateProjectError("请输入项目名称。");
      return;
    }
    if (!authUser) {
      setCreateProjectError("请先登录后再创建项目。");
      return;
    }

    setIsCreatingProject(true);
    setCreateProjectError("");
    try {
      const supabase = createClient();
      const result = await createProject(supabase, { name });

      if (isDataError(result)) {
        setCreateProjectError(`创建失败：${result.message}`);
        return;
      }

      setCloudProjects((current) => {
        const rest = (current ?? []).filter((p) => p.id !== result.id);
        return [result, ...rest];
      });
      resetCreateProjectDialog();
      setIsCreateProjectOpen(false);
      toast.success("项目已创建");
      router.push(`/projects/${result.id}`);
      router.refresh();
    } catch (err) {
      console.error("[AppSidebar] createProject failed:", err);
      setCreateProjectError(
        err instanceof Error
          ? `创建失败：${err.message}`
          : "创建失败，请稍后重试。",
      );
    } finally {
      setIsCreatingProject(false);
    }
  }

  const isProjectsLoading =
    !authReady || (authUser !== null && cloudProjects === null);
  const isGuestReady = authReady && authUser === null;
  const linkProjects = authUser ? (cloudProjects ?? []) : [];
  const currentProjectHref =
    linkProjects
      .map((project) => `/projects/${project.id}`)
      .find((projectHref) => isProjectPathname(pathname, projectHref)) ?? null;
  const pendingProjectHref =
    pendingProject && pathname === pendingProject.fromPathname
      ? pendingProject.href
      : null;
  const activeProjectHref = currentProjectHref ?? pendingProjectHref;

  return (
    <>
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-[var(--r2a-hairline)] bg-[var(--r2a-sidebar-bg)]">
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-[18px]">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-ink)] font-heading text-[14px] font-semibold leading-none text-[var(--r2a-canvas-soft)]">
          读
        </div>
        <div className="flex min-w-0 flex-col">
          <Link
            href="/"
            className="text-[14px] font-semibold leading-tight text-[var(--r2a-ink)]"
          >
            Read2Action
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-[22px] overflow-y-auto px-3 pt-3 pb-3">
        <Link
          href="/"
          className="flex h-10 items-center justify-center gap-1.5 rounded-[var(--r2a-radius-button)] bg-[var(--r2a-ink)] px-4 text-[13.5px] font-medium text-[var(--r2a-canvas-soft)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-ink-secondary)] active:scale-[0.98]"
        >
          + 新笔记
        </Link>

        <div>
          <div className="mb-1 px-2 font-heading text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--r2a-ink-muted)]">
            项目
          </div>
          <nav className="flex flex-col gap-px">
            {authUser ? (
              <button
                type="button"
                onClick={() => setIsCreateProjectOpen(true)}
                className="group flex min-h-[34px] w-full items-center gap-2 rounded-[var(--r2a-radius-md)] px-2 text-left text-[13.5px] font-normal leading-none text-[var(--r2a-ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)]"
              >
                <span
                  className="size-1 shrink-0 rounded-full bg-[var(--r2a-ink-faint)] group-hover:bg-[var(--r2a-ink-muted)]"
                  aria-hidden
                />
                <span className="truncate leading-normal">新建项目</span>
              </button>
            ) : null}
            {isProjectsLoading ? (
              <div className="mt-1 rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-3 py-2 text-[12px] leading-relaxed text-[var(--r2a-ink-muted)] shadow-[var(--r2a-shadow-soft)]">
                正在加载云端项目…
              </div>
            ) : null}
            {isGuestReady ? (
              <div className="mt-1 rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-3 py-3 text-[12px] leading-relaxed text-[var(--r2a-ink-muted)] shadow-[var(--r2a-shadow-soft)]">
                <p className="font-medium text-[var(--r2a-ink-secondary)]">
                  登录后可创建项目，并在不同设备间同步你的整理结果。
                </p>
                <p className="mt-1">
                  当前未登录，内容仅保存在本浏览器。
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href="/login"
                    className="font-medium text-[var(--r2a-primary)] transition-colors duration-150 ease-out hover:text-[var(--r2a-primary-active)]"
                  >
                    登录
                  </Link>
                  <span aria-hidden>·</span>
                  <Link
                    href="/signup"
                    className="font-medium text-[var(--r2a-primary)] transition-colors duration-150 ease-out hover:text-[var(--r2a-primary-active)]"
                  >
                    注册
                  </Link>
                </div>
              </div>
            ) : null}
            {!isProjectsLoading && authUser
              ? linkProjects.map((p) => {
              const projectHref = `/projects/${p.id}`;
              const isCurrentProject = currentProjectHref === projectHref;
              const isProjectActive = activeProjectHref === projectHref;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "group flex min-h-[34px] items-center gap-1 rounded-[var(--r2a-radius-md)] px-2 transition-colors duration-150 ease-out",
                    "hover:bg-[var(--r2a-hover)]",
                    isProjectActive && "bg-[var(--r2a-sidebar-active-bg)] hover:bg-[var(--r2a-sidebar-active-bg)]",
                  )}
                >
                  <Link
                    href={projectHref}
                    aria-current={isCurrentProject ? "page" : undefined}
                    onClick={(event) => {
                      if (
                        event.defaultPrevented ||
                        event.button !== 0 ||
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      ) {
                        return;
                      }
                      if (!isCurrentProject) {
                        setPendingProject({
                          href: projectHref,
                          fromPathname: pathname,
                        });
                      }
                    }}
                    className={cn(
                      "flex min-h-0 min-w-0 flex-1 items-center gap-2 py-0 text-[13.5px] leading-none",
                      isProjectActive
                        ? "font-medium text-[var(--r2a-sidebar-active-ink)]"
                        : "font-normal text-[var(--r2a-ink-secondary)]",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1 shrink-0 rounded-full",
                        isProjectActive
                          ? "bg-[var(--r2a-sidebar-active-dot)]"
                          : "bg-[var(--r2a-ink-faint)] group-hover:bg-[var(--r2a-ink-muted)]",
                      )}
                      aria-hidden
                    />
                    <span className="truncate leading-normal">{p.name}</span>
                  </Link>
                  <DropdownMenu>
                    {/* 可见性挂在包裹层，避免 Trigger 默认样式覆盖 opacity；固定 w-8 保持各行同高 */}
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center transition-opacity",
                        "pointer-events-none opacity-0",
                        "group-hover:pointer-events-auto group-hover:opacity-100",
                        isProjectActive &&
                          "pointer-events-auto opacity-100",
                        "[&:has([data-popup-open])]:pointer-events-auto [&:has([data-popup-open])]:opacity-100",
                      )}
                    >
                      <DropdownMenuTrigger
                        type="button"
                        aria-label={`「${p.name}」更多操作`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="inline-flex size-7 items-center justify-center rounded-[var(--r2a-radius-md)] text-[var(--r2a-ink-muted)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)] data-popup-open:bg-[var(--r2a-hover)]"
                      >
                        <MoreHorizontal className="size-4" aria-hidden />
                      </DropdownMenuTrigger>
                    </div>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("重命名项目功能暂未开放")
                        }
                      >
                        重命名项目
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => toast.info("删除项目功能暂未开放")}
                      >
                        删除项目
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
              : null}
            {!isProjectsLoading && authUser && linkProjects.length === 0 ? (
              <div className="mt-1 rounded-[var(--r2a-radius-md)] border border-dashed border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-3 py-2 text-[12px] leading-relaxed text-[var(--r2a-ink-muted)]">
                暂无云端项目。
              </div>
            ) : null}
          </nav>
        </div>

        <div>
          <div className="mb-1 px-2 font-heading text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--r2a-ink-muted)]">
            最近
          </div>
          {recentNotes.length === 0 ? (
            <div className="rounded-[var(--r2a-radius-md)] border border-dashed border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--r2a-ink-muted)] shadow-[var(--r2a-shadow-soft)]">
              <p className="font-medium text-[var(--r2a-ink-secondary)]">
                还没有整理记录
              </p>
              <p className="mt-1">粘贴一段内容，开始整理你的思考。</p>
            </div>
          ) : (
            <nav className="flex flex-col gap-px">
              {recentNotes.map((n) => (
                <NavItem
                  key={n.id}
                  href={`/projects/${n.projectId}/notes/${n.id}`}
                  className="items-start"
                >
                  <span className="line-clamp-2 text-left leading-snug">
                    {n.title}
                  </span>
                </NavItem>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--r2a-hairline)] px-3 py-2">
        <div className="flex items-center gap-2.5 rounded-[var(--r2a-radius-md)] px-2 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] font-heading text-[13px] font-semibold text-[var(--r2a-ink)]">
            {authUser ? "已" : "访"}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {authUser ? (
              <>
                <span className="truncate text-[12.5px] font-medium leading-none text-[var(--r2a-ink)]">
                  {authUser.email ?? "已登录用户"}
                </span>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={isSigningOut}
                  className="inline-flex w-fit text-left text-[12px] font-medium text-[var(--r2a-ink-muted)] transition-colors duration-150 ease-out hover:text-[var(--r2a-primary)] disabled:opacity-50"
                >
                  {isSigningOut ? "退出中…" : "退出登录"}
                </button>
              </>
            ) : (
              <>
                <span className="truncate text-[12.5px] font-medium leading-none text-[var(--r2a-ink)]">
                  访客
                </span>
                <Link
                  href="/login"
                  className="inline-flex w-fit text-[12px] font-medium text-[var(--r2a-primary)] transition-colors duration-150 ease-out hover:text-[var(--r2a-primary-active)]"
                >
                  登录
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
    {authUser ? (
      <Dialog
        open={isCreateProjectOpen}
        onOpenChange={handleCreateProjectOpenChange}
      >
        <DialogContent
          className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-[400px]"
          showCloseButton={!isCreatingProject}
        >
          <form onSubmit={handleCreateProjectSubmit}>
            <div className="px-6 pt-6 pb-5">
              <DialogHeader className="pr-12">
                <DialogTitle>新建项目</DialogTitle>
              </DialogHeader>
              <div className="mt-5 flex flex-col gap-2.5">
                <label
                  htmlFor="new-project-name"
                  className="text-[13px] font-medium text-[var(--r2a-ink-secondary)]"
                >
                  项目名称
                </label>
                <input
                  id="new-project-name"
                  type="text"
                  value={projectName}
                  onChange={(event) => {
                    setProjectName(event.target.value);
                    if (createProjectError) setCreateProjectError("");
                  }}
                  placeholder="例如：读书笔记"
                  disabled={isCreatingProject}
                  autoFocus
                  className={cn(
                    "h-10 w-full rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-3 text-[14px] text-[var(--r2a-ink)] outline-none transition-colors duration-150 ease-out placeholder:text-[var(--r2a-ink-faint)]",
                    "focus:border-[var(--r2a-accent-ink)] focus:ring-2 focus:ring-[var(--r2a-accent-ink)]/10",
                    createProjectError &&
                      "border-[var(--r2a-error)] focus:border-[var(--r2a-error)] focus:ring-[var(--r2a-error)]/15",
                  )}
                />
                {createProjectError ? (
                  <p className="text-[12px] leading-relaxed text-[var(--r2a-error)]">
                    {createProjectError}
                  </p>
                ) : null}
              </div>
            </div>
            <DialogFooter className="!mx-0 !mb-0 flex-row flex-wrap justify-end gap-3 border-t border-[var(--r2a-hairline)] bg-[var(--r2a-canvas-soft)] px-6 py-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="action-outline"
                className="min-w-[88px]"
                onClick={() => handleCreateProjectOpenChange(false)}
                disabled={isCreatingProject}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="default"
                size="action"
                className="min-w-[104px]"
                disabled={isCreatingProject}
              >
                {isCreatingProject ? "创建中..." : "创建项目"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    ) : null}
    </>
  );
}
