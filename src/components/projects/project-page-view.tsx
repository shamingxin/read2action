"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Folder } from "lucide-react";
import { toast } from "sonner";

import type { Note, Project, SourceType } from "@/types";

import { seedPendingAnalyzeSession } from "@/lib/analyze-client";
import {
  r2aBtnPrimary,
  r2aCardBorder,
  r2aCardRadius,
  r2aCardShadow,
  r2aPageShell1020,
} from "@/lib/r2a-ui-classes";
import {
  readAllLocalSavedNotes,
  R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT,
} from "@/lib/local-saved-notes";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<SourceType, string> = {
  article: "文章",
  video: "视频",
  note: "笔记",
  user_note: "笔记",
  other: "其他",
};

function formatListDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function sortNotesByUpdatedDesc(list: Note[]): Note[] {
  return [...list].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function mergeServerAndLocalNotes(projectId: string, serverNotes: Note[]): Note[] {
  const localForProject = readAllLocalSavedNotes().filter(
    (n) => n.projectId === projectId,
  );
  const byId = new Map<string, Note>();
  for (const n of serverNotes) byId.set(n.id, n);
  for (const n of localForProject) byId.set(n.id, n);
  return sortNotesByUpdatedDesc([...byId.values()]);
}

export function ProjectPageView({
  project,
  notes,
}: {
  project: Project;
  notes: Note[];
}) {
  const router = useRouter();
  const [quickInput, setQuickInput] = useState("");
  const [mergedNotes, setMergedNotes] = useState<Note[]>(() =>
    sortNotesByUpdatedDesc(notes),
  );

  useEffect(() => {
    const recompute = () =>
      queueMicrotask(() =>
        setMergedNotes(mergeServerAndLocalNotes(project.id, notes)),
      );
    recompute();
    const bump = () => recompute();
    window.addEventListener(R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, [notes, project.id]);

  const canSubmit = quickInput.trim().length > 0;

  const handleParse = useCallback(() => {
    if (!quickInput.trim()) {
      toast.info("请输入内容后再整理");
      return;
    }
    seedPendingAnalyzeSession(quickInput, { projectId: project.id });
    router.push("/parsing");
  }, [quickInput, project.id, router]);

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className={r2aPageShell1020}>
        <header className="flex items-center gap-3">
          <span
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--r2a-radius-sm)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] text-[var(--r2a-accent-ink)] shadow-[var(--r2a-shadow-soft)]"
            aria-hidden
          >
            <Folder className="size-4" strokeWidth={1.8} />
          </span>
          <h1 className="font-heading text-[28px] font-semibold leading-tight text-[var(--r2a-ink)]">
            {project.name}
          </h1>
        </header>

        <section
          className={cn(
            "flex w-full flex-col gap-3 rounded-full bg-[var(--r2a-surface)] px-5 py-3 md:min-h-[64px] md:flex-row md:items-center md:gap-3 md:py-2",
            r2aCardBorder,
          )}
          aria-label="项目内快速整理"
        >
          <div className="flex min-h-10 min-w-0 flex-1 items-center">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="今天想整理点什么？"
              className={cn(
                "min-w-0 flex-1 border-0 bg-transparent text-[15px] leading-relaxed text-[var(--r2a-ink)]",
                "placeholder:text-[14px] placeholder:font-normal placeholder:text-[var(--r2a-ink-faint)]",
                "shadow-none focus:shadow-none focus-visible:shadow-none",
                "outline-none outline-0 ring-0 ring-offset-0",
                "focus:outline-none focus:outline-0 focus:ring-0 focus:ring-offset-0",
                "focus-visible:outline-none focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            />
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end md:gap-2.5">
            <button
              type="button"
              aria-disabled={!canSubmit}
              disabled={!canSubmit}
              onClick={handleParse}
              className={cn(
                r2aBtnPrimary,
                "w-full rounded-full px-5 shadow-none sm:w-[128px]",
                !canSubmit &&
                  "cursor-not-allowed !bg-[var(--r2a-hover)] !text-[var(--r2a-ink-faint)] !opacity-100 saturate-75 hover:!bg-[var(--r2a-hover)]",
              )}
            >
              开始整理
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-[16px] font-medium text-[var(--r2a-ink)]">
              笔记
            </h2>
            <div
              className="h-px w-6 rounded-sm bg-[var(--r2a-hairline)]"
              aria-hidden
            />
          </div>

          <div
            className={cn(
              "overflow-hidden bg-[var(--r2a-surface)]",
              r2aCardRadius,
              r2aCardBorder,
              r2aCardShadow,
            )}
          >
            {mergedNotes.length === 0 ? (
              <div className="m-4 rounded-[var(--r2a-radius-lg)] border border-dashed border-[var(--r2a-hairline)] bg-[var(--r2a-canvas-soft)] px-6 py-12 text-center">
                <p className="text-[15px] font-medium text-[var(--r2a-ink-muted)]">
                  当前项目暂无笔记
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--r2a-hairline-soft)]">
                {mergedNotes.map((note) => (
                  <li key={note.id}>
                    <div
                      role="link"
                      tabIndex={0}
                      onClick={() =>
                        router.push(
                          `/projects/${project.id}/notes/${note.id}`,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(
                            `/projects/${project.id}/notes/${note.id}`,
                          );
                        }
                      }}
                      className="grid cursor-pointer grid-cols-1 gap-3 px-5 py-4 transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] lg:grid-cols-[minmax(0,1fr)_minmax(160px,240px)_120px_40px] lg:items-center lg:gap-6"
                    >
                      <div className="min-w-0 lg:pr-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="rounded-[var(--r2a-radius-sm)] border border-[var(--r2a-hairline)] bg-[var(--r2a-canvas-soft)] px-2 py-0.5 text-[11px] font-normal text-[var(--r2a-ink-muted)]">
                            {TYPE_LABEL[note.sourceType]}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-[var(--r2a-ink)]">
                            {note.title}
                          </p>
                        </div>
                        <p className="mt-1 line-clamp-1 text-[12.5px] font-normal leading-relaxed text-[var(--r2a-ink-muted)]">
                          {note.summary}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {note.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-[var(--r2a-radius-sm)] border border-[var(--r2a-hairline-soft)] bg-[var(--r2a-canvas-soft)] px-2 py-0.5 text-[11px] font-normal text-[var(--r2a-ink-secondary)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-[12px] text-[var(--r2a-ink-faint)] lg:text-left">
                        {formatListDate(note.createdAt)}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="inline-flex size-8 items-center justify-center rounded-[var(--r2a-radius-md)] text-[16px] text-[var(--r2a-ink-muted)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-surface)] hover:text-[var(--r2a-ink)]"
                          aria-label="更多（占位）"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          ⋯
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {mergedNotes.length > 0 ? (
            <footer className="flex flex-col gap-2 text-[12px] text-[var(--r2a-ink-muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>
                {`显示 1–${mergedNotes.length} 条，共 ${mergedNotes.length} 条`}
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-2 py-1 text-[var(--r2a-ink)]">
                  1
                </span>
                <span className="text-[var(--r2a-ink-faint)]">/</span>
                <span>1</span>
              </div>
            </footer>
          ) : null}
        </section>
      </div>
    </div>
  );
}
