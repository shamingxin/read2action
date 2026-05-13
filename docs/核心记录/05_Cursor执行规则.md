# Read2Action · 05 Cursor 执行规则

> **文档角色**：给 Cursor / 其他 Agent 用的 **规则、提示词、交互跳转原文**；可整份或节选复制到 **`.cursor/rules/`**（建议文件名：`read2action.mdc` 或项目自定）。  
> **与 `01` 的关系**：`docs/核心记录/01_项目总说明.md` 为 **最新口径**（含 1.0 冻结、线上地址、9.3 终态等）；本文件中的 **Rules v0.6** 与 **交互文档 v0.7** 为 **历史原文保留**，若与 `01`/`02` 冲突，以 **`01`/`02` + 仓库代码** 为准。  
> **当前阶段**：1.0 已上线冻结；默认 **1.1 准备期** — 未立项前不默认改业务代码（见 `03`、`04`）。docs 目录三类索引见 **`docs/README.md`**。

---

## 0. 新对话接力提示词（路径已更新，可直接复制）

```text
请先阅读 docs/README.md，再阅读 docs/核心记录/02_当前进度快照.md、docs/核心记录/04_重要决策日志.md、docs/核心记录/05_Cursor执行规则.md，以及 docs/核心记录/01_项目总说明.md，理解 1.0 范围与当前进度。

第一至第八阶段已完成；第九阶段 9.1、9.2、9.3 均已通过；第十阶段 10.0、10.1、10.2 均已完成。Read2Action 1.0 已正式上线并冻结。线上：https://read2action.vercel.app ；仓库：https://github.com/shamingxin/read2action 。线上一致主流程已人工验收；当前仍为 mock + 本地状态，属 1.0 预期非 bug。

默认进入 1.1「真实 AI 接入」准备期：以文档与方案对齐为主，未立项前不要改业务代码、不要新增功能、不要视觉迭代。不要接 Supabase / 真实登录，不要无边界扩展 2.0 功能。
```

---

## 附录 A · Read2Action Cursor Rules（原文 v0.6）

> 原文件：`Read2Action_Cursor_Rules.md`  
> 用途：适合放入 Cursor 项目中，帮助 Cursor Agent 理解 Read2Action 项目背景、功能边界、设计风格和代码生成规则。  
> 后续可拆分到 `.cursor/rules/` 目录中使用。

### A.1 项目背景

Read2Action 是一个 AI 知识整理与行动转化工具。

它帮助用户将文本、链接、笔记或个人想法转化为结构化笔记，并保存到项目中，方便后续查看、复用和沉淀。

当前是 1.0 MVP 阶段，目标是先完成可运行的 Web App 原型，不追求复杂功能。

### A.2 产品定位

#### 一句话定位

> Read2Action 是一个帮助用户将文本、链接、笔记内容快速转化为结构化笔记，并沉淀到项目中的 AI 知识工具。

#### 产品价值链

```text
收藏内容 → 理解内容 → 提炼行动 → 沉淀知识 → 后续复用
```

#### 1.0 主链路

```text
输入内容 → AI 解析 → 查看解析结果 → 保存到项目 → 在项目中查看笔记 → 进入笔记详情页阅读和复用
```

### A.3 功能边界

#### 3.1 1.0 必做页面

1. 首页 / 输入页
2. AI 解析中页
3. 解析结果页
4. 项目内笔记列表页
5. 笔记详情页：内容总结 Tab
6. 笔记详情页：原文对照 Tab

#### 3.2 1.0 必做功能

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

#### 3.3 1.0 暂不做功能

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

### A.4 信息结构

#### 4.1 数据对象关系

```text
Project 项目
└── Note 笔记
    ├── raw_content 原始内容
    ├── summary 一句话总结
    ├── key_insights 核心观点
    ├── action_items 行动清单
    └── knowledge_cards 知识卡片
```

#### 4.2 建议 TypeScript 类型

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

### A.5 设计风格

#### 5.1 视觉关键词

```text
轻量 / 克制 / 清晰 / 理性 / 高级感 / AI 辅助感 / 知识工具感 / 适合长期使用 / 不过度赛博 / 白底 + 轻紫蓝点缀
```

#### 5.2 参考产品

- Cursor
- Notion
- Claude Code
- ChatGPT
- Linear
- Craft

#### 5.3 色彩建议

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

