# Read2Action · 界面设计规范 v1.0

> **文档版本**：v1.0（1.3-0 重写版）
> **创建阶段**：1.3-0（设计规范沉淀 + 本地 HTML 视觉预览）
> **修订日期**：2026-06-09
> **状态**：草案 · 供 1.3 后续小步 UI 统一参考
> **配套预览**：`docs/核心记录/Read2Action_界面设计规范_v1.0_preview.html`
> **设计参考**：`DESIGN-notion.md`（唯一主参考）— token、色彩逻辑、字体层级、按钮、卡片、输入框、布局节奏直接映射为 Read2Action 自有规范，非 Notion 品牌复刻。

---

## 1. 文档目的

本规范为 Read2Action **1.3「账号登录 + 数据库版」** 及后续轻量 UI 统一提供 **单一视觉真值**。

具体目标：

1. 确立 **paper-calm productivity** 视觉基调：暖纸感画布 + 白色卡片 + 近黑文字 + 单一蓝色主操作色。
2. 给 Cursor 及后续 Agent 提供 **可执行的 token、组件与页面约束**，减少 UI 漂移。
3. 给人工验收提供 **对照清单**，规范本身 **不能替代** 浏览器实机验收。

---

## 2. 适用范围

| 适用 | 不适用 |
|------|--------|
| 1.3 登录 / 注册页新增与调整 | 1.2 功能逻辑改动 |
| 1.3 云端同步状态展示 | 大规模 UI 重构、官网化 Hero |
| 1.3-E 轻量 UI 统一（按钮、卡片、输入框、标签、Toast 等） | 会员付费、多人协作、文件上传 |
| 新增空状态、错误态、加载态 | App / 小程序 / 浏览器插件 |
| docs 内 HTML 视觉预览与 PRD 引用 | Notion 品牌、Notion logo、Notion 专属字体 |

**与 `01_项目总说明.md` §13 的关系**：§13 为 1.0 历史色值（如 `#4F46E5`）。本规范为 **1.3 演进方向**；1.3-F 统一 UI 时以本规范为准，**分小步迁移**，不在 1.3-0 一次性改完业务代码。

---

## 3. Agent 执行约束

执行任何 **1.3 UI 相关** 任务前，须：

1. **先读取** 本文件与 HTML 预览。
2. **只改** 当前小步允许的文件范围（见 `03_下一步任务清单.md` 与对应启动方案）。
3. **优先复用** 现有组件与布局（侧边栏、1020 壳层、主链路页面结构）；仅做 **局部** token / 样式对齐。
4. **禁止** 因 UI 统一而改动解析 A+B+C 防重复、localStorage 读写契约、路由与数据流。
5. **禁止** 将 AI 状态色 / accent 色用于全局主按钮、导航高亮、大面积背景。
6. 完成后列出 **改动文件 + 对照本规范 §17 验收项**，交由人工验收；**Agent 不得自行宣布 UI 验收通过**。

---

## 4. 产品气质

Read2Action 是一款 **AI 知识整理与行动转化** 工具，界面应传达：

| 维度 | 目标气质 | 避免 |
|------|----------|------|
| 整体 | 内容优先、工具感、文档感、安静、克制 | 营销官网、大图 Hero、赛博霓虹风 |
| 画布 | 暖纸感 / off-white 底、白色卡片与面板 | 冷灰 SaaS 模板感、纯白铺底 |
| AI | 轻 AI 感、状态可感知、不抢内容 | 渐变大色块、全屏动效、AI 色铺满界面 |
| 操作 | 单一蓝色主操作色、路径清晰、低装饰 | 多 accent 色竞争、重阴影层级 |

**一句话**：像一位安静的阅读助手，而不是 flashy 的 AI 演示页。

---

## 5. 设计原则

### 5.1 内容优先

- 界面 chrome 退后，**笔记、解析结果、项目列表** 是视觉中心。
- 减少装饰性渐变、大图、营销文案块。
- 信息层级靠 **字号、字重、间距**，不靠 heavy shadow 或强色块。

