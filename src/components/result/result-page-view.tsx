"use client";

import { Download, Link2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { SaveToProjectDialog } from "./save-to-project-dialog";
import {
  ActionChecklistSection,
  KeyInsightsSection,
  KnowledgeCardsSection,
  NoteSectionCard,
} from "@/components/shared/note-content-sections";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockParseResult } from "@/data/result.mock";
import {
  readLastAnalyzeNoteIdFromSession,
  readLastAnalyzeResultFromSession,
} from "@/lib/analyze-client";
import {
  findLocalSavedNoteById,
  readAllLocalSavedNotes,
  resolveNoteSavedStatus,
} from "@/lib/local-saved-notes";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/session";
import type { ParseResultPreview } from "@/types";

import {
  r2aBtnIconHeader,
  r2aBtnPrimary,
  r2aBtnSecondary,
  r2aContentPageHeaderActions,
  r2aContentPageHeaderRow,
  r2aKnowledgeAddSlotShell,
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
type ResultAuthMode = "idle" | "guest" | "cloud";
type ResultStatusHint = "temporary" | "project-saved" | null;

function formatWordCount(n: number | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("zh-CN");
}

function matchesCurrentResult(
  note: ReturnType<typeof readAllLocalSavedNotes>[number],
  result: ParseResultPreview,
): boolean {
  const resultTitle = result.title.trim();
  const resultSummary = result.summary.trim();
  return (
    resultTitle.length > 0 &&
    resultSummary.length > 0 &&
    note.title.trim() === resultTitle &&
    note.summary.trim() === resultSummary
  );
}

function noteToResultStatusHint(
  note: ReturnType<typeof readAllLocalSavedNotes>[number] | undefined,
): ResultStatusHint {
  if (note == null) return null;
  return resolveNoteSavedStatus(note) === "temporary"
    ? "temporary"
    : "project-saved";
}

function readResultStatusHint(result?: ParseResultPreview | null): ResultStatusHint {
  const noteId = readLastAnalyzeNoteIdFromSession();
  if (noteId) {
    const fromSessionNote = noteToResultStatusHint(findLocalSavedNoteById(noteId));
    if (fromSessionNote != null) return fromSessionNote;
  }

  if (!result) return null;
  const matchingNote = readAllLocalSavedNotes()
    .filter((note) => matchesCurrentResult(note, result))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0];
  return noteToResultStatusHint(matchingNote);
}

function ResultPageLoadingState() {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className={r2aContentPageShell}>
        <section
          className={cn(
            r2aPlainWhitePanel,
            "flex min-h-[220px] flex-col justify-center gap-3 px-6 py-8",
          )}
          role="status"
          aria-live="polite"
        >
          <p className="font-heading text-[20px] font-semibold leading-tight text-[var(--r2a-ink)]">
            正在整理结果
          </p>
          <p className="max-w-[520px] text-[13.5px] leading-relaxed text-[var(--r2a-ink-muted)]">
            正在读取本次整理内容，请稍候。
          </p>
        </section>
      </div>
    </div>
  );
}