#### 5.4 UI 规则

- 页面背景使用柔和浅灰 / 浅紫白。
- 内容区域以白色卡片为主。
- 阴影轻，不要厚重。
- 圆角统一。
- 边框使用浅灰。
- 图标使用线性图标。
- 不使用大面积高饱和渐变。
- 不做过度赛博风格。
- 保持真实 SaaS 产品质感。

### A.6 页面文案规则

**正确文案**：保存到项目、项目、项目内笔记列表、内容总结、原文对照、新笔记、开始解析、正在为你解析内容…、解析结果、一句话总结、核心观点、行动清单、知识卡片。

**禁止使用旧文案**：保存到知识库、知识库列表、总览、输出类型选择器、方法论生成器入口。

### A.7 开发原则

#### 7.1 开发顺序

1. Layout + Sidebar
2. 首页 / 输入页
3. AI 解析中页
4. 解析结果页
5. 项目内笔记列表页
6. 笔记详情页
7. 状态补充
8. 数据接入
9. AI 接入

#### 7.2 先 Mock，后真实数据

不要一开始就接复杂后端。优先用 mock 数据跑通页面和主流程。

```text
mock data → local state → simulated parsing → local save → Supabase → AI API
```

#### 7.3 组件化

优先创建可复用组件：AppSidebar、Button、SearchInput、NoteInputCard、FeatureCard、ProgressSteps、SkeletonPreview、ResultSectionCard、ActionChecklist、KnowledgeCard、NotesTable、NoteDetailHeader、Tabs。

#### 7.4 不要过度工程化

1.0 是 MVP。不要引入复杂状态管理，除非必要。优先使用 React state、props、简单 hooks。

### A.8 代码生成注意事项

**技术栈**：Next.js、React、TypeScript、Tailwind CSS、shadcn/ui、lucide-react。

**代码风格**：TypeScript；组件命名清晰；文件结构简单；不过大单文件；Tailwind 可读；抽组件；无必要依赖不引入。

**交互规则**：首页空输入禁用或提示；开始解析进解析中页；进度与 skeleton；完成进结果页；保存后到「沙」可见；详情 Tab 切换。

**可访问性**：按钮文本、placeholder/label、对比度、hover/focus。

### A.9 路由建议

```text
/                                首页 / 输入页
/parsing                         AI 解析中页
/result                          解析结果页
/projects/[projectId]            项目内笔记列表页
/projects/[projectId]/notes/[id] 笔记详情页
```

MVP 中也可以用 query 或 local state 简化流程。

### A.10 Mock 数据建议

**项目**：

```ts
export const mockProjects = [
  { id: "new", name: "新项目" },
  { id: "sha", name: "沙" },
  { id: "baidu-wenku", name: "百度文库" },
  { id: "xuanxuan", name: "旋旋又转转" },
  { id: "industrial", name: "工业设备" },
];
```

**示例笔记**应包含：Designing for the AI Era…、Meeting Notes: Q3…、Figma Config 2023…、The Architecture of Modern SaaS Applications、从 0 到 1 搭建增长系统的关键指标、用户访谈记录：企业版核心需求、如何管理更好的个人成长系统。

### A.11 每次修改代码前必须遵守的规则

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

### A.12 Cursor Agent 行为准则

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

### A.13 当前最重要目标

当前开发目标不是完整商业产品，而是：

> 一个视觉接近真实 SaaS、主流程可演示、代码结构清晰、可用于作品集展示的 Read2Action 1.0 Web App 原型。

---

## 附录 B · 发给 Cursor 的首轮提示词（原文）

> 原文件：`Read2Action_Cursor首轮提示词.md`  
> 用法：新开 Cursor 对话后，先把这段话发给 Cursor，再附上 Figma 链接和 docs 内相关 md。

---

你现在是 Read2Action 项目的前端开发 Agent。

请先完整阅读我发给你的所有 md 文档和 Figma 链接，不要急着写代码。  
这个项目已经完成产品定义、MVP 范围、信息架构、交互逻辑和 6 张最终高保真设计稿，现在正式进入 Cursor 开发阶段。

你的目标是：

> 使用 Next.js + React + TypeScript + Tailwind CSS + shadcn/ui + lucide-react，开发一个视觉接近 Figma、主流程可演示、代码结构清晰的 Read2Action 1.0 Web App 原型。

