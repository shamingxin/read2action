# Read2Action Cursor 新对话接力文档

> 版本日期：**2026-05-09** 起稿；**2026-05-11** 修订第九阶段 9.1/9.2/9.3 预备；**2026-05-12** 修订：**9.3 已通过**，**第十阶段** 立项；**2026-05-13** 修订：**补充产品版本路线（1.0 / 1.1 / 2.0）**；**2026-05-14** 修订：**10.0 通过**，**10.1** GitHub 空仓库地址已记录（代码 **未 push**）。  
> 用途：新开 Cursor 对话时粘贴或 `@` 本文档，快速恢复上下文并继续开发。  
> 建议：同时 `@docs` 下原有 Read2Action 交接文档（如 `Read2Action_Cursor开发交接总文档.md`、`Read2Action_交互跳转逻辑文档.md` 等）。

---

## 1. 当前项目总体目标

### Read2Action 是什么

Read2Action 是一款 **AI 知识整理与行动转化** 工具：帮助用户把文本、链接、笔记或想法整理成 **结构化笔记**，并 **保存到项目** 中，便于查看、复用与沉淀。

### 当前 1.0 的开发目标

- 用 **mock 数据 + 本地状态** 跑通 **6 个核心页面** 的主流程（视觉接近真实 SaaS、可演示、代码清晰）。  
- **不接** 真实后端、**不接** 真实 AI API（**1.0 阶段**；**1.1** 将接入真实 AI，见下「版本路线」）。  
- **1.0 仍以**：完成 **mock + 本地状态** 版本的 **稳定上线** 为首要目标。  
- 交付物偏向：**可运行 Web 原型 / 可部署演示**，而非完整商业化产品。

### 版本路线（规划补充：1.0 / 1.1 / 2.0）

#### 1.0（当前）

- **mock + 本地状态**，主流程与交互占位稳定，**可上线部署**（第十阶段侧重可用性与部署准备）。  
- **不接**真实 AI、数据库、登录；与下文「当前不做」及 **第十阶段边界** 一致。

#### 1.1（后续计划）

- **目标**：用户输入文本后，经 **后端 API** 调用 **真实大模型**，生成 **结构化笔记结果**，并 **替换当前 mock 解析结果**（结果页展示真实生成内容）。  
- **优先范围**：  
  - 新增 **`/api/analyze`**（或等价命名）接口；  
  - **接入一个**真实 AI API；  
  - 将 **用户输入** 发送至 AI，接收 **结构化总结**；  
  - **前端结果页**展示真实生成内容；  
  - **保留**当前 **`/parsing` 四步加载**体验（可与真实耗时/状态机衔接，具体实现时另定）。  
- **1.1 仍不做（优先范围外）**：登录、数据库、真实删除、真实导出（与产品规划一致，实现时可再收窄）。

#### 2.0（再考虑）

- 数据库持久化 **项目与笔记**  
- **登录注册**  
- **多项目真实管理**  
- **历史记录**  
- **搜索**  
- **导出**  
- **多端同步**  

### 当前技术栈

- **Next.js**（App Router）  
- **React** + **TypeScript**  
- **Tailwind CSS**  
- **shadcn/ui**（base-nova，`Button` 等）  
- **lucide-react**

### 当前不做哪些真实功能（1.0 / 当前开发阶段）

> **说明**：**1.1** 将 **接入真实 AI API**（见「版本路线」）；本节约束 **默认适用于 1.0 与第十阶段**，新开 **1.1** 任务时需单独对齐范围。

- 真实 **AI API**、流式生成（**1.0**；**1.1** 除外）  
- **Supabase** / 真实数据库  
- **登录注册**、权限体系  
- **移动端** 专项适配（以桌面 Web 为主）  
- **复杂 localStorage** 同步、多设备协作  
- **真实导出**（PDF/Markdown 等）  
- **2.0** 功能扩展（聊天式知识库、复杂图谱、方法论生成器等，见原 `docs` 禁止清单）

---

## 2. 当前开发进度（按阶段）

### 第一阶段：项目初始化 + Layout + Sidebar + mock 数据

