# Read2Action Cursor Rules

> 用途：适合放入 Cursor 项目中，帮助 Cursor Agent 理解 Read2Action 项目背景、功能边界、设计风格和代码生成规则。  
> 当前版本：v0.6  
> 后续可拆分到 `.cursor/rules/` 目录中使用。

---

## 1. 项目背景

Read2Action 是一个 AI 知识整理与行动转化工具。

它帮助用户将文本、链接、笔记或个人想法转化为结构化笔记，并保存到项目中，方便后续查看、复用和沉淀。

当前是 1.0 MVP 阶段，目标是先完成可运行的 Web App 原型，不追求复杂功能。

---

## 2. 产品定位

### 一句话定位

> Read2Action 是一个帮助用户将文本、链接、笔记内容快速转化为结构化笔记，并沉淀到项目中的 AI 知识工具。

### 产品价值链

```text
收藏内容 → 理解内容 → 提炼行动 → 沉淀知识 → 后续复用
```

### 1.0 主链路

```text
输入内容 → AI 解析 → 查看解析结果 → 保存到项目 → 在项目中查看笔记 → 进入笔记详情页阅读和复用
```

---

## 3. 功能边界

### 3.1 1.0 必做页面

1. 首页 / 输入页
2. AI 解析中页
3. 解析结果页
4. 项目内笔记列表页
5. 笔记详情页：内容总结 Tab
6. 笔记详情页：原文对照 Tab

### 3.2 1.0 必做功能

- 左侧固定侧边栏
- 新建笔记入口
- 搜索入口
- 项目列表
- 最近记录
- 用户信息区
- 统一大输入框
- 开始解析
- 解析中状态
- 结果展示
- 保存到项目
- 项目内笔记列表
- 笔记详情查看
- Tab 切换

### 3.3 1.0 暂不做功能

不要实现以下功能，除非用户明确要求进入 2.0：

- 方法论生成器
- 多笔记组合生成
- 复杂知识图谱
- AI 聊天式知识库
- 连续追问
- 多人协作
- 付费系统
- 登录注册
- 手机 App
- 微信登录
- 浏览器插件
- RSS 订阅
- 自动解析所有平台全文
- 完整小红书 / B站 / 公众号抓取
- 复杂标签管理
- 复杂卡片管理
- 多视图切换

---

## 4. 信息结构

### 4.1 数据对象关系

```text
Project 项目
└── Note 笔记
    ├── raw_content 原始内容
    ├── summary 一句话总结
    ├── key_insights 核心观点
    ├── action_items 行动清单
    └── knowledge_cards 知识卡片
```

### 4.2 建议 TypeScript 类型

```ts
export type SourceType =
  | "article"
  | "video"
  | "xiaohongshu"
  | "user_note"
  | "other";

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  sourceType: SourceType;
  sourceUrl?: string;
  rawContent: string;
  summary: string;
  keyInsights: string[];
  actionItems: ActionItem[];
  knowledgeCards: KnowledgeCard[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  noteId: string;
  content: string;
  description?: string;
  timeType?: "today" | "this_week" | "long_term";
  isDone: boolean;
  createdAt: string;
}

export interface KnowledgeCard {
  id: string;
  noteId: string;
  title: string;
  concept: string;
  example?: string;
  useCase?: string;
  tag?: string;
  createdAt: string;
}
```

---

## 5. 设计风格

### 5.1 视觉关键词

```text
轻量 / 克制 / 清晰 / 理性 / 高级感 / AI 辅助感 / 知识工具感 / 适合长期使用 / 不过度赛博 / 白底 + 轻紫蓝点缀
```

### 5.2 参考产品

- Cursor
- Notion
- Claude Code
- ChatGPT
- Linear
- Craft

### 5.3 色彩建议

```ts
const colors = {
  primary: "#4F46E5",
  primarySoft: "#6366F1",
  background: "#F7F7FB",
  backgroundAlt: "#F8F8FC",
  card: "#FFFFFF",
  textPrimary: "#171717",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  success: "#22C55E",
  warning: "#F59E0B",
  info: "#3B82F6",
};
```

### 5.4 UI 规则

- 页面背景使用柔和浅灰 / 浅紫白。
- 内容区域以白色卡片为主。
- 阴影轻，不要厚重。
- 圆角统一。
- 边框使用浅灰。
- 图标使用线性图标。
- 不使用大面积高饱和渐变。
- 不做过度赛博风格。
- 保持真实 SaaS 产品质感。

---

## 6. 页面文案规则

### 正确文案