### 5.2 暖纸感阅读画布

- **浅色模式**：页面底色使用 warm paper / off-white（`--r2a-canvas-soft` `#f6f5f4`），卡片使用白色（`--r2a-surface` `#ffffff`）。
- **深色模式**：底色为暖深灰（`#1c1a17`），非纯黑；卡片为稍浅暖灰（`#2b2822`），制造轻微层次。
- 始终保持「页面底 → 卡片面 → 文字」三层清晰。

### 5.3 Hairline 轻边框、微弱阴影

- 卡片与容器默认 **1px hairline 边框**，**不用或极少用** drop shadow。
- 若需要浮起感（modal、toast），用多层近透明微叠影，不用 hard cast。

### 5.4 单一蓝色主操作色

- 全站 **仅一个** 主操作色（Notion Blue 体系）：登录、注册、保存、确认等主要 CTA。
- 链接、次按钮、ghost 按钮 **不得** 再引入第二个品牌级强调色。
- Accent 色（多彩装饰色）**只用于** 小面积装饰、状态标签、插画，**禁止** 用作结构色和主按钮色。

### 5.5 不破坏 1.2 主链路

- 首页输入 → 解析中 → 结果 → 保存到项目 → 项目列表 → 笔记详情：**布局与交互顺序不变**。
- 1.3-0～1.3-D 阶段 **不要求** 全站换肤；UI 统一集中在 **1.3-F** 小步执行。

---

## 6. 色彩规范

### 6.1 Token 命名约定

CSS 变量前缀：`--r2a-*`。文档与代码引用时使用下表 **Token 名**，避免散落 hex。

### 6.2 浅色（Light）Theme Token

**结构色（可用于按钮、卡片、文字、边框、页面背景等 UI 结构）：**

| Token | Hex | 用途 |
|-------|-----|------|
| `--r2a-primary` | `#0075de` | 主按钮、主要 CTA、focus ring、链接 |
| `--r2a-primary-active` | `#005bab` | 主按钮按下 / active |
| `--r2a-on-primary` | `#ffffff` | 主按钮文字 |
| `--r2a-primary-bg` | `#e8f3fd` | 主色极浅底（badge-primary、选中态浅底） |
| `--r2a-canvas` | `#ffffff` | 卡片、面板、输入框、nav 表面 |
| `--r2a-canvas-soft` | `#f6f5f4` | 页面暖色阅读底（warm paper） |
| `--r2a-surface` | `#ffffff` | 组件层卡片表面（与 canvas 同义） |
| `--r2a-ink` | `#000000` | 主标题、强调正文 |
| `--r2a-ink-secondary` | `#31302e` | 次要正文、footer 文字 |
| `--r2a-ink-muted` | `#615d59` | 辅助说明、元信息 |
| `--r2a-ink-faint` | `#a39e98` | 占位符、禁用文字、时间戳 |
| `--r2a-hairline` | `#e6e6e6` | 1px 边框、分割线 |

**单一 Dark Band（仅允许一个 Hero 区块反转时使用）：**

| Token | Hex | 用途 |
|-------|-----|------|
| `--r2a-dark-band` | `#213183` | 深色 Hero 区块（如需要；仅单次出现，勿重复） |

### 6.3 深色（Dark）Theme Token

**结构色：**