| 项 | 说明 |
|----|------|
| **状态** | ✅ 已完成 |
| **主要内容** | Next.js + TS + Tailwind + shadcn 初始化；`AppLayout` + `AppSidebar`；`types`、`data` mock；首页右侧仅占位 |
| **主要文件** | `src/app/layout.tsx`、`src/app/page.tsx`（初期）、`src/components/layout/app-layout.tsx`、`app-sidebar.tsx`、`src/types/index.ts`、`src/data/*.mock.ts`、`src/lib/utils.ts`、`components/ui/button.tsx`、`src/app/globals.css` 等 |
| **遗留** | 根目录名含中文/空格时，曾用 `/tmp` 脚手架再拷贝；无功能遗留 |

### 第二阶段：首页 / 新笔记输入页

| 项 | 说明 |
|----|------|
| **状态** | ✅ 已完成（后经 Figma 参数对齐迭代） |
| **主要内容** | 标题/副标题、大输入框、加号占位、模型选择（`ModelSelect`）、「开始解析」、底部「你将获得」四卡；**空输入**时主按钮 **置灰** 仍可点击并 **Toast**「请输入内容后再解析」；有内容跳转 `/parsing` |
| **主要文件** | `src/components/input/home-note-panel.tsx`、`src/app/page.tsx` |
| **遗留** | 字体与 Figma 非像素级一致；窄屏与稿可能有差异 |

### 第三阶段：AI 解析中页 `/parsing`

| 项 | 说明 |
|----|------|
| **状态** | ✅ 已完成 |
| **主要内容** | 标题、预计时间、**四步进度**；**9.3 终态**：依次展示 **读取内容 → 提炼要点 → 结构化处理 → 生成结果** 后自动跳转 **`/result`**（总时长约 **3.5～4.5s** 量级，以代码为准）；**取消解析**回 **`/`** 并清除定时器、**无幽灵跳转**；LIVE PREVIEW 骨架卡 |
| **主要文件** | `src/app/parsing/page.tsx`、`src/components/parsing/parsing-page-view.tsx` |
| **遗留** | 无硬性功能遗留；与 Figma 小屏表现可能略有差异 |

### 第四阶段：解析结果页 `/result`

| 项 | 说明 |
|----|------|
| **状态** | ✅ 已完成 |
| **主要内容** | 内容总结 Tab 默认；一句话总结 / 核心观点 / 行动清单 / 知识卡片；原文对照 Tab 占位；右上编辑/导出/保存到项目 UI；`ParseResultPreview` 扩展字段 |
| **主要文件** | `src/app/result/page.tsx`、`src/components/result/result-page-view.tsx`、`src/data/result.mock.ts`、`src/types/index.ts`（`ParseResultPreview`） |
| **遗留** | 「原文对照」Tab 仍为占位；**保存到项目 / 导出 / 更多** 的完整交互见 **第八阶段**（已实现弹窗与 Toast 等，见下） |

### 第五阶段：项目目录 / 笔记列表 `/projects/[projectId]`

| 项 | 说明 |
|----|------|
| **状态** | ✅ 已完成 |
| **主要内容** | 项目标题 + 图标、顶部快速解析条（**空输入**时「解析」**置灰** 仍可 Toast；有内容跳 `/parsing`）、「解析」表格区、静态分页文案；非法 `projectId` → `notFound()` |
| **主要文件** | `src/app/projects/[projectId]/page.tsx`、`src/components/projects/project-page-view.tsx`、`src/data/projects.mock.ts`（`getProjectById`） |
| **遗留** | 表头小屏隐藏、列宽为近似；日期格式用 `en-US` 短格式贴近 Figma 示例 |

### 第六阶段：笔记详情 · 内容总结 Tab `/projects/[projectId]/notes/[id]`

| 项 | 说明 |
|----|------|
| **状态** | ✅ 内容总结 Tab 已完成（原文对照 UI 在 **第七阶段** 落地，见下） |
| **主要内容** | 面包屑（项目可点回列表）、标题与 meta、编辑/导出/保存到项目/⋯、Tab 切换；内容总结：一句话总结、核心观点、行动清单（本地勾选）、知识卡片、方法论沉淀占位、原文摘录（`rawContent`）；`note.projectId !== projectId` 时 `notFound()` |
| **主要文件** | `src/app/projects/[projectId]/notes/[id]/page.tsx`、`src/components/notes/note-detail-view.tsx`、`src/data/notes.mock.ts`（`getNoteById`） |
| **遗留** | **第六阶段当时 Figma MCP 未连接**，未读到「05-笔记详情-内容总结」稿的 nodeId 与精确参数；**方法论沉淀** 仍为占位文案 |

### 第七阶段：笔记详情 · 原文对照 Tab `/projects/[projectId]/notes/[id]`（✅ 已确认基本通过）

