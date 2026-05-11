/**
 * Read2Action 全局 UI 收束（第九阶段）：与现有页面十六进制一致，供原生按钮等复用。
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

/* ─── 9.2 卡片 / 表面 token ─── */

export const r2aCardRadius = "rounded-[12px]";
export const r2aCardRadiusSm = "rounded-[10px]";
export const r2aCardBorder = "border border-[#E5E7EB]";
/** 与既有 r2aSurfaceShadow 数值一致，语义上指「白卡片投影」 */
export const r2aCardShadow = "shadow-[0_2px_12px_rgba(0,0,0,0.05)]";

/** SectionCard / 同类白底内容卡（含标题行间距） */
export const r2aSectionCardShell = cn(
  "flex w-full flex-col gap-3 bg-white",
  r2aCardRadius,
  r2aCardBorder,
  "p-5",
  r2aCardShadow,
);

/** 知识卡片小卡（结果页 / 详情页共用尺度） */
export const r2aKnowledgeMiniCardShell = cn(
  "flex min-h-[128px] flex-1 flex-col gap-2 bg-white",
  r2aCardRadiusSm,
  r2aCardBorder,
  "p-3.5",
);

/** 无分区标题的白底面板（如 Tab 下占位区、原文区外层） */
export const r2aPlainWhitePanel = cn(
  r2aCardRadius,
  r2aCardBorder,
  "bg-white",
  r2aCardShadow,
);

/* ─── 9.2 结果页 / 详情页 顶栏与 Tab ─── */

export const r2aContentPageHeaderRow =
  "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between";

export const r2aContentPageHeaderActions =
  "flex shrink-0 flex-wrap items-center gap-2.5 lg:justify-end";

export const r2aTabListRow = "flex gap-6";

export const r2aTabLabelActive = "text-[14px] font-semibold text-[#121212]";
export const r2aTabLabelInactive =
  "text-[14px] font-medium text-[#939393] hover:text-[#363636]";

/** 选中态下划线：宽度随 Tab 文案（父级用 inline-flex + items-stretch） */
export const r2aTabUnderlineOn =
  "h-0.5 w-full shrink-0 rounded-sm bg-[#4F46E5]";
export const r2aTabUnderlineOff =
  "h-0.5 w-full shrink-0 rounded-sm bg-transparent";

export const r2aBtnPrimary =
  "inline-flex h-11 shrink-0 items-center justify-center rounded-[12px] bg-[#4F46E5] text-[14px] font-semibold text-white transition-colors hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/25";

export const r2aBtnPrimaryPill =
  "inline-flex h-11 min-w-[134px] shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[14px] font-semibold text-white transition-colors hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/25";

export const r2aBtnSecondary =
  "inline-flex h-11 items-center gap-1 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#363636] transition-colors hover:border-[#D1D5DB] hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/15";

export const r2aBtnIconHeader =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white text-[18px] text-[#939393] transition-colors hover:bg-[#F9FAFB] data-popup-open:bg-[#FAFAFC]";

export const r2aPlusCircleButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5FA] text-[#939393] transition-colors hover:bg-[#EEEEF5]";

/** 与 r2aCardShadow 同值，供输入条等非 Section 表面复用 */
export const r2aSurfaceShadow = r2aCardShadow;

/** 结果页「添加自定义卡片」占位格，与知识小卡同高 */
export const r2aKnowledgeAddSlotShell = cn(
  "flex min-h-[128px] min-w-0 flex-1 items-center justify-center border border-dashed border-[#E5E7EB] bg-[#FAFAFC] px-4 text-[13px] font-normal text-[#939393] transition-colors hover:border-[#D1D5DB] hover:bg-[#F4F5F9]",
  r2aCardRadiusSm,
);

/* 首页：在 1020 外壳内保持约 720 内容列居中 */
export const r2aHomeInnerColumn = "mx-auto w-full max-w-[720px] flex flex-col gap-4";
