# Read2Action Cursor 开发交接总文档

> 版本：**v1.0 已上线**（2026-05-15：§16 更新 **10.1 / 10.2 已完成**、**Read2Action 1.0 正式完成**、线上与仓库地址；2026-05-14：§16 增补 10.0 / 10.1 与 GitHub；2026-05-13：§17 产品版本路线；2026-05-12：第九阶段 **9.3 已通过**、第十阶段立项）  
> 当前阶段：**Read2Action 1.0 已冻结并完成上线**（第九阶段 **9.1、9.2、9.3** 与第十阶段 **10.0～10.2** 均已完成）。**后续默认进入 1.1「真实 AI 接入」准备期** — 以文档与立项对齐为主，**当前不改代码、不新增功能**（见 §16、§17）。  
> 用途：发给 Cursor，让 Cursor 快速理解项目目标、页面范围、交互流程、技术栈、开发顺序和不要做的内容。

---

## 1. 当前结论

Read2Action 已完成：

```text
产品定义 → PRD 初稿 → MVP 范围 → 信息架构 → 用户流程 → 低保真结构 → 1.0 页面结构与交互修订 → 高保真视觉方向 → Figma 最终 6 页设计稿
```

1.0 开发与上线闭环已完成，当前状态：

```text
Read2Action 1.0：mock 数据 + 本地状态 — 已部署上线（GitHub + Vercel），主流程已人工验收
```

**1.0 已正式标记为完成并冻结**：不再扩展功能、不做视觉大改、不重新讨论产品方向、不推翻 1.0 页面结构。**线上仍为 mock + 本地状态，属 1.0 预期，非 bug。** 下一阶段 **1.1** 才接入真实 AI（见 §17）。

---

## 2. 产品定位

Read2Action 是一个 AI 知识整理与行动转化工具。

一句话说明：

> 帮助用户将文本、链接、笔记或个人想法快速转化为结构化笔记，并保存到项目中，方便后续查看、复用和沉淀。

产品价值链：

```text
收藏内容 → 理解内容 → 提炼行动 → 沉淀知识 → 后续复用
```

---

## 3. 1.0 核心主流程

```text
首页输入内容
→ 点击开始解析
→ 进入 AI 解析中页面
→ 模拟解析完成
→ 进入解析结果页
→ 点击保存到项目
→ 保存成功 Toast
→ 在项目“沙”中出现新笔记
→ 点击笔记进入详情页
→ 在内容总结 / 原文对照 Tab 之间切换
```

1.0 阶段先用 mock 数据和 local state 跑通，不接真实后端，不接真实 AI API。

---

## 4. 1.0 页面范围

必须实现 6 个核心页面：

1. 首页 / 新笔记输入页
2. AI 解析中页
3. 解析结果页
4. 项目目录 / 项目内笔记列表页
5. 笔记详情页：内容总结 Tab
6. 笔记详情页：原文对照 Tab

统一结构：

```text
左侧固定侧边栏 + 右侧主内容区
```

---

## 5. 推荐路由

```text
/                                首页 / 新笔记输入页
/parsing                         AI 解析中页
/result                          解析结果页
/projects/[projectId]            项目目录 / 项目内笔记列表页
/projects/[projectId]/notes/[id] 笔记详情页
```

MVP 可以先使用 localStorage / mock data / query 参数简化数据传递。

---

## 6. 技术栈

