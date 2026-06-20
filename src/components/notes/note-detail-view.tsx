"use client";

import Link from "next/link";
import { Download, Link2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { SaveToProjectDialog } from "@/components/result/save-to-project-dialog";
import {
  ActionChecklistSection,
  KeyInsightsSection,
  KnowledgeCardsSection,
  NoteSectionCard,
} from "@/components/shared/note-content-sections";
import {
  findLocalSavedNoteById,
  R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT,
  R2A_TEMPORARY_PROJECT_ID,
  resolveNoteSavedStatus,
} from "@/lib/local-saved-notes";
import type { Note } from "@/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  r2aBtnIconHeader,
  r2aBtnPrimary,
  r2aContentPageHeaderActions,
  r2aContentPageHeaderRow,
  r2aContentPageShell,
  r2aPageSectionStackGap,
  r2aPlainWhitePanel,
  r2aTabLabelActive,
  r2aTabLabelInactive,
  r2aTabListRow,
  r2aTabUnderlineOff,
  r2aTabUnderlineOn,
} from "@/lib/r2a-ui-classes";
import { cn } from "@/lib/utils";

type TabId = "summary" | "source";

const noteActionButtonClass = cn(
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-[var(--r2a-radius-md)]",
  "border border-[var(--r2a-hairline)] bg-transparent px-3 text-[13px] font-normal text-[var(--r2a-ink-secondary)]",
  "transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)] active:scale-[0.98]",
  "focus-visible:outline-none",
);

function formatWordCount(n: number) {
  return n.toLocaleString("zh-CN");
}