| Token | Hex | 用途 |
|-------|-----|------|
| `--r2a-primary` | `#0075de` | 主按钮（与浅色保持一致，白字 AA 对比度约 4.7:1 通过） |
| `--r2a-primary-active` | `#005bab` | 主按钮按下 |
| `--r2a-on-primary` | `#ffffff` | 主按钮文字 |
| `--r2a-primary-bg` | `#0b1e33` | 主色极浅底（深色模式下 badge-primary 底色） |
| `--r2a-canvas` | `#2b2822` | 卡片、面板、输入框 |
| `--r2a-canvas-soft` | `#1c1a17` | 页面暗底（暖深灰，非纯黑） |
| `--r2a-surface` | `#2b2822` | 组件层卡片表面 |
| `--r2a-ink` | `#f0ede6` | 主文字（暖白） |
| `--r2a-ink-secondary` | `#c4bfb5` | 次要文字 |
| `--r2a-ink-muted` | `#9a948a` | 辅助说明（提亮以保证深色可读性） |
| `--r2a-ink-faint` | `#736d64` | 占位符、禁用（提亮以保证深色可读性） |
| `--r2a-hairline` | `#3d3932` | 分割线、默认边框（提亮以保证深色可见性） |

> **深色模式使用说明**：
> - 页面背景用 `canvas-soft`（`#1c1a17` 暗底），卡片 / 面板用 `surface`（`#2b2822` 稍浅），形成轻微层次
> - Primary 提亮至 `#3d92f5`，保证在深色背景上达到 WCAG AA 对比度
> - Hairline 改为暗色体系的深暖灰 `#302d27`
> - 深色模式里仍然不应出现大面积彩色区块；accent 使用规则与浅色模式相同

> **CSS 变量命名说明**：所有 token 统一使用 `--r2a-*` 前缀，避免与全局短命名冲突。HTML 预览与业务代码须保持一致。

### 6.4 Accent 色（**仅限装饰 / 状态 / 小面积标签**）

以下颜色**严禁**用于结构色、主按钮或大面积背景：

| Token | Hex | 允许用途 |
|-------|-----|----------|
| `--r2a-accent-sky` | `#62aef0` | AI 解析：阅读阶段 pill、小面积插画 |
| `--r2a-accent-purple` | `#d6b6f6` | AI 解析：提炼阶段 pill、小面积插画 |
| `--r2a-accent-orange` | `#dd5b00` | AI 解析：理解阶段 pill（文字色）、小面积插画 |
| `--r2a-accent-teal` | `#2a9d99` | 小面积装饰、插画 |
| `--r2a-accent-green` | `#1aae39` | 成功状态 icon / 小标签（与 success 复用） |
| `--r2a-accent-pink` | `#ff64c8` | 插画装饰（极少使用） |

### 6.5 语义色（**限定语义场景**）

| Token | Light | Dark | 配套浅底 Token | 用途 |
|-------|-------|------|---------------|------|
| `--r2a-success` | `#1aae39` | `#2ecc5a` | `--r2a-success-bg` | 成功 Toast、已同步、成功 icon |
| `--r2a-error` | `#e53935` | `#f56565` | `--r2a-error-bg` | 错误、校验失败、同步失败 |
| `--r2a-warning` | `#f59e0b` | `#fbbf24` | `--r2a-warning-bg` | 警告、需注意、待迁移 |

浅底色示例：Light `--r2a-success-bg: #e6f9eb`；Dark `--r2a-success-bg: #0b2714`。用于 badge / Toast 背景，不用于大面积区块。

### 6.6 云端同步状态色（**仅用于同步 UI**）

| 状态 | 视觉 Token | 用法 |
|------|-----------|------|
| 本地模式 | `--r2a-ink-faint` | 小 pill，侧栏，无强调 |
| 待同步 | `--r2a-warning` | 小 pill |
| 同步中 | `--r2a-accent-sky` | 小 pill + spinner |
| 已同步 | `--r2a-success` | 小 pill |
| 失败 | `--r2a-error` | 小 pill + text link「重试」 |

**严禁**将同步色用作全站主色或主按钮。

### 6.7 色彩约束汇总

| 类型 | Token | 允许结构用途 | 禁止 |
|------|-------|-------------|------|
| 主操作色 | `primary` | 按钮、focus ring、链接 | 装饰、大面积背景 |
| 表面色 | `canvas`, `surface`, `canvas-soft` | 页面底、卡片、输入框 | 彩色化 |
| 文字色 | `ink` 系列 | 文字分层 | 背景色使用 |
| 边框色 | `hairline` | 1px 边框、分割线 | 彩色化 |
| Accent 色 | `accent-*` | 小标签、插画、AI 状态 pill | 主按钮、结构背景、导航高亮 |
| 语义色 | `success/error/warning` | Toast、inline 校验 | 主色替代 |

