"use client";

import { Download, Link2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  resolveNoteSavedStatus,
} from "@/lib/local-saved-notes";
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

function formatWordCount(n: number | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("zh-CN");
}

export function ResultPageView({ data }: { data?: ParseResultPreview }) {
  const [d, setD] = useState<ParseResultPreview>(() => data ?? mockParseResult);
  const [resultStatusHint, setResultStatusHint] = useState<
    "temporary" | "project-saved" | null
  >(null);

  useEffect(() => {
    if (data) {
      queueMicrotask(() => setD(data));
      return;
    }
    const fromSession = readLastAnalyzeResultFromSession();
    if (fromSession) queueMicrotask(() => setD(fromSession));
  }, [data]);

  useEffect(() => {
    const noteId = readLastAnalyzeNoteIdFromSession();
    if (!noteId) {
      queueMicrotask(() => setResultStatusHint(null));
      return;
    }
    const note = findLocalSavedNoteById(noteId);
    queueMicrotask(() => {
      if (note == null) {
        setResultStatusHint(null);
        return;
      }
      if (resolveNoteSavedStatus(note) === "temporary") {
        setResultStatusHint("temporary");
        return;
      }
      if (note.sourceContext === "project") {
        setResultStatusHint("project-saved");
        return;
      }
      setResultStatusHint(null);
    });
  }, [d]);

  const [tab, setTab] = useState<TabId>("summary");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogResetKey, setSaveDialogResetKey] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      (data ?? mockParseResult).actionItems.map((a) => [a.id, a.isDone]),
    ),
  );

  useEffect(() => {
    queueMicrotask(() => {
      setChecks(
        Object.fromEntries(d.actionItems.map((a) => [a.id, a.isDone])),
      );
    });
  }, [d]);

  const doneCount = useMemo(
    () => d.actionItems.filter((a) => checks[a.id]).length,
    [d.actionItems, checks],
  );

  const metaLine = useMemo(() => {
    const src = d.sourceName ?? d.sourceLabel.replace(/^来源[：:]\s*/, "");
    const tagPart =
      d.tags && d.tags.length
        ? `标签：${d.tags.join(" · ")}`
        : "标签：—";
    const datePart = d.createdAtDisplay
      ? `创建时间：${d.createdAtDisplay}`
      : "创建时间：—";
    const wc = `字数：${formatWordCount(d.wordCount)}`;
    return `来源：${src}     ${tagPart}     ${datePart}     ${wc}`;
  }, [d]);

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className={r2aContentPageShell}>
        <header className={r2aContentPageHeaderRow}>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="font-heading text-[28px] font-semibold leading-[1.3] text-[var(--r2a-ink)]">
              {d.title}
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

        {resultStatusHint === "temporary" ? (
          <p
            className="mb-1 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-hover)] px-4 py-2.5 text-[13px] font-normal text-[var(--r2a-ink-secondary)] shadow-[var(--r2a-shadow-soft)]"
            role="status"
          >
            已自动暂存，可保存到项目归档
          </p>
        ) : null}
        {resultStatusHint === "project-saved" ? (
          <p
            className="mb-1 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-success-bg)] px-4 py-2.5 text-[13px] font-normal text-[var(--r2a-ink-secondary)] shadow-[var(--r2a-shadow-soft)]"
            role="status"
          >
            已保存到项目
          </p>
        ) : null}

        <div className={cn("flex flex-col", r2aPageSectionStackGap)}>
          <div className={r2aTabListRow} role="tablist" aria-label="解析结果视图">
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
                  {d.summary}
                </p>
              </NoteSectionCard>

              <KeyInsightsSection insights={d.keyInsights} />

              <ActionChecklistSection
                items={d.actionItems}
                checks={checks}
                doneCount={doneCount}
                onToggle={toggleCheck}
              />

              <KnowledgeCardsSection
                title="知识卡片（自动生成）"
                cards={d.knowledgeCards}
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
              {d.rawContent?.trim() ? (
                <>
                  <h2 className="font-heading text-base font-semibold text-[var(--r2a-ink)]">
                    原始内容
                  </h2>
                  <p className="text-[13px] font-normal leading-normal text-[var(--r2a-ink-muted)]">
                    以下内容为原始输入内容，便于与 AI 总结结果对照查看。
                  </p>
                  <div className="max-h-[min(400px,55vh)] min-h-[120px] overflow-y-auto pr-1">
                    <p className="whitespace-pre-wrap text-[14px] font-normal leading-6 text-[var(--r2a-ink-secondary)]">
                      {d.rawContent}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[14px] leading-relaxed text-[var(--r2a-ink-muted)]">
                  原文对照内容占位。下一阶段可在此展示解析来源全文或粘贴原文。
                </p>
              )}
            </section>
          )}
        </div>

        <SaveToProjectDialog
          key={saveDialogResetKey}
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
        />
      </div>
    </div>
  );
}