| 项 | 说明 |
|----|------|
| **状态** | ✅ 已完成（与 Figma「06-详情里的原文」对齐；Tab 切换已验收） |
| **Figma** | 已成功读取 Frame **「06-详情里的原文」**；**nodeId：`100:2139`**（文件 `bKfNypeuHrog84veDHJ2o0`，页面 `read2action 1.0`；历史 nodeId `13:66` 已失效，以本 id 为准） |
| **主要内容** | **原文对照** Tab：单列「原始内容」卡片（标题、说明文案、`rawContent` 正文排版与滚动区）；**内容总结 / 原文对照** 两 Tab 样式按稿（非激活 `medium` / `#939393`，激活 `semibold` + **64px** 主色下划线）；顶栏标题区与右上按钮 **保持与第六阶段一致** |
| **主要文件** | `src/components/notes/note-detail-view.tsx`（本阶段仅改此文件） |
| **主流程** | 当前 **完整主流程已基本跑通**：**首页** → **解析中** → **解析结果** → **项目目录** → **笔记详情 · 内容总结** → **笔记详情 · 原文对照** |
| **遗留** | `/result` 页「原文对照」Tab 仍为占位（不在本阶段范围）；详情「方法论沉淀」仍为占位；未强制接 Code Connect |

### 第八阶段：弹窗 / Toast / 下拉框 / 状态补充（✅ 已完成并基本通过）

| 项 | 说明 |
|----|------|
| **状态** | ✅ 已完成并基本通过 |
| **主要内容** | `/result`：**保存到项目** 弹窗（项目单选、确认后 Toast「已保存到项目」并跳转所选项目）、**导出** Toast「导出功能暂未开放」、**更多** Dropdown（复制链接 / 删除 mock）；根布局 **`<Toaster />`**（`sonner`）；首页 / 项目页 **模型** 与 **空输入 Toast**（后经 **9.1 小修** 调整表现，见下） |
| **主要文件** | `src/app/layout.tsx`、`src/components/ui/dialog.tsx`、`src/components/ui/dropdown-menu.tsx`、`src/components/ui/sonner.tsx`、`src/components/result/result-page-view.tsx`、`src/components/result/save-to-project-dialog.tsx` 等 |

### 第九阶段 9.1：全局组件统一 + 一轮小修（✅ 已验收通过）

| 项 | 说明 |
|----|------|
| **状态** | ✅ **9.1 已完成并已验收通过** |
| **主要内容** | 统一 **`button` / `dialog` / `dropdown-menu` / `sonner`** 等基础组件视觉与轻交互；新增 **`src/lib/r2a-ui-classes.ts`**（初版按钮/表面 class）；结果页 / 笔记详情顶栏按钮引用统一 class；**一轮小修** 见下表 |
| **9.1 小修（交互与视觉收束）** | ① 首页 / 项目页：**空输入**时「开始解析」「解析」**置灰**（`aria-disabled` + 透明度），**仍保留**点击 **Toast**「请输入内容后再解析」；有内容恢复紫色可点；**不改变**跳转判断逻辑。② **模型选择**：由原生 `select` 改为 **`DropdownMenu` 风格**（与「更多」菜单一致），选项 **Auto / GPT-5.5 / Sonnet 4.6**。③ **保存到项目弹窗**：修正 **底部按钮区** 与列表 **遮挡/贴边**。④ **`/parsing`**：**初版**为两步递进 + 约 **2.5s** 跳转；**9.3 收尾**改为 **四步依次展示**后再跳转（以代码为准）；取消解析回首页。⑤ **输入区 focus（9.2 前曾迭代）**：收尾为 **无 ring / outline / 背景 / 阴影**，**仅保留文本光标**（首页大 textarea、项目页快速解析条）。 |
| **本轮涉及文件** | `home-note-panel.tsx`、`project-page-view.tsx`、`model-select.tsx`、`save-to-project-dialog.tsx`、`parsing-page-view.tsx` 等（全局 UI 另见仓库历史） |
| **构建** | **`npm run build` 已通过** |

### 第九阶段 9.2：页面视觉统一 + 收尾交互（✅ 已验收通过）

