"use client";

import Link from "next/link";
import { Download, Link2, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import type { KnowledgeCard, Note } from "@/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  r2aBtnIconHeader,
  r2aBtnSecondary,
  r2aContentPageHeaderActions,
  r2aContentPageHeaderRow,
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
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(note.actionItems.map((a) => [a.id, a.isDone])),
  );

  const doneCount = useMemo(
    () => note.actionItems.filter((a) => checks[a.id]).length,
    [note.actionItems, checks],
  );

  const metaLine = useMemo(() => {
    const src = note.sourceName ?? "—";
    const tagPart =
      note.tags.length > 0 ? `标签：${note.tags.join(" · ")}` : "标签：—";
    const datePart = `创建时间：${formatDetailDate(note.createdAt)}`;
    const wc = `字数：${formatWordCount(note.wordCount)}`;
    return `来源：${src}     ${tagPart}     ${datePart}     ${wc}`;
  }, [note]);

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[#F4F5F9]">
      <div className={r2aPageShell1020}>
        <nav
          className="flex flex-wrap items-center gap-1 text-[13px] text-[#939393]"
          aria-label="面包屑"
        >
          <Link
            href={`/projects/${projectId}`}
            className="font-medium text-[#363636] hover:text-[#121212]"
          >
            {projectName}
          </Link>
          <span className="text-[#D1D5DB]">/</span>
          <span className="max-w-[min(100%,48rem)] truncate text-[#939393]">
            {note.title}
          </span>
        </nav>

        <header className={r2aContentPageHeaderRow}>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="text-[26px] font-semibold leading-tight text-[#121212]">
              {note.title}
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
            <button type="button" className={r2aBtnSecondary}>
              <Download className="size-5 shrink-0 text-[#363636]" aria-hidden />
              导出
            </button>
            <button type="button" className={r2aBtnSecondary}>
              保存到项目
            </button>
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
              <SectionCard title="一句话总结">
                <p className="max-w-[770px] text-[14px] font-normal leading-relaxed text-[#363636]">
                  {note.summary}
                </p>
              </SectionCard>

              <SectionCard title="核心观点">
                <ul className="flex flex-col gap-3">
                  {note.keyInsights.map((line, i) => (
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
                    {doneCount}/{note.actionItems.length} 完成
                  </span>
                }
              >
                <ul className="flex flex-col gap-2.5">
                  {note.actionItems.map((item) => (
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

              <SectionCard title="知识卡片">
                {note.knowledgeCards.length > 0 ? (
                  <div className="flex flex-col gap-3 lg:flex-row">
                    {note.knowledgeCards.map((c) => (
                      <KnowledgeMiniCard key={c.id} card={c} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] text-[#939393]">暂无知识卡片</p>
                )}
              </SectionCard>

              <SectionCard title="方法论沉淀">
                <p className="text-[14px] leading-relaxed text-[#939393]">
                  此区域占位。后续可接入方法论卡片或自定义沉淀内容。
                </p>
              </SectionCard>

              <SectionCard title="原文摘录">
                <p className="whitespace-pre-wrap text-[14px] font-normal leading-relaxed text-[#363636]">
                  {note.rawContent}
                </p>
              </SectionCard>
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
              <h2 className="text-base font-semibold text-[#121212]">
                原始内容
              </h2>
              <p className="text-[13px] font-normal leading-normal text-[#939393]">
                以下内容为原始输入内容，便于与 AI 总结结果对照查看。
              </p>
              <div className="max-h-[min(400px,55vh)] min-h-[120px] overflow-y-auto pr-1">
                <p className="whitespace-pre-wrap text-[14px] font-normal leading-6 text-[#363636]">
                  {note.rawContent}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
