"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Folder,
  FolderPlus,
  MoreHorizontal,
  PencilLine,
  Search,
  Sparkles,
  User,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

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
        "flex min-h-9 items-center gap-2 rounded-[10px] px-1 py-2 text-[13px] font-normal text-[#363636] transition-colors hover:bg-white/60",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

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

  const newEntry = mockProjects.find((p) => p.id === NEW_PROJECT_ENTRY_ID);
  const linkProjects = mockProjects.filter((p) => p.id !== NEW_PROJECT_ENTRY_ID);

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-[#F0F1F6]">
      <div className="flex items-start gap-2.5 border-b border-[#E5E7EB] px-3 pt-5 pb-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#4F46E5]">
          <Sparkles className="size-4 text-white" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            href="/"
            className="text-[15px] font-bold leading-tight tracking-tight text-[#121212]"
          >
            Read2Action
          </Link>
          <span className="text-[11px] font-medium leading-tight text-[#939393]">
            Knowledge Hub
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pt-3 pb-2">
        <Link
          href="/"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4F46E5] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4338CA]"
        >
          <PencilLine className="size-[18px] shrink-0 text-white" aria-hidden />
          新笔记
        </Link>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold text-[#121212]">
            搜索
          </div>
          <div className="flex h-9 items-center gap-2 rounded-[10px] border border-[#F4F5F9] bg-white px-2.5 text-[13px] text-[#363636]">
            <Search className="size-4 shrink-0 text-[#121212]" aria-hidden />
            <span className="flex-1 truncate text-[#363636]">搜索</span>
            <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-[#363636]">
              ⌘K
            </span>
          </div>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold text-[#121212]">
            项目
          </div>
          <nav className="flex flex-col gap-0.5">
            {newEntry ? (
              <button
                key="add-project-entry"
                type="button"
                onClick={() => toast.info("新建项目功能暂未开放")}
                className={cn(
                  "flex h-9 w-full items-center gap-2 rounded-[10px] px-1 text-left text-[13px] font-normal leading-none text-[#363636] transition-colors hover:bg-white/60",
                )}
              >
                <FolderPlus className="size-4 shrink-0 text-[#121212]" aria-hidden />
                <span className="truncate">新增项目</span>
              </button>
            ) : null}
            {linkProjects.map((p) => {
              const projectHref = `/projects/${p.id}`;
              const isProjectActive =
                pathname === projectHref ||
                pathname.startsWith(`${projectHref}/`);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "group flex h-9 items-center gap-1 rounded-[10px] px-1 transition-colors",
                    "hover:bg-white/60",
                    isProjectActive && "bg-white/75 hover:bg-white/85",
                  )}
                >
                  <Link
                    href={projectHref}
                    aria-current={isProjectActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-0 min-w-0 flex-1 items-center gap-2 py-0 text-[13px] leading-none",
                      isProjectActive
                        ? "font-medium text-[#121212]"
                        : "font-normal text-[#363636]",
                    )}
                  >
                    <Folder
                      className={cn(
                        "size-4 shrink-0",
                        isProjectActive
                          ? "text-[#4F46E5]"
                          : "text-[#121212]",
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
                        className="inline-flex size-8 items-center justify-center rounded-[8px] text-[#939393] transition-colors hover:bg-white/80 hover:text-[#363636] data-popup-open:bg-white/80"
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
            })}
          </nav>
        </div>

        <div>
          <div className="mb-1 px-1 text-[11px] font-semibold text-[#121212]">
            最近
          </div>
          {recentNotes.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-[#D5D8E2] bg-white/60 px-3 py-2.5 text-[12px] leading-relaxed text-[#6B7280]">
              当前还没有解析记录，从首页开始解析吧。
            </div>
          ) : (
            <nav className="flex flex-col gap-0.5">
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

      <div className="mt-auto border-t border-[#E5E7EB] px-2 py-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white">
            <User className="size-4 text-[#121212]" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[13px] font-semibold leading-none text-[#121212]">
              访客
            </span>
            <span className="inline-flex w-fit rounded-md border border-[#3B82F5] bg-[#3B82F5] px-1.5 py-0.5 text-[10px] font-bold text-[#2673B8]">
              MVP
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