| 项 | 说明 |
|----|------|
| **状态** | ✅ **9.2 已完成并已验收通过**。 |
| **目标** | 不接新功能、不接真实 API、**不改主流程与页面结构**；统一 **1020 内容体系** 下的页面壳与卡片 token，使各页更像同一套 SaaS。 |
| **视觉统一（第一轮）** | 在 **`src/lib/r2a-ui-classes.ts`** 收口 **`r2aPageShell1020`**（`max-w-[1020px]`、`px-6`、`pt-8 pb-10`、主区块 `gap-8`）、**`r2aPageSectionStackGap`**（Tab+内容列 `gap-5`）、**`r2aCardRadius` / `r2aCardShadow` / `r2aSectionCardShell` / `r2aKnowledgeMiniCardShell` / `r2aPlainWhitePanel`**、顶栏 **`r2aContentPageHeaderRow` / `r2aContentPageHeaderActions`**（统一 **`lg:`** 断点）、Tab **`r2aTab*`**（与详情 Figma「06」一致的 **64px** 下划线）。**`/result`** 与 **`NoteDetailView`** 优先对齐；**`/parsing`**、**`/projects/[projectId]`** 纳入同一页面壳与卡片阴影；**首页 `/`** 外层用 **1020 壳**，内层 **`r2aHomeInnerColumn`（max 720）** 保持输入聚焦区不拉满。**`/parsing` LIVE** 卡阴影与全站 **`r2aCardShadow`** 一致（原 `16px` 扩散已收束）。 |
| **收尾交互修复** | ① **详情页**右上「⋯」：与 **`/result`** 一致 **`DropdownMenu`**（复制链接 / 删除 Toast）；外包 **`relative z-20 shrink-0`** 避免叠层或 flex 挤压导致点击无效。② **首页**输入卡左下「+」：**Toast**「添加附件功能暂未开放」。③ **`/result`**「+ 添加自定义卡片」：**Toast**「自定义知识卡片功能暂未开放」。详情页无同名「添加自定义卡片」入口，**未新增按钮**（免改布局）。 |
| **主要涉及文件** | `r2a-ui-classes.ts`、`result-page-view.tsx`、`note-detail-view.tsx`、`parsing-page-view.tsx`、`project-page-view.tsx`、`home-note-panel.tsx`（以仓库为准） |
| **构建** | **`npm run build` 已通过** |

### 第九阶段 9.3：主流程完整走查 + 收尾修复（✅ 已通过）

| 项 | 说明 |
|----|------|
| **状态** | ✅ **已通过**（走查、问题记录、收尾修复、人工复验）；**不是新功能开发阶段**的结论保持不变。 |
| **完成内容（摘要）** | **mock 主链路**跑通；**`/parsing`** 四步完整展示后再 **`/result`**；取消无幽灵跳转；**编辑** Toast；Sidebar **新增项目**、**⋯**、**active 选中态**、**行高**、**icon** 等小修；**`npm run build`** 通过。详见 `docs/Read2Action_9.3_问题记录表.md`、`Read2Action_决策日志.md`（2026-05-12）。 |
| **与 9.2 的关系** | 9.2 **视觉与轻交互收口**；9.3 **流程与反馈一致性**及登记问题的 **收尾修复**。 |

### 第十阶段：真实可用性检查与上线准备（⏳ 当前阶段）

| 项 | 说明 |
|----|------|
| **状态** | ⏳ **已立项**；新开对话请以此阶段为默认上下文。 |
| **目标** | **不是**以作品集包装为首要目标；而是把 Read2Action 当作 **真实可用的小产品**，优先 **上线前稳定性、实用性、部署准备**（如错误边界、预览环境、构建与部署清单、基础可访问性/控制台粗检等，以具体立项为准）。 |
| **暂不做** | 不接 **真实 AI API**；不接 **数据库**；不做 **登录注册**；不做 **真实删除 / 重命名 / 分享**；不做 **2.0 视觉大改**；**不重新讨论**产品方向与 **页面结构**。 |

---

## 3. 当前项目目录结构（`src` 关键部分）

```text
src/
├── app/
│   ├── layout.tsx                 # 根布局 + AppLayout
│   ├── globals.css
│   ├── page.tsx                   # 首页 /
│   ├── parsing/page.tsx           # /parsing
│   ├── result/page.tsx           # /result
│   └── projects/
│       └── [projectId]/
│           ├── page.tsx           # 项目笔记列表
│           └── notes/
│               └── [id]/
│                   └── page.tsx   # 笔记详情
├── components/
│   ├── layout/
│   │   ├── app-layout.tsx
│   │   └── app-sidebar.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── sonner.tsx
│   │   └── model-select.tsx
│   ├── input/
│   │   └── home-note-panel.tsx
│   ├── parsing/
│   │   └── parsing-page-view.tsx
│   ├── result/
│   │   ├── result-page-view.tsx
│   │   └── save-to-project-dialog.tsx
│   ├── projects/
│   │   └── project-page-view.tsx
│   └── notes/
│       └── note-detail-view.tsx
├── data/
│   ├── projects.mock.ts
│   ├── notes.mock.ts
│   └── result.mock.ts
├── lib/
│   ├── utils.ts
│   └── r2a-ui-classes.ts
└── types/
    └── index.ts
```