优先使用：

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
lucide-react
```

后续再考虑：

```text
Supabase
AI API（1.1）
```

**Vercel**：**1.0 已用于生产部署**（见 §16.0）。**当前阶段**不要一上来接 Supabase 或真实 AI API。

---

## 7. 建议目录结构

```text
src/
├── app/
│   ├── page.tsx
│   ├── parsing/page.tsx
│   ├── result/page.tsx
│   └── projects/[projectId]/
│       ├── page.tsx
│       └── notes/[id]/page.tsx
├── components/
│   ├── layout/
│   ├── ui/
│   ├── input/
│   ├── parsing/
│   ├── result/
│   └── notes/
├── data/
├── types/
└── lib/
```

---

## 8. 核心组件拆解

优先开发这些组件：

```text
AppLayout
AppSidebar
PrimaryButton
SecondaryButton
SearchInput
NoteInputCard
FeatureCard
ProgressSteps
SkeletonPreview
ResultSectionCard
ActionChecklist
KnowledgeCard
NotesTable
NoteDetailHeader
NoteTabs
SaveToProjectDialog
ExportDropdown
Toast
```

弹窗、Toast、下拉框已有基础样式，可先按 shadcn/ui 默认组件生成，再根据 Figma 调整。

---

## 9. 数据模型

```ts
export type SourceType = "article" | "video" | "note" | "user_note" | "other";

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  sourceType: SourceType;
  sourceName?: string;
  sourceUrl?: string;
  rawContent: string;
  summary: string;
  keyInsights: string[];
  actionItems: ActionItem[];
  knowledgeCards: KnowledgeCard[];
  tags: string[];
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  content: string;
  description?: string;
  isDone: boolean;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  tag?: string;
}
```

---

## 10. Mock 数据要求

必须包含项目：

```ts
export const mockProjects = [
  { id: "new", name: "新项目" },
  { id: "sha", name: "沙" },
  { id: "project-one", name: "项目一" },
  { id: "baidu-wenku", name: "百度文库" },
  { id: "xuanxuan", name: "旋旋又转转" },
  { id: "industrial", name: "工业设备" },
];
```

必须包含示例笔记：

```text
如何管理更好的个人成长系统
Figma Config 2023: Keynote Summary
The Build–Measure–Learn Loop
Designing for the AI Era: Principles and Patterns
Meeting Notes: Q3 Product Roadmap Alignment
The Architecture of Modern SaaS Applications
从 0 到 1 搭建增长系统的关键指标
用户访谈记录：企业版核心需求
```

---

## 11. 页面开发顺序

请严格按这个顺序开发，不要跳着做：

```text
1. 项目初始化
2. 全局 Layout + Sidebar
3. 首页 / 新笔记输入页
4. AI 解析中页
5. 解析结果页
6. 项目目录 / 笔记列表页
7. 笔记详情页：内容总结 / 原文对照 Tab
8. 保存到项目弹窗 / Toast / Dropdown
9. 搜索、Tab、Checkbox、Hover、Disabled 状态
10. 最后统一视觉细节
```

---

## 12. 交互状态要求

### 首页

- 输入为空：开始解析按钮 disabled。
- 输入有内容：开始解析按钮可点击。
- 点击开始解析：跳转 `/parsing`。
- 左侧“新笔记”：回到首页，并清空输入状态。
- 模型选择下拉：MVP 可先静态展示 Sonnet 4.6。

### 解析中页

- 进入页面后显示 4 步进度。
- 使用假进度即可。
- 2–3 秒后自动跳转 `/result`。
- 点击取消解析：弹出确认弹窗。
- 确认取消后返回首页。
- 取消弹窗可以用 shadcn Dialog。

### 解析结果页

- 展示一句话总结、核心观点、行动清单、知识卡片。
- 点击保存到项目：打开项目选择弹窗。
- 默认选择“沙”。
- 点击确认保存：Toast 提示“已保存到项目”，并跳转 `/projects/sha` 或保留当前页。
- 编辑 / 导出可以先 mock：点击后 Toast 提示“功能开发中”。

### 项目目录页

- 展示当前项目名，如“沙”。
- 顶部输入条代表在当前项目内快速解析。
- 点击列表行：进入 `/projects/sha/notes/[id]`。
- 搜索：MVP 按标题 / 标签进行前端过滤。
- 更多按钮：MVP 可先展示 Dropdown，但功能先 mock。
- 分页：MVP 可静态展示，不需要真实分页逻辑。

### 笔记详情页

- 默认展示内容总结 Tab。
- 点击原文对照切换原文内容。
- 面包屑可点击项目名返回项目目录。
- 编辑 / 导出 / 保存到项目：MVP 可先 mock 或 Toast。
- 行动清单 checkbox 可本地切换完成状态。

---

## 13. 视觉规则

请尽量还原 Figma 设计稿。

视觉关键词：

```text
轻量 / 克制 / 清晰 / 理性 / 高级感 / AI 辅助感 / 知识工具感 / 真实 SaaS / 白底 + 浅灰背景 + 紫蓝色点缀
```

基础色值：

```ts
const colors = {
  primary: "#4F46E5",
  primarySoft: "#6366F1",
  background: "#F7F7FB",
  card: "#FFFFFF",
  textPrimary: "#171717",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  success: "#22C55E",
};
```

UI 要求：

- 页面背景浅灰。
- 卡片白色。
- 卡片圆角 12–16px。
- 按钮圆角 10–12px。
- 阴影轻，不要厚重。
- 边框浅灰。
- 图标统一线性风格。
- 表格轻量，不要做成重后台。
- 不要大面积高饱和渐变。
- 不要赛博风。
- 不要把首页做成聊天界面。

---

## 14. 禁止做的事情

1. 不要做登录注册。
2. 不要做付费系统。
3. 不要做真实数据库。
4. 不要一开始接真实 AI API。
5. 不要做移动端。
6. 不要做方法论生成器。
7. 不要做多笔记组合生成。
8. 不要做 AI 聊天式知识库。
9. 不要做复杂知识图谱。
10. 不要引入复杂状态管理。
11. 不要把“保存到项目”写成“保存到知识库”。
12. 不要把详情页 Tab 扩展成多个复杂 Tab。
13. 不要推翻当前 6 个页面结构。

---

## 15. 当前开发目标

**1.0 目标已达成**（历史口径，供对照）：

> 一个视觉接近真实 SaaS、主流程可演示、代码结构清晰、可用于作品集展示的 Read2Action 1.0 Web App 原型。

**完成标准（已全部满足并上线）：**

```text
6 个页面可以访问
主流程可以跑通（含线上一致主链路人工验收）
mock 数据可以保存和查看
左侧 Sidebar 全局复用
页面样式接近 Figma
基础交互状态可用
代码结构清晰
已接 Vercel 部署；后续 1.1 可接真实 AI API / 后端
```

---

## 16. 第九阶段交接摘要（9.1–9.3 已通过）与第十阶段（已完成）

本小节与 `Read2Action_Cursor_新对话接力文档_v2026-05-09.md` §2、§8–§9 及 `Read2Action_当前进度快照_v0.8.md` 保持一致，便于新开对话无需翻全篇。

### 16.0 线上与仓库（1.0 当前事实源）

| 项 | 地址 / 说明 |
|----|----------------|
| **线上站点（Vercel）** | **`https://read2action.vercel.app`** |
| **GitHub 仓库** | **`https://github.com/shamingxin/read2action`**（克隆：`https://github.com/shamingxin/read2action.git`） |
| **当前版本状态** | **1.0**：**mock 数据 + 本地/前端状态**；页面内容为演示数据，**属预期，非 bug** |
| **线上一致主流程（已人工验收）** | 首页输入 → 开始解析 → **`/parsing`** → **`/result`** → 保存到项目 → **`/projects/sha`** → 笔记详情页 |

