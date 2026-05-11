"use client";

import { Download, Link2, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { SaveToProjectDialog } from "./save-to-project-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockParseResult } from "@/data/result.mock";
import type { KnowledgeCard, ParseResultPreview } from "@/types";

import {
  r2aBtnIconHeader,
  r2aBtnSecondary,
  r2aContentPageHeaderActions,
  r2aContentPageHeaderRow,
  r2aKnowledgeAddSlotShell,
  r2aKnowledgeMiniCardShell,
  r2aPageSectionStackGap,
  r2aPageShell1020,
  r2aPlainWhitePanel,
  r2aSectionCardShell,
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

function tagAccent(tag?: string) {
  if (tag === "指标")
    return "text-[#1F8557]";
  return "text-[#4F46E5]";
}

function KnowledgeMiniCard({ card }: { card: KnowledgeCard }) {
  return (
    <div className={r2aKnowledgeMiniCardShell}>
      {card.tag ? (
        <span
          className={cn(
            "text-[11px] font-medium leading-none",
            tagAccent(card.tag),
          )}
        >
          {card.tag}
        </span>
      ) : null}
      <h4 className="text-[13px] font-normal leading-tight text-[#121212]">
        {card.title}
      </h4>
      <p className="text-[12px] font-normal leading-relaxed text-[#939393]">
        {card.content}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  headerRight,
  children,
  className,
}: {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(r2aSectionCardShell, className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-[#121212]">{title}</h3>
        {headerRight}
      </div>
      {children}
    </section>
  );
}

export function ResultPageView({ data }: { data?: ParseResultPreview }) {
  const d = data ?? mockParseResult;
  const [tab, setTab] = useState<TabId>("summary");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogResetKey, setSaveDialogResetKey] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(d.actionItems.map((a) => [a.id, a.isDone])),
  );

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
    <div className="flex min-h-full w-full flex-1 flex-col bg-[#F4F5F9]">
      <div className={r2aPageShell1020}>
        <header className={r2aContentPageHeaderRow}>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="text-[26px] font-semibold leading-tight text-[#121212]">
              {d.title}
            </h1>
            <p className="text-[12px] font-normal leading-relaxed text-[#939393]">
              {metaLine}
            </p>
          </div>
          <div className={r2aContentPageHeaderActions}>
            <button
              type="button"
              className={r2aBtnSecondary}
              onClick={() => toast.info("编辑功能暂未开放")}
            >
              <Pencil className="size-5 shrink-0 text-[#363636]" aria-hidden />
              编辑
            </button>
            <button
              type="button"
              onClick={() => toast.info("导出功能暂未开放")}
              className={r2aBtnSecondary}
            >
              <Download className="size-5 shrink-0 text-[#363636]" aria-hidden />
              导出
            </button>
            <button
              type="button"
              onClick={() => {
                setSaveDialogResetKey((k) => k + 1);
                setSaveDialogOpen(true);
              }}
              className={r2aBtnSecondary}
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
                  <Link2 className="size-4 text-[#939393]" aria-hidden />
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
              <SectionCard title="一句话总结">
                <p className="max-w-[770px] text-[14px] font-normal leading-relaxed text-[#363636]">
                  {d.summary}
                </p>
              </SectionCard>

              <SectionCard title="核心观点">
                <ul className="flex flex-col gap-3">
                  {d.keyInsights.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-[14px] font-normal leading-relaxed text-[#363636]"
                    >
                      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-semibold text-[#4F46E5]">
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard
                title="行动清单"
                headerRight={
                  <span className="text-[12px] font-normal text-[#939393]">
                    {doneCount}/{d.actionItems.length} 完成
                  </span>
                }
              >
                <ul className="flex flex-col gap-2.5">
                  {d.actionItems.map((item) => (
                    <li key={item.id} className="flex items-start gap-2.5">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checks[item.id]}
                        onClick={() => toggleCheck(item.id)}
                        className={cn(
                          "mt-0.5 size-4 shrink-0 rounded border border-[#E5E7EB] bg-white transition-colors",
                          checks[item.id] && "border-[#4F46E5] bg-[#4F46E5]",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[14px] font-normal leading-tight text-[#121212]",
                          checks[item.id] && "text-[#939393] line-through",
                        )}
                      >
                        {item.content}
                      </span>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard title="知识卡片（自动生成）">
                <div className="flex flex-col gap-3 lg:flex-row">
                  {d.knowledgeCards.map((c) => (
                    <KnowledgeMiniCard key={c.id} card={c} />
                  ))}
                  <button
                    type="button"
                    className={r2aKnowledgeAddSlotShell}
                    onClick={() =>
                      toast.info("自定义知识卡片功能暂未开放")
                    }
                  >
                    +&nbsp;&nbsp;添加自定义卡片
                  </button>
                </div>
              </SectionCard>
            </div>
          ) : (
            <section
              className={cn(r2aPlainWhitePanel, "p-8")}
              aria-label="原文对照"
              role="tabpanel"
            >
              <p className="text-[14px] leading-relaxed text-[#939393]">
                原文对照内容占位。下一阶段可在此展示解析来源全文或粘贴原文。
              </p>
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
