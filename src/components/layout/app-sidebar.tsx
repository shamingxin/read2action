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
import { mockNotes } from "@/data/notes.mock";
import { mockProjects } from "@/data/projects.mock";
import {
  readAllLocalSavedNotes,
  R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT,
} from "@/lib/local-saved-notes";
import { createClient } from "@/lib/supabase/client";
import { isDataError, listProjects } from "@/lib/supabase/projects";
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

const NEW_PROJECT_ENTRY_ID = "new";

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

  const newEntry = mockProjects.find((p) => p.id === NEW_PROJECT_ENTRY_ID);
  const mockLinkProjects = mockProjects.filter(
    (p) => p.id !== NEW_PROJECT_ENTRY_ID,
  );
  const isProjectsLoading =
    !authReady || (authUser !== null && cloudProjects === null);
  const linkProjects = authUser ? (cloudProjects ?? []) : mockLinkProjects;

  return (
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
            搜索
          </div>
          <div className="flex h-9 items-center gap-2 rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-2.5 text-[13px] text-[var(--r2a-ink-secondary)]">
            <span className="flex-1 truncate">搜索</span>
            <span className="rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-canvas-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--r2a-ink-muted)]">
              ⌘K
            </span>
          </div>
        </div>

        <div>
          <div className="mb-1 px-2 font-heading text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--r2a-ink-muted)]">
            项目
          </div>
          <nav className="flex flex-col gap-px">
            {newEntry ? (
              <button
                key="add-project-entry"
                type="button"
                onClick={() => toast.info("新建项目功能暂未开放")}
                className={cn(
                  "flex min-h-[34px] w-full items-center gap-2 rounded-[var(--r2a-radius-md)] px-2 text-left text-[13.5px] font-normal leading-none text-[var(--r2a-ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)]",
                )}
              >
                <span className="size-1 rounded-full bg-[var(--r2a-ink-faint)]" aria-hidden />
                <span className="truncate">新增项目</span>
              </button>
            ) : null}
            {isProjectsLoading ? (
              <div className="mt-1 rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-3 py-2 text-[12px] leading-relaxed text-[var(--r2a-ink-muted)] shadow-[var(--r2a-shadow-soft)]">
                正在加载云端项目…
              </div>
            ) : null}
            {!isProjectsLoading
              ? linkProjects.map((p) => {
              const projectHref = `/projects/${p.id}`;
              const isProjectActive =
                pathname === projectHref ||
                pathname.startsWith(`${projectHref}/`);
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
                    aria-current={isProjectActive ? "page" : undefined}
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
                        onClick={() => toast.info("分享功能暂未开放")}
                      >
                        分享
                      </DropdownMenuItem>
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
            {!isProjectsLoading && linkProjects.length === 0 ? (
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
              当前还没有解析记录。
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
  );
}