### 16.1 验收状态

| 子阶段 | 状态 |
|--------|------|
| **9.1** 全局组件统一 + 一轮小修 | ✅ **已通过** |
| **9.2** 页面视觉统一 + 收尾交互 | ✅ **已通过** |
| **9.3** 主流程完整走查 + 收尾修复 + 人工复验 | ✅ **已通过** |
| **第十阶段** 真实可用性检查与上线准备 | ✅ **已完成** |
| **10.0** 本地部署前检查（lint / build / dev 主流程） | ✅ **已通过**（2026-05-14，见决策日志） |
| **10.1** GitHub 首次上传与远程绑定 | ✅ **已完成** — 仓库：**`https://github.com/shamingxin/read2action`** |
| **10.2** Vercel 导入 GitHub 仓库并完成部署 | ✅ **已完成** — 生产地址见 **§16.0** |

### 16.2 9.2 交付要点（视觉 + 交互）

- **Token 与页面壳**：`src/lib/r2a-ui-classes.ts` 集中维护 `r2aPageShell1020`、卡片圆角/阴影、顶栏与 Tab 等；`/result`、笔记详情、`/parsing`、项目列表与首页纳入同一视觉体系。  
- **首页**：1020 宽壳 + 内层约 720 输入列。  
- **交互收尾**：详情「⋯」Dropdown + 叠层修复；首页「+」与结果页「+ 添加自定义卡片」Toast 占位；输入区 focus 与 9.1/9.2 终态一致（仅光标、无多余 ring）。  