---

## 4. 当前已实现路由与页面状态

| 路由 | 状态说明 |
|------|-----------|
| **`/`** | 首页：外层 **1020 页面壳** + 内层 **约 720** 输入聚焦列；新笔记输入区 +「你将获得」四卡；**空输入**主按钮置灰仍可 Toast；左下「+」→ Toast「添加附件功能暂未开放」；有内容「开始解析」→ `/parsing`（**9.3** 起主按钮左侧 **Sparkles** 轻量对齐）；模型 **DropdownMenu** 风格 |
| **`/parsing`** | 解析中 UI：**9.2** 与 **1020 页面壳**、**`r2aCardShadow`** 一致；**9.3 终态**：**四步依次展示**后跳转 **`/result`**；取消回 **`/`** 且无幽灵跳转 |
| **`/result`** | 解析结果：**9.2** 顶栏 / Tab / `SectionCard` 与详情对齐；默认「内容总结」Tab 完整；「原文对照」占位；**保存到项目弹窗**、导出 Toast、**更多** Dropdown；知识卡区「+ 添加自定义卡片」→ Toast 占位 |
| **`/projects/sha`** | 项目「沙」：**9.2** 页面壳 + 表格白卡 token；顶部快速解析条；行点击进入详情 |
| **`/projects/sha/notes/[id]`** | 笔记详情：**9.2** 与结果页顶栏 / Tab / 卡片 token 对齐；右上「⋯」与 **`/result`** 同款下拉；「内容总结」完整；「原文对照」按「06」实现（`rawContent` + 说明区 + Tab） |

说明：

- **`/projects/[projectId]`** 对任意 `mockProjects` 里存在的 `projectId` 均可访问；不存在则 **404**。  
- 详情页要求 **`note.projectId === projectId`**，否则 **404**。  
- 示例笔记 id（`sha`）：`note-growth`、`note-figma-config`、`note-bml`、`note-ai-era`、`note-saas-arch` 等（以 `notes.mock.ts` 为准）。

---

## 5. 当前 mock 数据说明

### `projects.mock.ts`

- **`mockProjects`**：`新项目(new)`、`沙(sha)`、`项目一`、`百度文库`、`旋旋又转转`、`工业设备` 等。  
- **`getProjectById(id)`**：项目目录页、笔记详情页取项目名 / 校验用。

### `notes.mock.ts`

- **`mockNotes`**：多条 `Note`（含 `projectId`、`title`、`summary`、`rawContent`、`keyInsights`、`actionItems`、`knowledgeCards`、`tags`、`wordCount`、`createdAt` 等）。  
- **`getNotesByProjectId(projectId)`**：项目列表页。  
- **`getNoteById(id)`**：笔记详情页。

### `result.mock.ts`

- **`mockParseResult`**：`ParseResultPreview`（标题、来源、标签、字数、summary、keyInsights、actionItems、knowledgeCards 等）。  
- **使用页面**：`/result`（`ResultPageView` 内默认引用）。

---

## 6. 当前 Figma 对齐情况（已读取 / nodeId）

以下 nodeId 多为 **历史会话** 或通过 **`use_figma` 按名称查找** 得到；**「05-笔记详情-内容总结」** 在第六阶段当次 **MCP 未连接**，仍未稳定记录读稿 nodeId。**「06-详情里的原文」** 已在第七阶段通过 MCP 成功读取（见上表）。

| 页面 / Frame | 名称 | nodeId（若曾成功读取） |
|----------------|------|-------------------------|
| 首页 / 新笔记 | 页面内 Frame「01-首页…」或通过页面 `6:4` 取到整页结构 | **`6:4`**（页面 `read2action 1.0`，子级含首页 Frame） |
| 解析中 | `02-解析中` | **`13:50`** |
| 解析结果 | `03-解析结果` | **`13:54`** |
| 项目目录 | `04-项目目录`（Screen → Main） | **`13:58`** |
| 笔记详情 · 内容总结 | `05-笔记详情-内容总结` | **未稳定记录**（第六阶段 MCP 未连接；仍以稿为准后续可对齐） |
| 笔记详情 · 原文对照 | **`06-详情里的原文`** | **`100:2139`**（第七阶段已读稿并实现） |

