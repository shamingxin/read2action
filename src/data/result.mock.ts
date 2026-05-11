import type { ParseResultPreview } from "@/types";

/** 解析结果页展示数据（与 Figma「03-解析结果」示例对齐，可后续接真实解析） */
export const mockParseResult: ParseResultPreview = {
  title: "如何管理更好的个人成长系统",
  sourceLabel: "少数派",
  sourceName: "少数派",
  tags: ["成长", "习惯", "系统"],
  createdAtDisplay: "2024-05-20",
  wordCount: 2184,
  summary:
    "精益创业强调用「构建—衡量—学习」循环快速验证假设，以科学实验精神降低不确定性，并用可衡量的创新核算判断进展。",
  keyInsights: [
    "假设驱动：把信念写成可被证伪的假设。",
    "最小可行产品：用最小成本验证真实学习。",
    "创新核算：用可量化指标判断是否在取得真实进展。",
  ],
  actionItems: [
    {
      id: "r-a1",
      content: "写下本周要验证的一个关键假设",
      isDone: false,
    },
    {
      id: "r-a2",
      content: "定义最小实验与衡量指标",
      isDone: false,
    },
    {
      id: "r-a3",
      content: "安排一次复盘会议回顾学习",
      isDone: false,
    },
  ],
  knowledgeCards: [
    {
      id: "r-k1",
      title: "构建-衡量-学习 循环",
      content: "把学习闭环产品化，持续验证价值假设。",
      tag: "概念",
    },
    {
      id: "r-k2",
      title: "创新核算（Innovation Accounting）",
      content: "用可量化指标判断创新是否在取得真实进展。",
      tag: "指标",
    },
  ],
};