### 16.3 9.3 闭环要点（摘要）

- **主流程**：`/` → `/parsing`（**四步**展示后）→ `/result` → 保存到项目 → `/projects/sha` → 笔记详情 **可跑通**；**取消解析**无幽灵跳转。  
- **Toast / 占位**：**编辑**、Sidebar **新增项目**、项目 **⋯** 菜单等已对齐 **1.0 占位**预期。  
- **Sidebar**：**当前项目 active**、**行高一致**、**icon** 轻量对齐。  
- **构建**：`npm run build` 通过。详见 `Read2Action_9.3_问题记录表.md`。

### 16.4 仍有待办（不阻塞 1.0 完成；可选后续迭代）

字体与稿差、日期格式统一、部分 max-w 与 1020 并存、Figma「05」读稿、方法论与 `/result` 原文对照 Tab 占位、取消解析确认弹窗等 — 记在接力文档 **§7**，可在 **1.1 之后** 或体验专项中按优先级处理（**非**当前默认开发任务）。

### 16.5 下一对话建议动作（1.1 准备期 — 默认不改代码）

**Read2Action 1.0 已正式完成**；**第十阶段（含 10.1、10.2）已闭环**。新开对话默认进入 **1.1「真实 AI 接入」准备**：产品/技术方案、接口形态、密钥与成本、与现有 UI 字段映射等 — **在未明确立项与范围前，不修改业务代码、不新增功能、不做视觉迭代**。

**重要决策（重申）**：**1.0 冻结**；**mock 与占位为正常状态**；**真实 AI 与持久化属 1.1 及以后**，与当前线上行为区分。

具体接力提示词见 `Read2Action_Cursor_新对话接力文档_v2026-05-09.md` **§9**。

**相关文件**：`Read2Action_决策日志.md`（含 **2026-05-15** 上线完成条目）、`Read2Action_当前进度快照_v0.8.md`、`Read2Action_9.3_问题记录表.md`。

---

## 17. 产品版本路线（规划补充：1.0 / 1.1 / 2.0）

与 `Read2Action_Cursor_新对话接力文档_v2026-05-09.md` **§1「版本路线」** 保持一致，便于产品 / 开发对齐边界。

### 17.1 1.0（已完成并上线）

- **mock 数据 + 本地状态**，完成 **6 页主流程** 与占位交互；**已稳定上线**（第十阶段 **10.0～10.2** 已完成：本地检查、GitHub、Vercel）。  
- **线上地址**：**`https://read2action.vercel.app`**；**仓库**：**`https://github.com/shamingxin/read2action`**。  
- **不接**真实 AI API、数据库、登录注册 — **1.0 范围内始终成立**；**1.0 已冻结**，后续能力进 **1.1 / 2.0**。

### 17.2 1.1（后续计划 — 当前默认「下一阶段」）

- **目标**：用户输入经 **后端 API** 调用 **真实大模型**，生成 **结构化笔记**，**替换**当前 **mock 解析结果**，结果页展示 **真实生成内容**。  
- **优先范围**：新增 **`/api/analyze`**（或等价路径）；接入 **一个**真实 AI API；请求体携带用户输入；响应为可映射到现有 UI 的 **结构化总结**；**保留 `/parsing` 四步加载体验**（与真实进度衔接方式实现时另定）。  
- **1.1 仍不做（与当前规划一致）**：登录、数据库、真实删除、真实导出。  
- **准备期约定**：在单独立项与排期前，**仅文档与方案对齐**，**不默认改仓库代码**。

### 17.3 2.0（再考虑）

- 数据库保存 **项目与笔记**；**登录注册**；**多项目真实管理**；**历史记录**；**搜索**；**导出**；**多端同步** 等。
