"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Folder, Plus } from "lucide-react";
import { toast } from "sonner";

import type { Note, Project, SourceType } from "@/types";

import { ModelSelect } from "@/components/ui/model-select";
import { seedPendingAnalyzeSession } from "@/lib/analyze-client";
import { DEFAULT_MODEL_VALUE } from "@/lib/model-options";
import {
  r2aBtnPrimaryPill,
  r2aCardBorder,
  r2aCardRadius,
  r2aCardShadow,
  r2aPageShell1020,
  r2aPlusCircleButton,
  r2aSurfaceShadow,
} from "@/lib/r2a-ui-classes";
import {
  readAllLocalSavedNotes,
  R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT,
} from "@/lib/local-saved-notes";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<SourceType, string> = {
  article: "Article",
  video: "Video",
  note: "Note",
  user_note: "Note",
  other: "Other",
};

function formatListDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
  const [model, setModel] = useState<string>(DEFAULT_MODEL_VALUE);
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
      toast.info("请输入内容后再解析");
      return;
    }
    seedPendingAnalyzeSession(quickInput, { projectId: project.id });
    router.push("/parsing");
  }, [quickInput, project.id, router]);

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[#F4F5F9]">
      <div className={r2aPageShell1020}>
        <header className="flex items-center gap-3">
          <Folder
            className="size-8 shrink-0 text-[#121212]"
            strokeWidth={2}
            aria-hidden
          />
          <h1 className="text-[28px] font-semibold leading-tight text-[#121212]">
            {project.name}
          </h1>
        </header>

        <section
          className={cn(
            "flex h-[68px] w-full items-center justify-between gap-4 rounded-[48px] border border-[#E5E7EB] bg-white px-4",
            r2aSurfaceShadow,
          )}
          aria-label="项目内快速解析"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className={r2aPlusCircleButton}
              aria-label="更多输入方式（占位）"
            >
              <Plus className="size-4" strokeWidth={1.8} aria-hidden />
            </button>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="粘贴文本、链接或你的想法，让 AI 帮你整理成结构化笔记"
              className={cn(
                "min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[#121212]",
                "placeholder:text-[14px] placeholder:font-normal placeholder:text-[#939393]",
                "shadow-none focus:shadow-none focus-visible:shadow-none",
                "outline-none outline-0 ring-0 ring-offset-0",
                "focus:outline-none focus:outline-0 focus:ring-0 focus:ring-offset-0",
                "focus-visible:outline-none focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ModelSelect value={model} onValueChange={setModel} />
            <button
              type="button"
              aria-disabled={!canSubmit}
              onClick={handleParse}
              className={cn(
                r2aBtnPrimaryPill,
                !canSubmit &&
                  "cursor-not-allowed opacity-[0.38] saturate-75 hover:bg-[#4F46E5] hover:opacity-[0.38]",
              )}
            >
              解析
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-[#121212]">解析</h2>

          <div
            className={cn(
              "overflow-hidden bg-white",
              r2aCardRadius,
              r2aCardBorder,
              r2aCardShadow,
            )}
          >
            <div className="hidden grid-cols-[minmax(0,360px)_80px_minmax(0,240px)_120px_40px] gap-6 border-b border-[#E5E7EB] px-4 py-3 text-[11px] font-normal text-[#939393] lg:grid">
              <span>标题</span>
              <span>类型</span>
              <span>标签</span>
              <span>创建时间</span>
              <span className="text-right">操作</span>
            </div>

            {mergedNotes.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[14px] text-[#6B7280]">当前项目暂无解析记录</p>
                <p className="mt-1 text-[12px] text-[#939393]">
                  可在上方输入内容解析，或从首页开始新建内容
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E7EB]">
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
                      className="grid cursor-pointer grid-cols-1 gap-2 px-4 py-3.5 transition-colors hover:bg-[#FAFAFC] lg:grid-cols-[minmax(0,360px)_80px_minmax(0,240px)_120px_40px] lg:items-center lg:gap-6 lg:py-3.5"
                    >
                      <div className="min-w-0 lg:pr-0">
                        <p className="truncate text-[13px] font-normal text-[#121212]">
                          {note.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[12px] font-normal text-[#939393]">
                          {note.summary}
                        </p>
                      </div>
                      <div className="flex items-center lg:block">
                        <span className="rounded-md bg-[#EEF2FF] px-2 py-1 text-[11px] font-normal text-[#4F46E5]">
                          {TYPE_LABEL[note.sourceType]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {note.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-[#EDF0FF] px-2 py-1 text-[11px] font-normal text-[#4F46E5]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-[12px] text-[#939393] lg:text-left">
                        {formatListDate(note.createdAt)}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="inline-flex size-8 items-center justify-center rounded-md text-[16px] text-[#939393] hover:bg-[#F3F4F6]"
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

          <footer className="flex flex-col gap-2 text-[12px] text-[#939393] sm:flex-row sm:items-center sm:justify-between">
            <span>
              {mergedNotes.length > 0
                ? `显示 1–${mergedNotes.length} 条，共 ${mergedNotes.length} 条`
                : "当前暂无解析记录"}
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[#363636]">
                1
              </span>
              <span className="text-[#939393]">/</span>
              <span>1</span>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
