"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";

import type { ActionItem, KnowledgeCard } from "@/types";

import {
  r2aKnowledgeMiniCardShell,
  r2aSectionCardShell,
} from "@/lib/r2a-ui-classes";
import { cn } from "@/lib/utils";

const sectionTitleClass =
  "font-heading text-[13px] font-medium text-[var(--r2a-ink-muted)]";

const circledNumbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

export function NoteSectionCard({
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
        <h3 className={sectionTitleClass}>{title}</h3>
        {headerRight}
      </div>
      {children}
    </section>
  );
}

export function KeyInsightsSection({ insights }: { insights: string[] }) {
  return (
    <NoteSectionCard title="核心观点">
      <ol className="flex flex-col">
        {insights.map((line, index) => (
          <li
            key={`${index}-${line}`}
            className="flex items-start gap-3.5 border-b border-[var(--r2a-hairline-soft)] py-3 last:border-b-0 last:pb-0 first:pt-0"
          >
            <span
              className="font-heading shrink-0 text-[17px] font-medium leading-relaxed text-[var(--r2a-accent-ink)]"
              aria-hidden
            >
              {circledNumbers[index] ?? `${index + 1}.`}
            </span>
            <span className="font-heading text-[17px] font-semibold leading-snug text-[var(--r2a-ink)]">
              {line}
            </span>
          </li>
        ))}
      </ol>
    </NoteSectionCard>
  );
}

export function KnowledgeMiniCard({ card }: { card: KnowledgeCard }) {
  return (
    <div className={r2aKnowledgeMiniCardShell}>
      {card.tag ? (
        <span className="font-heading text-[11px] font-medium leading-none text-[var(--r2a-accent-ink)]">
          {card.tag}
        </span>
      ) : null}
      <h4 className="font-heading text-[15px] font-semibold leading-snug text-[var(--r2a-ink)]">
        {card.title}
      </h4>
      <p className="text-[13px] font-normal leading-relaxed text-[var(--r2a-ink-secondary)]">
        {card.content}
      </p>
    </div>
  );
}

export function ActionChecklistSection({
  items,
  checks,
  doneCount,
  onToggle,
}: {
  items: ActionItem[];
  checks: Record<string, boolean>;
  doneCount: number;
  onToggle: (id: string) => void;
}) {
  return (
    <NoteSectionCard
      title="行动清单"
      headerRight={
        <span className="font-mono text-[12px] font-normal text-[var(--r2a-ink-muted)]">
          {doneCount}/{items.length} 完成
        </span>
      }
    >
      <ul className="flex flex-col">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2.5 border-b border-dashed border-[var(--r2a-hairline)] py-3 last:border-b-0 last:pb-0 first:pt-0"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={checks[item.id]}
              onClick={() => onToggle(item.id)}
              className={cn(
                "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-[var(--r2a-radius-xs)] border-[1.5px] border-[var(--r2a-ink-muted)] bg-[var(--r2a-surface)] text-[var(--r2a-canvas-soft)] transition-colors duration-150 ease-out",
                checks[item.id] &&
                  "border-[var(--r2a-accent-ink)] bg-[var(--r2a-accent-ink)]",
              )}
            >
              {checks[item.id] ? (
                <Check className="size-3" strokeWidth={2.4} aria-hidden />
              ) : null}
            </button>
            <span
              className={cn(
                "text-[14.5px] font-normal leading-relaxed text-[var(--r2a-ink)]",
                checks[item.id] &&
                  "text-[var(--r2a-ink-muted)] line-through decoration-[var(--r2a-ink-faint)]",
              )}
            >
              {checks[item.id] ? (
                <span className="sr-only">已完成：</span>
              ) : null}
              {item.content}
            </span>
          </li>
        ))}
      </ul>
    </NoteSectionCard>
  );
}

export function KnowledgeCardsSection({
  cards,
  title = "知识卡片",
  emptySlot,
  footerSlot,
}: {
  cards: KnowledgeCard[];
  title?: string;
  emptySlot?: ReactNode;
  footerSlot?: ReactNode;
}) {
  return (
    <NoteSectionCard title={title}>
      {cards.length > 0 || footerSlot ? (
        <div className="flex flex-col gap-3 lg:flex-row">
          {cards.map((card) => (
            <KnowledgeMiniCard key={card.id} card={card} />
          ))}
          {footerSlot}
        </div>
      ) : (
        emptySlot
      )}
    </NoteSectionCard>
  );
}
