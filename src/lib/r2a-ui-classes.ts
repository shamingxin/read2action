/**
 * Read2Action 全局 UI 收束（1.4-B）：与 warm-restrained editorial token 对齐。
 * 不改变路由与业务，仅统一 class 片段。
 */

import { cn } from "@/lib/utils";

/* ─── 9.2 页面容器（1020 体系）─── */

export const r2aPageMaxW1020 = "max-w-[1020px]";
export const r2aPagePadX = "px-6";
/** 内容页顶底留白统一 */
export const r2aPagePadY = "pt-8 pb-10";
/** 页面主纵向区块间距（面包屑 / 标题区 / 下方内容列之间） */
export const r2aPageBlockGap = "gap-8";
/** 标题区下方 Tab + 卡片列内部间距 */
export const r2aPageSectionStackGap = "gap-5";

/** 1020 内容页外壳：宽度 + 左右留白 + 顶底 + 主区块纵向间距 */
export const r2aPageShell1020 = cn(
  "mx-auto flex w-full flex-col",
  r2aPageMaxW1020,
  r2aPagePadX,
  r2aPagePadY,
  r2aPageBlockGap,
);

/** 结果页 / 笔记详情页：较窄阅读宽度，宽屏不无限拉伸；小屏仍 w-full 响应 */
export const r2aContentPageShell = cn(
  "mx-auto flex w-full max-w-[960px] flex-col",
  r2aPagePadX,
  r2aPagePadY,
  r2aPageBlockGap,
);

/* ─── 9.2 卡片 / 表面 token ─── */

export const r2aCardRadius = "rounded-[var(--r2a-radius-lg)]";
export const r2aCardRadiusSm = "rounded-[var(--r2a-radius-sm)]";
export const r2aCardBorder = "border border-[var(--r2a-hairline)]";
/** 与既有 r2aSurfaceShadow 数值一致，语义上指「白卡片投影」 */
export const r2aCardShadow = "shadow-[var(--r2a-shadow-soft)]";

/** SectionCard / 同类白底内容卡（含标题行间距） */
export const r2aSectionCardShell = cn(
  "flex w-full flex-col gap-3 bg-[var(--r2a-surface)]",
  r2aCardRadius,
  r2aCardBorder,
  "p-6",
  r2aCardShadow,
);

/** 知识卡片小卡（结果页 / 详情页共用尺度） */
export const r2aKnowledgeMiniCardShell = cn(
  "flex min-h-[128px] flex-1 flex-col gap-2 bg-[var(--r2a-canvas-soft)]",
  r2aCardRadiusSm,
  r2aCardBorder,
  "px-5 py-[18px]",
);

/** 无分区标题的白底面板（如 Tab 下占位区、原文区外层） */
export const r2aPlainWhitePanel = cn(
  r2aCardRadius,
  r2aCardBorder,
  "bg-[var(--r2a-surface)]",
  r2aCardShadow,
);

/* ─── 9.2 结果页 / 详情页 顶栏与 Tab ─── */

export const r2aContentPageHeaderRow =
  "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between";

export const r2aContentPageHeaderActions =
  "flex shrink-0 flex-wrap items-center gap-2.5 lg:justify-end";

export const r2aTabListRow = "flex gap-6";

export const r2aTabLabelActive = "text-[13.5px] font-medium text-[var(--r2a-ink)]";
export const r2aTabLabelInactive =
  "text-[13.5px] font-normal text-[var(--r2a-ink-muted)] transition-colors hover:text-[var(--r2a-ink-secondary)]";

/** 选中态下划线：宽度随 Tab 文案（父级用 inline-flex + items-stretch） */
export const r2aTabUnderlineOn =
  "h-0.5 w-full shrink-0 rounded-sm bg-[var(--r2a-ink)]";
export const r2aTabUnderlineOff =
  "h-0.5 w-full shrink-0 rounded-sm bg-transparent";

export const r2aBtnPrimary =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-[var(--r2a-radius-button)] bg-[var(--r2a-ink)] px-4 text-[14px] font-medium text-[var(--r2a-canvas-soft)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-ink-secondary)] active:scale-[0.98] focus-visible:outline-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-[var(--r2a-ink)]";

export const r2aBtnPrimaryPill =
  "inline-flex h-10 min-w-[120px] shrink-0 items-center justify-center rounded-[var(--r2a-radius-button)] bg-[var(--r2a-ink)] px-4 text-[14px] font-medium text-[var(--r2a-canvas-soft)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-ink-secondary)] active:scale-[0.98] focus-visible:outline-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-[var(--r2a-ink)]";

export const r2aBtnSecondary =
  "inline-flex h-10 items-center gap-1 rounded-[var(--r2a-radius-button)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-4 text-[14px] font-medium text-[var(--r2a-ink-secondary)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)] active:scale-[0.98] focus-visible:outline-none";

export const r2aBtnIconHeader =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--r2a-radius-md)] border border-[var(--r2a-hairline)] bg-transparent text-[18px] text-[var(--r2a-ink-muted)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)] data-popup-open:bg-[var(--r2a-hover)]";

export const r2aPlusCircleButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] text-[var(--r2a-ink-muted)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)]";

/** 与 r2aCardShadow 同值，供输入条等非 Section 表面复用 */
export const r2aSurfaceShadow = r2aCardShadow;

/** 结果页「添加自定义卡片」占位格，与知识小卡同高 */
export const r2aKnowledgeAddSlotShell = cn(
  "flex min-h-[128px] min-w-0 flex-1 items-center justify-center border border-dashed border-[var(--r2a-hairline)] bg-[var(--r2a-canvas-soft)] px-4 text-[13px] font-normal text-[var(--r2a-ink-faint)] transition-colors duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink-muted)]",
  r2aCardRadiusSm,
);

/* 首页：在 1020 外壳内保持约 720 内容列居中 */
export const r2aHomeInnerColumn = "mx-auto w-full max-w-[720px] flex flex-col gap-4";