请严格遵守：

1. 只做 1.0 MVP，不扩展 2.0 功能。
2. 先用 mock 数据和 local state 跑通页面，不接真实后端，不接真实 AI API。
3. 页面必须包含：首页 / 新笔记输入页、AI 解析中页、解析结果页、项目目录页、笔记详情页内容总结、笔记详情页原文对照。
4. 全局采用左侧固定侧边栏 + 右侧主内容区。
5. 视觉尽量还原 Figma，整体轻量、克制、高级、真实 SaaS，不要赛博风，不要重后台风。
6. 保存文案统一使用“保存到项目”，不要出现“保存到知识库”。
7. 首页只保留统一输入框，不做输入类型选择器。
8. 详情页只保留“内容总结 / 原文对照”两个 Tab。
9. 先搭建项目结构、路由、类型、mock 数据和基础组件，再开发页面。
10. 每次修改代码前先判断是否属于 1.0 范围。

请你先输出一份开发计划，包括：

- 技术栈确认
- 路由结构
- 目录结构
- 组件拆解
- mock 数据设计
- 第一阶段要创建哪些文件
- 你会如何保证和 Figma 一致

等我确认后，再开始写代码。

---

## 附录 C · 交互与跳转逻辑文档（原文 v0.7）

> 原文件：`Read2Action_交互跳转逻辑文档.md`  
> **与当前实现的对照（重要）**：9.3 验收明确 **不以本 v0.7 文档为唯一标准**，而以 **最新接力口径 + 浏览器实际效果** 为准。已知差异示例：  
> - **首页空输入**：终态可为 **置灰 + 仍点击 Toast**（见 `01`/`02`），未必等同下表「disabled」的单一理解。  
> - **`/parsing`**：终态为 **四步依次展示完毕**再跳转，总时长约 **3.5～4.5s** 量级；**取消解析**为 **直接回首页并清定时器**，**未必**已实现「确认弹窗」。  
> 下表仍全文保留，便于作品集说明「规格演进」与对照测试。

### C.1 页面与路由

| 页面 | 路由 | 说明 |
|---|---|---|
| 首页 / 新笔记输入页 | `/` | 用户输入文本、链接或想法 |
| AI 解析中页 | `/parsing` | 展示解析进度和骨架屏 |
| 解析结果页 | `/result` | 展示 AI 解析后的结构化结果 |
| 项目目录页 | `/projects/[projectId]` | 展示某个项目下的笔记列表 |
| 笔记详情页 | `/projects/[projectId]/notes/[id]` | 展示单条笔记详情，包含两个 Tab |

### C.2 全局侧边栏逻辑

包含：Logo / 产品名、新笔记按钮、搜索框、项目列表、最近记录、用户信息。

| 元素 | 行为 |
|---|---|
| Logo | 点击返回首页 `/` |
| 新笔记 | 点击返回首页 `/`，清空输入状态 |
| 搜索框 | MVP 可先静态，或用于过滤最近记录 |
| 项目：沙 | 跳转 `/projects/sha` |
| 最近记录 | 跳转对应笔记详情页 |
| 用户信息 | MVP 不做功能 |

### C.3 首页 / 新笔记输入页

页面目标：让用户输入内容，并开始解析。

主要元素：

```text
标题：今日事，我来帮。
副标题：粘贴文本、链接或你的想法，让 AI 帮你整理成结构化笔记
输入框
加号按钮
模型选择
开始解析按钮
你将获得：一句话总结 / 核心观点提炼 / 行动清单 / 知识卡片
```

| 状态 | 说明 |
|---|---|
| 输入为空 | 开始解析按钮 disabled |
| 输入有内容 | 开始解析按钮 enabled |
| 点击开始解析 | 跳转 `/parsing` |
| 点击加号 | MVP 可展示 Dropdown：上传文件 / 粘贴链接 / 暂不实现 |
| 点击模型选择 | MVP 可展示 Sonnet 4.6，不做真实模型切换 |

### C.4 AI 解析中页

页面目标：让用户知道系统正在处理内容，降低等待焦虑。

主要元素：

```text
标题：正在为你解析内容…
预计 20 秒
四步进度条：读取内容 / 提炼要点 / 结构化处理 / 生成结果
取消解析按钮
LIVE PREVIEW 骨架屏
```