export function ResultPageView({ data }: { data?: ParseResultPreview }) {
  const [d, setD] = useState<ParseResultPreview | null>(() => data ?? null);
  const [resultStatusHint, setResultStatusHint] =
    useState<ResultStatusHint>(readResultStatusHint);
  const [resultAuthMode, setResultAuthMode] =
    useState<ResultAuthMode>("idle");

  useEffect(() => {
    if (data) {
      queueMicrotask(() => setD(data));
      return;
    }
    const fromSession = readLastAnalyzeResultFromSession();
    queueMicrotask(() => setD(fromSession ?? mockParseResult));
  }, [data]);

  useEffect(() => {
    if (!d) return;
    queueMicrotask(() => setResultStatusHint(readResultStatusHint(d)));
  }, [d]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const user = await getCurrentUser(createClient());
        if (!cancelled) setResultAuthMode(user ? "cloud" : "guest");
      } catch (err) {
        console.error("[ResultPageView] getCurrentUser failed:", err);
        if (!cancelled) setResultAuthMode("guest");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [tab, setTab] = useState<TabId>("summary");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogResetKey, setSaveDialogResetKey] = useState(0);
  const saveDialogConfirmRequestedRef = useRef(false);
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      (data?.actionItems ?? []).map((a) => [a.id, a.isDone]),
    ),
  );

  useEffect(() => {
    if (!d) return;
    queueMicrotask(() => {
      setChecks(
        Object.fromEntries(d.actionItems.map((a) => [a.id, a.isDone])),
      );
    });
  }, [d]);

  const viewData = d ?? mockParseResult;

  const doneCount = useMemo(
    () => viewData.actionItems.filter((a) => checks[a.id]).length,
    [viewData.actionItems, checks],
  );

  const metaLine = useMemo(() => {
    const src =
      viewData.sourceName ?? viewData.sourceLabel.replace(/^来源[：:]\s*/, "");
    const tagPart =
      viewData.tags && viewData.tags.length
        ? `标签：${viewData.tags.join(" · ")}`
        : "标签：—";
    const datePart = viewData.createdAtDisplay
      ? `创建时间：${viewData.createdAtDisplay}`
      : "创建时间：—";
    const wc = `字数：${formatWordCount(viewData.wordCount)}`;
    return `来源：${src}     ${tagPart}     ${datePart}     ${wc}`;
  }, [viewData]);

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!saveDialogOpen) return;

    const syncLastDialogButtonClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (!button?.closest('[role="dialog"]')) return;
      saveDialogConfirmRequestedRef.current =
        button.textContent?.trim() === "保存到项目";
    };

    document.addEventListener("click", syncLastDialogButtonClick, true);
    return () => {
      document.removeEventListener("click", syncLastDialogButtonClick, true);
    };
  }, [saveDialogOpen]);

  const handleSaveDialogOpenChange = (open: boolean) => {
    if (open) {
      saveDialogConfirmRequestedRef.current = false;
      setSaveDialogOpen(true);
      return;
    }

    setSaveDialogOpen(false);
    queueMicrotask(() => {
      const nextStatus = readResultStatusHint(d);
      if (
        nextStatus === "project-saved" ||
        (saveDialogConfirmRequestedRef.current &&
          resultAuthMode === "cloud" &&
          resultStatusHint === "temporary")
      ) {
        setResultStatusHint("project-saved");
      } else {
        setResultStatusHint(nextStatus);
      }
      saveDialogConfirmRequestedRef.current = false;
    });
  };

  if (!d) {
    return <ResultPageLoadingState />;
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className={r2aContentPageShell}>
        <header className={r2aContentPageHeaderRow}>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="font-heading text-[28px] font-semibold leading-[1.3] text-[var(--r2a-ink)]">
              {viewData.title}
            </h1>
            <p className="text-[12px] font-normal leading-relaxed text-[var(--r2a-ink-muted)]">
              {metaLine}
            </p>
          </div>
          <div className={r2aContentPageHeaderActions}>
            <button
              type="button"
              className={r2aBtnSecondary}
              onClick={() => toast.info("编辑功能暂未开放")}
            >
              <Pencil className="size-5 shrink-0 text-current" aria-hidden />
              编辑
            </button>
            <button
              type="button"
              onClick={() => toast.info("导出功能暂未开放")}
              className={r2aBtnSecondary}
            >
              <Download className="size-5 shrink-0 text-current" aria-hidden />
              导出
            </button>
            {resultStatusHint !== "project-saved" ? (
              <button
                type="button"
                onClick={() => {
                  setSaveDialogResetKey((k) => k + 1);
                  setSaveDialogOpen(true);
                }}
                className={r2aBtnPrimary}
              >
                保存到项目
              </button>
            ) : null}
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
                      await navigator.clipboard.writeText(window.location.href);
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
        </header>

        {resultStatusHint === "temporary" && resultAuthMode !== "idle" ? (
          <p
            className="mb-1 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-hover)] px-4 py-2.5 text-[13px] font-normal text-[var(--r2a-ink-secondary)] shadow-[var(--r2a-shadow-soft)]"
            role="status"
          >
            {resultAuthMode === "cloud"
              ? "当前结果可保存到项目，便于后续回看和沉淀。"
              : "未登录状态下，内容只会保存在当前浏览器。"}
          </p>
        ) : null}
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
                  {viewData.summary}
                </p>
              </NoteSectionCard>

              <KeyInsightsSection insights={viewData.keyInsights} />

              <ActionChecklistSection
                items={viewData.actionItems}
                checks={checks}
                doneCount={doneCount}
                onToggle={toggleCheck}
              />

              <KnowledgeCardsSection
                title="知识卡片（自动生成）"
                cards={viewData.knowledgeCards}
                footerSlot={
                  <button
                    type="button"
                    className={r2aKnowledgeAddSlotShell}
                    onClick={() =>
                      toast.info("自定义知识卡片功能暂未开放")
                    }
                  >
                    +&nbsp;&nbsp;添加自定义卡片
                  </button>
                }
              />
            </div>
          ) : (
            <section
              className={cn(
                r2aPlainWhitePanel,
                "flex w-full flex-col gap-3 p-8",
              )}
              aria-label="原文对照"
              role="tabpanel"
            >
              {viewData.rawContent?.trim() ? (
                <>
                  <h2 className="font-heading text-base font-semibold text-[var(--r2a-ink)]">
                    原始内容
                  </h2>
                  <div className="max-h-[min(400px,55vh)] min-h-[120px] overflow-y-auto pr-1">
                    <p className="whitespace-pre-wrap text-[14px] font-normal leading-6 text-[var(--r2a-ink-secondary)]">
                      {viewData.rawContent}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[14px] leading-relaxed text-[var(--r2a-ink-muted)]">
                  原文对照内容占位。下一阶段可在此展示整理来源全文或粘贴原文。
                </p>
              )}
            </section>
          )}
        </div>

        <SaveToProjectDialog
          key={saveDialogResetKey}
          open={saveDialogOpen}
          onOpenChange={handleSaveDialogOpenChange}
          initialAuthMode={resultAuthMode}
        />
      </div>
    </div>
  );
}