---

## 7. 字体规范

### 7.1 字体族

| 用途 | 字体栈 |
|------|--------|
| 界面正文 / 标题 | `'Inter', system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif` |
| 等宽（原文、代码块） | `'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace` |

> `NotionInter` 是 Notion 私有字体，Read2Action 直接使用开源 **Inter**，并显式应用 `DESIGN-notion.md` 中相同的 letter-spacing 值，以复现其标题紧凑感。不引入 Notion 品牌字体文件。

### 7.2 字号层级（对应 DESIGN-notion.md 字型规范）

| Token | 字号 | 字重 | 行高 | 字间距 | 用途 |
|-------|------|------|------|--------|------|
| `display-lg` | 40px | 700 | 1.1 | -0.025em | 页面主标题（首页、登录页） |
| `display-md` | 26px | 700 | 1.23 | -0.02em | 区块标题、结果页分组标题 |
| `title` | 20px | 600 | 1.4 | -0.006em | 卡片大标题、对话框标题 |
| `title-sm` | 18px | 600 | 1.4 | 0 | 卡片副标题、项目名 |
| `body-md` | 16px | 400 | 1.5 | 0 | **默认正文** |
| `body-sm` | 15px | 400 | 1.33 | 0 | 次要正文、导航文字 |
| `button` | 16px | 500 | 1.5 | 0 | 按钮文字 |
| `caption` | 14px | 400 | 1.43 | 0 | 说明、时间戳 |
| `eyebrow` | 12px | 600 | 1.33 | +0.01em | 区块标签、状态 pill（uppercase） |
| `code-sm` | 13px | 400 | 1.55 | 0 | 原文对照、摘录 |

### 7.3 原则

- Display 级别必须显式应用 **负 letter-spacing**，不得使用默认 tracking（Inter 默认 tracking 比 NotionInter 宽松）。
- 标题 **600–700**，正文 **400**，按钮 **500**；避免 300 细体。
- 长文区域（笔记详情、解析结果正文）优先 **body-md + 1.5 行高**。

---

## 8. 间距与圆角

### 8.1 间距（基准单位 8px，对应 DESIGN-notion.md spacing 规范）

| Token | 值 | 典型用途 |
|-------|-----|----------|
| `space-xxs` | 4px | icon 与文字间距 |
| `space-xs` | 8px | 紧凑堆叠 |
| `space-sm` | 12px | 表单项内间距、pill padding |
| `space-md` | 16px | 卡片内 padding 最小单位、nav padding |
| `space-lg` | 24px | 卡片标准 padding |
| `space-xl` | 28px | 区块间距 |
| `space-xxl` | 32px | 大区块、hero padding |
| `space-section` | 64px | 登录页、空状态垂直留白 |

### 8.2 圆角（对应 DESIGN-notion.md rounded 规范）

| Token | 值 | 用途 |
|-------|-----|------|
| `radius-xs` | 4px | 输入框（tight，接近 Notion text-input 风格） |
| `radius-sm` | 5px | 菜单行、list 项 |
| `radius-md` | 8px | Utility 按钮、小卡片 |
| `radius-lg` | 12px | 标准卡片、对话框、图片井 |
| `radius-xl` | 16px | 大容器、Toast |
| `radius-pill` | 9999px | 主 CTA 按钮、badge pill |

> **按钮圆角约定**：Primary / Secondary 主 CTA 按钮使用 `radius-pill`（全圆角，营销风格）；Utility 按钮、表单内按钮使用 `radius-md`（8px）；输入框使用 `radius-xs`（4px，不得用 pill）。

### 8.3 布局宽度（继承 1.2）