function formatDetailDate(iso: string) {
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

export function NoteDetailView({
  note,
  projectId,
  projectName,
}: {
  note: Note;
  projectId: string;
  projectName: string;
}) {
  const [tab, setTab] = useState<TabId>("summary");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [localSavedStatus, setLocalSavedStatus] = useState<{
    noteId: string;
    status: ReturnType<typeof resolveNoteSavedStatus>;
  } | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(note.actionItems.map((a) => [a.id, a.isDone])),
  );
  const savedStatus =
    localSavedStatus?.noteId === note.id
      ? localSavedStatus.status
      : resolveNoteSavedStatus(note);
  const isTemporaryNote = savedStatus === "temporary";
  const shouldShowProjectBreadcrumb = projectId !== R2A_TEMPORARY_PROJECT_ID;

  useEffect(() => {
    const syncSavedStatus = () => {
      const localNote = findLocalSavedNoteById(note.id);
      if (localNote) {
        setLocalSavedStatus({
          noteId: note.id,
          status: resolveNoteSavedStatus(localNote),
        });
      }
    };

    window.addEventListener(
      R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT,
      syncSavedStatus,
    );
    return () => {
      window.removeEventListener(
        R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT,
        syncSavedStatus,
      );
    };
  }, [note.id]);

  const doneCount = useMemo(
    () => note.actionItems.filter((a) => checks[a.id]).length,
    [note.actionItems, checks],
  );

  const metaItems = useMemo(() => {
    const src = note.sourceName ?? "—";
    const tagPart =
      note.tags.length > 0 ? `标签：${note.tags.join(" · ")}` : "标签：—";
    const datePart = `创建时间：${formatDetailDate(note.createdAt)}`;
    const wc = `字数：${formatWordCount(note.wordCount)}`;
    return [`来源：${src}`, tagPart, datePart, wc];
  }, [note]);

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className={r2aContentPageShell}>
        {shouldShowProjectBreadcrumb ? (
          <nav
            className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-[var(--r2a-ink-muted)]"
            aria-label="面包屑"
          >
            <Link
              href={`/projects/${projectId}`}
              className="font-medium text-[var(--r2a-ink-secondary)] transition-colors duration-150 ease-out hover:text-[var(--r2a-ink)]"
            >
              {projectName}
            </Link>
            <span className="text-[var(--r2a-ink-faint)]">/</span>
            <span className="max-w-[min(100%,48rem)] truncate text-[var(--r2a-ink-muted)]">
              {note.title}
            </span>
          </nav>
        ) : null}

        <header className={r2aContentPageHeaderRow}>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="font-heading text-[28px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--r2a-ink)]">
              {note.title}
            </h1>
            <div className="flex flex-wrap items-center text-[12.5px] font-normal leading-relaxed text-[var(--r2a-ink-muted)]">
              {metaItems.map((item, index) => (
                <span key={item} className="inline-flex items-center">
                  {index > 0 ? (
                    <span
                      className="mx-2 inline-block size-[3px] rounded-full bg-[var(--r2a-ink-faint)]"
                      aria-hidden
                    />
                  ) : null}
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
          <div className={r2aContentPageHeaderActions}>
            <button
              type="button"
              className={noteActionButtonClass}
              onClick={() => toast.info("编辑功能暂未开放")}
            >
              <Pencil className="size-4 shrink-0 text-current" aria-hidden />
              编辑
            </button>
            <button type="button" className={noteActionButtonClass}>
              <Download className="size-4 shrink-0 text-current" aria-hidden />
              导出
            </button>
            {isTemporaryNote ? (
              <button
                type="button"
                className={cn(r2aBtnPrimary, "h-8 min-w-0 px-3 text-[13px]")}
                onClick={() => setSaveDialogOpen(true)}
              >
                保存到项目
              </button>
            ) : null}
            <div className="relative z-20 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className={r2aBtnIconHeader}
                  aria-label="更多操作"
                >
                  ⋯
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          window.location.href,
                        );
                        toast.success("已复制链接（演示）");
                      } catch {
                        toast.info("当前环境无法复制链接（演示）");
                      }
                    }}
                  >
                    <Link2 className="size-4 text-[var(--r2a-ink-muted)]" aria-hidden />
                    复制链接
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => toast.info("删除功能暂未开放")}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className={cn("flex flex-col", r2aPageSectionStackGap)}>
          <div className={r2aTabListRow} role="tablist" aria-label="笔记视图">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "summary"}
              onClick={() => setTab("summary")}
              className="inline-flex flex-col items-stretch gap-2 transition-colors"
            >
              <span
                className={cn(
                  tab === "summary" ? r2aTabLabelActive : r2aTabLabelInactive,
                )}
              >
                内容总结
              </span>
              <span
                className={cn(
                  tab === "summary" ? r2aTabUnderlineOn : r2aTabUnderlineOff,
                )}
                aria-hidden
              />
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "source"}
              onClick={() => setTab("source")}
              className="inline-flex flex-col items-stretch gap-2 transition-colors"
            >
              <span
                className={cn(
                  tab === "source" ? r2aTabLabelActive : r2aTabLabelInactive,
                )}
              >
                原文对照
              </span>
              <span
                className={cn(
                  tab === "source" ? r2aTabUnderlineOn : r2aTabUnderlineOff,
                )}
                aria-hidden
              />
            </button>
          </div>

          {tab === "summary" ? (
            <div className={cn("flex flex-col", r2aPageSectionStackGap)}>
              <NoteSectionCard title="一句话总结">
                <p className="font-heading max-w-[770px] text-[17px] font-medium leading-[1.85] text-[var(--r2a-ink)]">
                  {note.summary}
                </p>
              </NoteSectionCard>

              <KeyInsightsSection insights={note.keyInsights} />

              <ActionChecklistSection
                items={note.actionItems}
                checks={checks}
                doneCount={doneCount}
                onToggle={toggleCheck}
              />

              <KnowledgeCardsSection
                cards={note.knowledgeCards}
                emptySlot={
                  <p className="rounded-[var(--r2a-radius-lg)] border border-dashed border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-5 py-[18px] text-[13.5px] leading-relaxed text-[var(--r2a-ink-muted)] shadow-[var(--r2a-shadow-soft)]">
                    暂无知识卡片
                  </p>
                }
              />
            </div>
          ) : (
            <section
              className={cn(
                r2aPlainWhitePanel,
                "flex w-full flex-col gap-4 p-8",
              )}
              aria-label="原文对照"
              role="tabpanel"
            >
              <h2 className="font-heading text-[13px] font-medium text-[var(--r2a-ink-muted)]">
                原始内容
              </h2>
              <div className="max-h-[min(400px,55vh)] min-h-[120px] overflow-y-auto pr-1">
                <p className="whitespace-pre-wrap text-[14px] font-normal leading-[1.8] text-[var(--r2a-ink-secondary)]">
                  {note.rawContent}
                </p>
              </div>
            </section>
          )}
        </div>

        {isTemporaryNote ? (
          <SaveToProjectDialog
            open={saveDialogOpen}
            onOpenChange={setSaveDialogOpen}
            noteId={note.id}
          />
        ) : null}
      </div>
    </div>
  );
}
