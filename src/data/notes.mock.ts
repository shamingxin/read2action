import type { Note } from "@/types";

const t = (iso: string) => iso;

export const mockNotes: Note[] = [
  {
    id: "note-growth",
    projectId: "sha",
    title: "如何管理更好的个人成长系统",
    sourceType: "article",
    sourceName: "Medium",
    summary: "用系统而非意志力驱动成长：目标、复盘与习惯闭环。",
    rawContent:
      "个人成长需要可重复的系统：设定清晰北极星指标、每周复盘、把大目标拆成可执行习惯。",
    keyInsights: ["系统优于意志力", "复盘频率决定迭代速度"],
    actionItems: [
      { id: "a1", content: "写下本周 3 个关键结果", isDone: false },
      { id: "a2", content: "固定周日 30 分钟复盘", isDone: true },
    ],
    knowledgeCards: [
      {
        id: "k1",
        title: "成长飞轮",
        content: "行动 → 反馈 → 调整 → 再行动。",
        tag: "方法论",
      },
    ],
    tags: ["成长", "效率"],
    wordCount: 420,
    createdAt: t("2026-04-20T10:00:00.000Z"),
    updatedAt: t("2026-04-21T09:00:00.000Z"),
  },
  {
    id: "note-figma-config",
    projectId: "sha",
    title: "Figma Config 2023: Keynote Summary",
    sourceType: "video",
    sourceName: "YouTube",
    summary: "设计工具与协作的未来：变量、Dev Mode 与开放生态。",
    rawContent: "Keynote 重点摘录：设计系统变量、开发者交付链路、插件生态。",
    keyInsights: ["变量是规模化设计的基础", "设计与工程对齐缩短交付周期"],
    actionItems: [
      { id: "a3", content: "整理团队变量命名规范", isDone: false },
    ],
    knowledgeCards: [
      {
        id: "k2",
        title: "Variables",
        content: "用变量表达主题、密度与品牌 token。",
        tag: "设计系统",
      },
    ],
    tags: ["Figma", "设计系统"],
    wordCount: 890,
    createdAt: t("2026-04-18T14:30:00.000Z"),
    updatedAt: t("2026-04-18T14:30:00.000Z"),
  },
  {
    id: "note-bml",
    projectId: "sha",
    title: "The Build–Measure–Learn Loop",
    sourceType: "article",
    sourceName: "The Lean Startup",
    summary: "用实验验证假设，缩短从想法到认知的周期。",
    rawContent: "Build–Measure–Learn 是精益创业的核心反馈环。",
    keyInsights: ["假设必须可证伪", "度量要为决策服务"],
    actionItems: [
      { id: "a4", content: "为当前功能写一条可验证假设", isDone: false },
    ],
    knowledgeCards: [
      {
        id: "k3",
        title: "MVP",
        content: "最小可行产品用于学习，而非一次性完美交付。",
        tag: "产品",
      },
    ],
    tags: ["精益", "产品"],
    wordCount: 560,
    createdAt: t("2026-04-15T11:00:00.000Z"),
    updatedAt: t("2026-04-16T08:00:00.000Z"),
  },
  {
    id: "note-ai-era",
    projectId: "sha",
    title: "Designing for the AI Era: Principles and Patterns",
    sourceType: "article",
    summary: "AI 时代界面设计：可解释性、可控性与渐进披露。",
    rawContent: "摘录：用户需要理解 AI 在做什么，并能随时介入或撤销。",
    keyInsights: ["可解释性建立信任", "默认安全与人工兜底"],
    actionItems: [
      { id: "a5", content: "梳理产品中 3 处需补充解释文案", isDone: false },
    ],
    knowledgeCards: [
      {
        id: "k4",
        title: "Human-in-the-loop",
        content: "关键节点保留人类确认与编辑权。",
        tag: "AI UX",
      },
    ],
    tags: ["AI", "UX"],
    wordCount: 1200,
    createdAt: t("2026-04-10T09:00:00.000Z"),
    updatedAt: t("2026-04-10T09:00:00.000Z"),
  },
  {
    id: "note-meeting-q3",
    projectId: "project-one",
    title: "Meeting Notes: Q3 Product Roadmap Alignment",
    sourceType: "note",
    summary: "Q3 聚焦留存与协作，暂缓国际化扩张。",
    rawContent: "会议记录：各方对 Q3 OKR 的对齐与风险项。",
    keyInsights: ["留存优先于拉新", "协作场景需端到端闭环"],
    actionItems: [
      { id: "a6", content: "输出 Q3 里程碑草案", isDone: false },
    ],
    knowledgeCards: [],
    tags: ["会议", "路线图"],
    wordCount: 640,
    createdAt: t("2026-04-08T16:00:00.000Z"),
    updatedAt: t("2026-04-08T16:00:00.000Z"),
  },
  {
    id: "note-saas-arch",
    projectId: "sha",
    title: "The Architecture of Modern SaaS Applications",
    sourceType: "article",
    summary: "多租户、计费与事件驱动在 SaaS 架构中的常见模式。",
    rawContent: "现代 SaaS 的分层：身份、租户隔离、用量计量、异步任务。",
    keyInsights: ["租户隔离是底线", "异步解耦峰值写入"],
    actionItems: [
      { id: "a7", content: "画一张当前服务边界草图", isDone: false },
    ],
    knowledgeCards: [
      {
        id: "k5",
        title: "Tenant isolation",
        content: "数据面与控制面分离，降低串租风险。",
        tag: "架构",
      },
    ],
    tags: ["SaaS", "架构"],
    wordCount: 2100,
    createdAt: t("2026-04-05T12:00:00.000Z"),
    updatedAt: t("2026-04-05T12:00:00.000Z"),
  },
  {
    id: "note-growth-metrics",
    projectId: "baidu-wenku",
    title: "从 0 到 1 搭建增长系统的关键指标",
    sourceType: "article",
    summary: "北极星指标 + AARRR 漏斗，避免指标通胀。",
    rawContent: "增长系统要先定义唯一北极星，再拆激活/留存/推荐等环节。",
    keyInsights: ["少而准的指标集", "实验文化比工具更重要"],
    actionItems: [
      { id: "a8", content: "定义产品北极星指标 v0", isDone: false },
    ],
    knowledgeCards: [],
    tags: ["增长", "数据"],
    wordCount: 780,
    createdAt: t("2026-04-01T10:00:00.000Z"),
    updatedAt: t("2026-04-01T10:00:00.000Z"),
  },
  {
    id: "note-enterprise-interview",
    projectId: "industrial",
    title: "用户访谈记录：企业版核心需求",
    sourceType: "user_note",
    summary: "企业客户关注审计、权限粒度与私有化部署选项。",
    rawContent: "访谈速记：安全合规、SSO、细粒度角色与审计日志。",
    keyInsights: ["合规是采购前提", "权限模型要可解释"],
    actionItems: [
      { id: "a9", content: "整理需求优先级表", isDone: false },
    ],
    knowledgeCards: [],
    tags: ["访谈", "B2B"],
    wordCount: 510,
    createdAt: t("2026-03-28T15:00:00.000Z"),
    updatedAt: t("2026-03-28T15:00:00.000Z"),
  },
];

export function getNotesByProjectId(projectId: string): Note[] {
  return mockNotes.filter((n) => n.projectId === projectId);
}

export function getNoteById(id: string): Note | undefined {
  return mockNotes.find((n) => n.id === id);
}