- 页面壳层：继续 `r2aPageShell1020`（max ~1020px）逻辑。
- 首页输入列：内层约 **720px**。
- 登录 / 注册卡片：max-width **400–440px**，水平居中。

---

## 9. 组件规范

### 9.1 按钮

| 变体 | 背景 | 文字 | 边框 | 高度 | 圆角 |
|------|------|------|------|------|------|
| **Primary** | `--r2a-primary` | `--r2a-on-primary` | none | 44px | `radius-pill` |
| **Secondary** | `--r2a-surface` | `--r2a-ink` | 1px `--r2a-hairline` | 44px | `radius-pill` |
| **Utility** | `--r2a-surface` | `--r2a-ink` | 1px `--r2a-hairline` | 36px | `radius-md` |
| **Ghost / Text** | transparent | `--r2a-ink` 或 `--r2a-primary` | none | auto | — |
| **Disabled** | `--r2a-canvas-soft` | `--r2a-ink-faint` | 1px `--r2a-hairline` | 44px | `radius-pill` |

- Primary **全站唯一** 实心强调按钮色，不允许出现第二个填充色 CTA。
- **禁止** 用 accent 色（多彩装饰色）作为按钮填充。
- 按下态：Primary → `--r2a-primary-active`；Secondary → `--r2a-canvas-soft`。
- Focus：2px outline `--r2a-primary`，`outline-offset: 2px`。

### 9.2 输入框

- 背景：`--r2a-surface`
- 边框：1px，`rgba(0,0,0,0.14)`（浅色）/ `--r2a-hairline`（深色）
- 圆角：`radius-xs`（4px，接近 Notion text-input 风格，**不得用 pill**）
- 高度：**44px**（单行）；textarea 最小高度 **120px**
- Focus：`box-shadow: 0 0 0 2px --r2a-primary`（soft ring）
- 占位符：`--r2a-ink-faint`
- 错误：边框 `--r2a-error` + caption 错误文案
- 内边距：`6px 12px`

### 9.3 卡片

- 背景：`--r2a-surface`
- 边框：1px `--r2a-hairline`
- 圆角：`radius-lg`（12px）
- 内边距：`space-lg`（24px）标准；紧凑列表卡片 `space-md`（16px）
- **默认无 shadow**；需浮起感时用 Notion 式多层近透明叠影（见 §9.7）
- hover：背景 `--r2a-canvas-soft`，边框略深

### 9.4 标签（Tag / Badge）

| 类型 | 样式说明 |
|------|---------|
| 默认 | `--r2a-canvas-soft` bg + `--r2a-ink-secondary` text + `eyebrow` + `radius-pill` + hairline 边框 |
| Primary（链接/品牌） | `primary-bg（极浅蓝）` + `--r2a-primary` text |
| 成功 | 浅绿底 + `--r2a-success` text |
| 错误 | 浅红底 + `--r2a-error` text |
| 警告 | 浅黄底 + `--r2a-warning` text |
| AI 解析阶段 | 对应 `--r2a-accent-*` 浅底 + 深字，`eyebrow` uppercase，`radius-pill` |

### 9.5 Toast

- 背景：`--r2a-surface`
- 边框：1px `--r2a-hairline`
- 圆角：`radius-xl`（16px）
- 阴影：Notion Level-2 式多层近透明叠影
- 宽度：fit-content，max 320px；居右下角或居中
- 语义图标色可用 `success / error / warning`；**Toast 背景不用彩色**
- 文字：`body-sm`，`--r2a-ink-secondary`

### 9.6 图标使用规范

- 正式业务 UI **优先使用线性（outline）图标库**（如 Heroicons、Lucide 等），色值通过 `currentColor` 继承，跟随 token 自动适配深浅色。
- **不建议** 将 emoji 直接用作正式图标资产：emoji 在不同平台字形、尺寸差异大，深色模式下渲染不可控。
- HTML 视觉预览文件中使用 emoji 仅作为 **示意占位**，上线前须替换为对应线性图标组件。