---

## 7. 当前已知问题 / 后续统一细修项（9.2 后仍适用）

- **字体**：设计稿多为 PingFang / Inter，浏览器多为系统字体，字重与字宽会有偏差。  
- **间距 / 圆角 / 阴影**：以交接文档与已读 Frame 为参考，**非**处处像素级对齐（9.2 已 token 化主要页面壳与卡片，细修可继续迭代 token）。  
- **日期格式**：列表页偏 `en-US` 短日期；详情页 meta 用 **`zh-CN` 数值日期**；全站可再统一。  
- **表格 / 卡片宽度**：部分区块仍有 **内部 max-w**（如 `770px` 文案宽），与 **1020 壳** 并存，可按需在后续收束。  
- **笔记详情**：未对 Figma「05-笔记详情-内容总结」做读稿像素对齐；**方法论沉淀** 为占位；**原文对照**（详情路由）已按「06」实现；**`/result`「原文对照」Tab** 仍为占位。  
- **交互占位**：多处「编辑 / 导出 / 保存」仍为 **mock**（无真实业务后端）；**删除 / 自定义卡片 / 附件** 等为 **Toast 占位**。  
- **解析中**：「取消解析」为 **直接回首页**并清除定时器（**9.3** 已消除幽灵跳转）；交接文档曾列的 **确认弹窗** 若需与稿一致可后续小步补。  

---

## 8. 下一阶段建议

### 当前：**第十阶段 — 真实可用性检查与上线准备**

1. **第九阶段 9.1、9.2、9.3 已全部通过**；主流程与登记问题已 **收尾复验**（见 `Read2Action_9.3_问题记录表.md`）。  
2. **10.0（本地部署前检查）**：**已通过** — `npm run lint`、`npm run build` 通过；`npm run dev` 下主要路由与主流程基本正常（见 `Read2Action_决策日志.md` **2026-05-14**）。  
3. **10.1（GitHub + Vercel）**：GitHub **空仓库**已创建：**`https://github.com/shamingxin/read2action.git`**；本地项目 **尚未 push**。**建议新开对话** 继续：`git init`（若需）、核对 `.gitignore`、首次 `commit`、`remote` 绑定上述地址、`push`，再 **Vercel** 部署。  
4. **并行排期**（非阻塞第十阶段）：`/result` 原文对照真实内容、方法论占位、Figma「05」读稿、日期与栅格统一、取消解析确认弹窗等。

### 第十阶段暂不要做

- **不要** 接真实 **AI API**、**数据库**、**登录注册**。  
- **不要** 做 **真实删除 / 重命名 / 分享**（仍以占位与体验检查为主，除非产品改边界）。  
- **不要** 做 **2.0 视觉大改**；**不要** **重讨论**产品方向与 **页面结构**。  
- **不要** 无边界扩张 **2.0** 功能（见原 `docs` 边界）。

---

## 9. 新 Cursor 对话开头提示词（可直接复制）

```text
请先阅读项目 docs 目录下的《Read2Action_Cursor_新对话接力文档_v2026-05-09.md》、《Read2Action_当前进度快照_v0.8.md》、《Read2Action_决策日志.md》，以及 Read2Action_Cursor开发交接总文档.md、Read2Action_交互跳转逻辑文档.md、Read2Action_Cursor_Rules.md 等，理解 1.0 范围与当前进度。

当前第一至第八阶段已完成；第九阶段 9.1、9.2、9.3 均已通过（接力文档 §2）。第十阶段 10.0 本地部署前检查已通过（lint/build + dev 主流程）。10.1：GitHub 空仓库 https://github.com/shamingxin/read2action.git 已创建，代码尚未 push；下一新对话可执行 Git 初始化、检查 .gitignore、首次 commit、绑定 remote 并 push，然后 Vercel 部署。第十阶段暂不接真实 AI API、数据库、登录注册，不做真实删除/重命名/分享，不做 2.0 视觉大改，不重讨论产品方向与页面结构。

不要接 Supabase / 真实登录，不要扩展 2.0 功能。
```

---

**文档路径**：`docs/Read2Action_Cursor_新对话接力文档_v2026-05-09.md`