| 行为 | 结果 |
|---|---|
| 进入页面 | 自动开始假进度 |
| 0–1 秒 | Step 1 完成，Step 2 进行中 |
| 1–2 秒 | Step 2 完成，Step 3 进行中 |
| 2–3 秒 | Step 3 完成，Step 4 进行中 |
| 3 秒后 | 跳转 `/result` |
| 点击取消解析 | 打开确认弹窗 |
| 确认取消 | 返回首页 `/` |
| 放弃取消 | 关闭弹窗，继续解析 |

### C.5 解析结果页

页面目标：展示结构化解析结果，并允许用户保存到项目。

主要元素：

```text
标题：解析结果
Source: The Lean Startup (Excerpt)
编辑 / 导出 / 保存到项目
一句话总结 / 核心观点 / 行动清单 / 知识卡片 / 添加自定义卡片
```

| 元素 | 行为 |
|---|---|
| 编辑 | MVP 先 Toast：编辑功能开发中 |
| 导出 | 打开 Dropdown：Markdown / PDF；MVP 可先 Toast |
| 保存到项目 | 打开 SaveToProjectDialog |
| 确认保存 | Toast：已保存到项目 |
| 保存后 | 可跳转 `/projects/sha` |
| 行动清单 checkbox | 本地切换完成状态 |
| 添加自定义卡片 | MVP 可先 Toast：功能开发中 |

保存到项目弹窗字段：标题“保存到项目”、项目选择默认“沙”、按钮“取消 / 保存”。

保存后逻辑：将当前 result mock 写入 local state 或 localStorage，归属 `projectId = "sha"`。

### C.6 项目目录页

页面目标：展示某个项目下的笔记列表，让用户找到并进入笔记详情。

主要元素：标题“沙”、顶部快速输入条、解析按钮、笔记列表表格、分页。

表格字段：标题 / 类型 / 标签 / 创建时间 / 操作。

| 元素 | 行为 |
|---|---|
| 顶部输入条 | 在当前项目内快速输入内容 |
| 解析按钮 | 跳转 `/parsing`，解析结果默认保存到当前项目 |
| 点击笔记行 | 跳转 `/projects/sha/notes/[id]` |
| 搜索 | 按标题 / 标签 / 来源过滤 |
| 操作更多 | 展示 Dropdown：编辑 / 删除；MVP 可先 mock |
| 分页 | 静态展示即可 |

### C.7 笔记详情页

页面目标：让用户阅读已经保存的结构化笔记，并与原文对照。

主要元素：面包屑、标题、元信息、编辑、导出、保存到项目、Tabs。

内容总结 Tab：一句话总结 / 知识卡片 / 核心观点 / 行动清单 / 原文摘录。

原文对照 Tab：原始内容、说明文字、原文正文。

| 元素 | 行为 |
|---|---|
| 面包屑项目名 | 返回 `/projects/sha` |
| 内容总结 Tab | 展示结构化总结 |
| 原文对照 Tab | 展示原文 |
| 编辑 | MVP 先 Toast |
| 导出 | MVP 先 Dropdown 或 Toast |
| 保存到项目 | 如果已保存，可 Toast：已在项目中 |
| checkbox | 本地切换完成状态 |

### C.8 基础反馈组件

Toast：已保存到项目 / 编辑功能开发中 / 导出功能开发中 / 已取消解析 / 请输入内容后再解析。

Dialog：取消解析确认弹窗 / 保存到项目弹窗。

Dropdown：模型选择 / 导出格式 / 更多操作。

### C.9 必须覆盖的基础状态

| 状态 | 是否必须 |
|---|---|
| 输入为空 | 必须 |
| 输入中 | 必须 |
| 解析中 | 必须 |
| 解析完成 | 必须 |
| 保存成功 | 必须 |
| Tab 切换 | 必须 |
| Checkbox 切换 | 必须 |
| 搜索无结果 | 建议 |
| 解析失败 | 可以后补 |
| 项目为空 | 可以后补 |

### C.10 MVP 不处理的复杂状态

真实 AI 流式生成 / 真实网络错误 / 真实登录态 / 真实数据库同步 / 多人协作冲突 / 复杂权限 / 文件上传解析 / 多项目批量移动 / 复杂标签管理。

---

**文档路径**：`docs/核心记录/05_Cursor执行规则.md`