### 9.7 空状态

- 居中布局，上下 `space-section` 级留白
- 图标：线性、单色 `--r2a-ink-faint`，48px
- 标题：`title-sm` + `--r2a-ink`；说明：`caption` + `--r2a-ink-muted`
- 单一 Primary 引导按钮（若有）
- 背景：`--r2a-canvas-soft`，圆角 `radius-xl`

### 9.8 阴影规范

| 级别 | 用法 | 写法示意 |
|------|------|---------|
| 0 — Flat | 默认卡片、列表行 | 仅 hairline border，无 shadow |
| 1 — Soft | 浮起卡片、toast、dropdown | 多层近透明叠影，最深层约 `rgba(0,0,0,0.04) 0 4px 18px` |
| 2 — Elevated | Modal、popover | 更深 5 层叠影，最深约 `rgba(0,0,0,0.06) 0 12px 32px` |

**不使用** 单层 hard drop-shadow（如 `box-shadow: 0 4px 12px rgba(0,0,0,0.15)`）。

---

## 10. 登录 / 注册页面规范

1. **布局**：单列居中卡片，max-width **400–440px**；页面底 `--r2a-canvas-soft`。
2. **结构**：产品名 → 标题（`display-md`）→ 简短说明（`caption` muted）→ 表单 → Primary CTA → 次链接（切换登录 / 注册）。
3. **表单字段**：邮箱 + 密码（注册含确认密码）；label 用 `caption` + `--r2a-ink`。
4. **主按钮**：「登录」「注册」用 **Primary**（全宽）；「忘记密码」用 ghost / text link。
5. **气质**：工具型账号门，不是营销落地页。**禁止** 大图 Hero、OAuth 大图标墙。
6. **场景文案**：
   - 页面主标题：「登录 Read2Action」
   - 副说明：「把阅读转化为行动」

---

## 11. 云端同步状态规范

1. **展示位置**：侧栏用户区旁 / 顶栏 subtle 指示；**不做** 大面积横幅。
2. **状态表**：

   | 状态 | 文案示例 | 视觉 |
   |------|----------|------|
   | 本地模式 | 当前数据仅保存在本机 | ink-faint 小 pill |
   | 待同步 | 等待同步 | warning 小 pill |
   | 同步中 | 正在同步到云端 | sky 小 pill + spinner |
   | 已同步 | 已同步 | success 小 pill |
   | 失败 | 同步失败，可重试 | error 小 pill + text link |

3. **颜色**：严格见 §6.6；**禁止** 与 Primary 混用。
4. **交互**：失败态提供 text「重试」；成功态 **不弹** intrusive 弹窗。

---

## 12. localStorage 数据迁移提示规范

- **触发时机**：首次登录后，检测到本地有未上传数据时。
- **组件形式**：非全屏、非 Modal 遮罩；优先用顶部提示条或卡片内嵌 inline banner。
- **样式**：`--r2a-surface` 底，左侧 4px `--r2a-warning` 色边线，圆角 `radius-md`。
- **文案规范**：
  - 标题：「本地数据待迁移」
  - 说明：「检测到 N 条本地笔记，登录后可跨设备同步项目和笔记，数据不会丢失。」
  - 操作：「立即同步」（Utility 按钮）/ 「暂时跳过」（Ghost）
- **禁止**：恐吓式红色全屏、强制阻断主链路、数据覆盖警告（应正向引导）。

---

## 13. 响应式规范

| 断点 | 宽度 | 要点 |
|------|------|------|
| Mobile | < 640px | 侧栏折叠或抽屉；登录卡片全宽减 margin；display-lg → 28px |
| Tablet | 640–1024px | 1020 壳层保留 padding；项目列表 1–2 列 |
| Desktop | ≥ 1024px | 完整侧栏 + 主内容 |

- 触控目标：主按钮 **最小 44×44px**
- **不做** 独立移动端 redesign