- 保存到项目
- 项目
- 项目内笔记列表
- 内容总结
- 原文对照
- 新笔记
- 开始解析
- 正在为你解析内容…
- 解析结果
- 一句话总结
- 核心观点
- 行动清单
- 知识卡片

### 禁止使用旧文案

- 保存到知识库
- 知识库列表
- 总览
- 输出类型选择器
- 方法论生成器入口

---

## 7. 开发原则

### 7.1 开发顺序

1. Layout + Sidebar
2. 首页 / 输入页
3. AI 解析中页
4. 解析结果页
5. 项目内笔记列表页
6. 笔记详情页
7. 状态补充
8. 数据接入
9. AI 接入

### 7.2 先 Mock，后真实数据

不要一开始就接复杂后端。优先用 mock 数据跑通页面和主流程。

```text
mock data → local state → simulated parsing → local save → Supabase → AI API
```

### 7.3 组件化

优先创建可复用组件：

- AppSidebar
- Button
- SearchInput
- NoteInputCard
- FeatureCard
- ProgressSteps
- SkeletonPreview
- ResultSectionCard
- ActionChecklist
- KnowledgeCard
- NotesTable
- NoteDetailHeader
- Tabs

### 7.4 不要过度工程化

1.0 是 MVP。不要引入复杂状态管理，除非必要。优先使用 React state、props、简单 hooks。

---

## 8. 代码生成注意事项

### 技术栈

优先使用：Next.js、React、TypeScript、Tailwind CSS、shadcn/ui、lucide-react。

### 代码风格

- 使用 TypeScript。
- 组件命名清晰。
- 保持文件结构简单。
- 不要写过大的单文件组件。
- Tailwind class 保持可读。
- 不要硬编码过多重复样式，应抽组件。
- 不要引入无必要依赖。

### 交互规则

- 首页输入为空时，开始解析按钮应禁用或提示。
- 点击开始解析后进入解析中页。
- 解析中页显示进度步骤和 skeleton preview。
- 完成后进入解析结果页。
- 保存到项目后，用户可以在项目“沙”中看到笔记。
- 笔记详情页支持内容总结 / 原文对照 Tab 切换。

### 可访问性

- 按钮应有明确文本。
- 表单应有 placeholder 或 label。
- 颜色对比要足够。
- 交互元素应有 hover / focus 状态。

---

## 9. 路由建议

```text
/                                首页 / 输入页
/parsing                         AI 解析中页
/result                          解析结果页
/projects/[projectId]            项目内笔记列表页
/projects/[projectId]/notes/[id] 笔记详情页
```

MVP 中也可以用 query 或 local state 简化流程。

---

## 10. Mock 数据建议

### 项目

```ts
export const mockProjects = [
  { id: "new", name: "新项目" },
  { id: "sha", name: "沙" },
  { id: "baidu-wenku", name: "百度文库" },
  { id: "xuanxuan", name: "旋旋又转转" },
  { id: "industrial", name: "工业设备" },
];
```

### 示例笔记

应包含：

- Designing for the AI Era: Principles and Patterns
- Meeting Notes: Q3 Product Roadmap Alignment
- Figma Config 2023: Keynote Summary
- The Architecture of Modern SaaS Applications
- 从 0 到 1 搭建增长系统的关键指标
- 用户访谈记录：企业版核心需求
- 如何管理更好的个人成长系统

---

## 11. 每次修改代码前必须遵守的规则

Cursor Agent 修改代码前应先检查：

1. 当前修改是否属于 1.0 范围。
2. 是否会引入 2.0 功能。
3. 是否破坏统一布局。
4. 是否使用了最新文案。
5. 是否保持组件复用。
6. 是否符合轻量、高级、克制的设计风格。
7. 是否影响主流程：输入 → 解析 → 结果 → 保存 → 查看。
8. 是否需要先更新 mock 数据或类型定义。
9. 是否需要拆分组件，而不是在页面里堆代码。
10. 是否会让页面变得过度复杂。

---

## 12. Cursor Agent 行为准则

- 不主动扩展 1.0 之外的功能。
- 不改变产品定位。
- 不随意改文案。
- 不把产品做成聊天工具。
- 不把页面做成重后台系统。
- 不使用过度复杂的技术方案。
- 不跳过组件化。
- 不删除已有可用页面。
- 修改前先理解相关组件和数据结构。
- 修改后保证页面可运行。

---

## 13. 当前最重要目标

当前开发目标不是完整商业产品，而是：

> 一个视觉接近真实 SaaS、主流程可演示、代码结构清晰、可用于作品集展示的 Read2Action 1.0 Web App 原型。