---

## 14. 禁止事项

1. **禁止** 将 accent 色 / 同步色 / AI 解析色用于 Primary 按钮、导航高亮、大面积背景。
2. **禁止** 卡片、按钮、导航默认加大阴影（`shadow-lg` 等）。
3. **禁止** 首页改成 ChatGPT 式对话流或官网式全屏 Hero。
4. **禁止** 1.3-0～1.3-D 为追求本规范而重构 1.2 已验收主链路。
5. **禁止** 引入第二套品牌 accent 色作为结构色或主 CTA 色。
6. **禁止** 输入框使用 `radius-pill`（输入框圆角限 `radius-xs` 4px）。
7. **禁止** 使用单层 hard drop-shadow（用 hairline + 多层微透明叠影代替）。
8. **禁止** Agent 跳过 HTML 预览与 §17 验收清单直接合并 UI 改动。
9. **禁止** 在产品 UI 中出现 Notion 品牌名称、logo 或其专属品牌资产。

---

## 15. 颜色对照（迁移参考）

| 1.0～1.2 历史 | 本规范 v1.0 | 备注 |
|---------------|-------------|------|
| `#F4F5F9` / `#F7F7FB` background | `--r2a-canvas-soft` `#f6f5f4` | 更暖，paper-calm 风格 |
| `#4F46E5` primary（indigo） | `--r2a-primary` `#0075de` | 从 indigo 迁移到 Notion Blue |
| `#2F6B62` primary（1.3 草案青绿） | **已废弃**，替换为 `#0075de` | 统一为 Notion Blue |
| `#E5E7EB` border | `--r2a-hairline` `#e6e6e6` | 几乎不变 |
| `#121212` text | `--r2a-ink` `#000000` | 近黑 |

---

## 16. 文档维护

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0-draft | 2026-06-09 | 1.3-0 首版（Apple/Cursor/Notion 混合方案，青绿主色） |
| v1.0 | 2026-06-09 | 1.3-0 重写：统一为 Notion 式 paper-calm 规范，移除青绿主色，加入 Light/Dark 双 theme |

后续 1.3-F UI 统一完成后，升 v1.1 并记录实际代码 token 映射（Tailwind / CSS variables）。

---

## 17. 人工验收清单

验收时在浏览器打开 `Read2Action_界面设计规范_v1.0_preview.html` 与（后续）实际页面对照：

### 17.1 Token 与气质

- [ ] 浅色模式：页面底为 warm paper `#f6f5f4`（非冷灰 `#F4F4F4`）
- [ ] 深色模式：页面底为暖深灰 `#1c1a17`（非纯黑 `#000000`）
- [ ] 卡片为白底（浅色）/ 暖深灰（深色）+ 轻 hairline 边框，无大投影
- [ ] 主操作色全站唯一 Notion Blue（浅色 `#0075de` / 深色 `#3d92f5`）
- [ ] Accent / AI / 同步色仅出现在小面积标签、插画、状态指示

### 17.2 组件

- [ ] Primary / Secondary / Utility / Ghost / Disabled 按钮语义清晰，圆角规则正确
- [ ] 输入框 4px 圆角，focus ring 可见，错误态可读
- [ ] Toast 轻量，不挡主内容
- [ ] 空状态文案克制，有明确下一步

### 17.3 登录 / 注册（1.3-B 起）

- [ ] 居中卡片，无营销 Hero
- [ ] 表单可键盘完成，Primary 单一
- [ ] 与已登录主壳视觉 token 一致

### 17.4 同步 & 迁移

- [ ] 同步状态颜色符合 §6.6
- [ ] 失败可重试，成功不骚扰
- [ ] 迁移期文案正向引导，不误导用户丢数据

### 17.5 主链路回归（1.3 全程）

- [ ] 输入 → 解析 → 结果 → 保存 → 项目 → 详情 **仍可走通**
- [ ] 解析 A+B+C 防重复仍有效（若触达解析链）
