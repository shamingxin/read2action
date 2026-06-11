# Read2Action · 界面设计规范 v1.1.2

> **文档版本**：v1.1.2（1.4-0 校正版；在 v1.1.1 基础上修复 HTML 预览排版与组件展示 bug）
> **创建阶段**：1.4-0（视觉规范确认与工程化修订）
> **修订日期**：2026-06-11
> **状态**：1.4 基准规范 · 待落地 · 取代 v1.0，供 1.4「产品气质重构 + 核心体验补齐」及后续 UI 改动参考
> **配套预览**：`docs/核心记录/Read2Action_界面设计规范_v1.1.2_preview.html`
> **关联文件**：`Read2Action_视觉迭代方向_v2.md`（下一版视觉/交互重构方向，本文件**不包含**）
> **设计语言**：warm-restrained editorial — 近白画布（仅一丝暖意，参考 Notion / Craft）+ 中文衬线 + 深墨蓝主色 + ink accent 装饰。温度来自字体与色彩搭配，不依赖米色画布。

---

## 1. 文档目的

本规范为 Read2Action 全站 UI 统一提供 **单一视觉真值**，取代 v1.0。

具体目标：

1. 确立 **warm-restrained editorial** 视觉基调：受控暖底 + 暖近黑文字 + 单一深墨蓝主色 + 中文衬线点睛。
2. 修正 v1.0 中"Notion Blue + 冷调画布"造成的气质割裂问题。
3. 给 Cursor 及后续 Agent 提供 **可执行的 token、组件与页面约束**，减少 UI 漂移。

## 2. 相对 v1.0 的核心变更（迁移摘要）

| 类别 | v1.0 | v1.1 | 理由 |
|------|------|------|------|
| 画布底 | `#f6f5f4` 冷调浅灰 | `#f8f7f3` 近白带一丝暖意 | 修正"暖意不足、SaaS 默认底"问题；同时回避 indie productivity 烂大街米色——温度交给中文衬线、ink accent、深墨蓝主色承担 |
| 卡片表面 | `#ffffff` 纯白 | `#ffffff` 纯白 | 与 Notion / Craft 一致：纯白卡片浮在略暖的画布上，是当代知识工具的标准做法 |
| 主操作色 | `#0075de` Notion Blue | `#1e4d80` 深墨蓝 | Notion Blue 是协作工具的"无情感清晰"，与"温暖陪伴"气质冲突；深墨蓝保留专业感，去掉冷感 |
| 主文字 | `#000000` 纯黑 | `#1f1d18` 暖近黑 | 纯黑在暖底上突兀；暖近黑更"墨水印在纸上" |
| Hairline | `#e6e6e6` 中性灰 | `#ebe9e2` 暖灰 | 与画布同温度的边线 |
| 字体 | 仅 Inter | Inter（界面）+ Noto Serif SC（中文标题、序号、卡片名） | 90% 内容是中文，中文衬线是最大的气质杠杆 |
| 主按钮圆角 | `radius-pill`（9999px） | `radius-md`（8px） | Pill 是营销/消费 App 视觉血统，与"安静知识工具"气质相冲；Bear / Craft / Notion / iA Writer / Things 都用圆角矩形 |
| 核心观点数字 | 紫色圆形 badge | 中文序号 `一、二、三` + 衬线 + ink accent 色 | "圆形 badge"是按钮的设计语言，不是知识的语言；中文衬线序号是真正的"知识沉淀"气质 |
| Accent 色 | 多色 accent-* 列表 | 单一 `--r2a-accent-ink` 墨棕色，**严格限定**用于标题序号 / 卡片 tag / 文本标记 | 多 accent 色对应 v1.0 试图覆盖 AI 解析阶段 pill 的需求，但实际造成视觉碎片；以 ink-accent 单色统一 |

---

## 3. 适用范围

| 适用 | 不适用 |
|------|--------|
| 1.4 起所有新增、调整页面 | 1.3 已上线功能逻辑与数据链路 |
| 笔记详情、解析结果、项目列表、首页输入 | 大规模 redesign（保留布局结构） |
| 登录 / 注册 / 空状态 / Toast | App / 小程序 / 浏览器插件 |
| docs 内 HTML 视觉预览 | 第三方品牌资产 |

**与 v1.0 的迁移关系**：v1.1 / v1.1.1 / v1.1.2 取代 v1.0。所有 v1.0 token 引用须在 1.4 阶段逐步迁移到 v1.1.2。**禁止** v1.0 与 v1.1.2 token 在同一页面共存。

---

## 4. Agent 执行约束

执行任何 UI 相关任务前，须：

1. **先读取** 本文件（v1.1）与 HTML 预览（v1.1）。
2. **只改** 当前小步允许的文件范围。
3. **优先复用** 现有组件与布局（侧边栏、1020 壳层、主链路页面结构）；只做 **局部** token / 样式对齐。
4. **禁止** 因 UI 统一而改动解析 A+B+C 防重复、Supabase Auth、middleware、Supabase 项目 / 笔记读写、RLS、路由与数据流。
5. 如涉及 localStorage 兼容逻辑，仅允许小范围保留 / 清理，不做迁移，不改变云端保存主链路。
6. **禁止** 将 ink-accent 色用于全局主按钮、导航高亮、大面积背景。
7. **禁止** 自行新增 accent 色或品牌色；如需增加，回到本文件升级设计规范版本。
8. 完成后列出 **改动文件 + 对照本规范 §18 人工验收清单**，交人工验收；**Agent 不得自行宣布 UI 验收通过**。
9. 涉及 v1.0 → v1.1.1 迁移时，使用 §2 与 §16 的对照表，**逐 token 替换**，不要"凭印象重写"。

---

## 5. 产品气质

Read2Action 是一款 **个人知识沉淀工具**（AI 是手段，长期回看是目的）。界面应传达：

| 维度 | 目标气质 | 避免 |
|------|----------|------|
| 整体 | 内容优先、安静、文档感、像一本随时翻开的笔记 | 营销官网、AI 演示页、对话流 UI |
| 画布 | 受控暖纸（不过暖，不过冷） | indie productivity 烂大街米色、冷灰 SaaS 模板 |
| 文字 | 暖近黑、中文衬线点睛、有"墨"感 | 纯黑、全程 Inter 无中文优化 |
| 操作 | 单一深墨蓝主色、低装饰 | 多 accent 色竞争、彩色按钮、pill 按钮 |
| AI | 轻 AI 感、状态可感知、不抢内容 | 渐变、紫色徽章、AI 色铺满 |

**一句话**：像一本你愿意每天打开的私人笔记，不是 SaaS 工具的 chrome。

---

## 6. 设计原则

### 6.1 内容优先

- 界面 chrome 退后，**笔记、解析结果、项目列表** 是视觉中心。
- 信息层级靠 **字号、字重、间距、字体（serif vs sans）**，不靠 heavy shadow 或强色块。
- 减少 / 避免大量"卡片套卡片"——主内容区用排版（标题 + 留白 + 分隔线）做层级，仅在"对象边界明确"时使用 card 容器（如知识卡片、笔记列表卡片）。

### 6.2 近白受控画布

- **浅色模式**：页面底 `--r2a-canvas-soft` `#f8f7f3`（近白，仅一丝暖意），卡片 `--r2a-surface` `#ffffff`（纯白）。两者形成"卡片浮在略暖画布上"的层次，与 Notion / Craft 同款做法。
- **深色模式**：底 `#1a1814` 暖深褐黑（非纯黑），卡片 `#25221c` 稍亮暖深灰。
- **温度的来源**：不是画布颜色，而是中文衬线 + ink accent + 暖近黑文字 + 暖色调阴影共同营造。
- **不**使用：冷灰画布（如 `#f4f5f7`）、纯黑文字、indie productivity 米色（如 `#f5f0e3` 及更暖）。

### 6.3 中文衬线点睛

- 整站默认 sans（Inter + Noto Sans SC）。
- **仅在以下场景**使用衬线（Noto Serif SC）：
  - 笔记标题（`display-md` / `display-lg`）
  - 知识卡片标题与分类 tag
  - 核心观点序号（中文数字 `一、二、三`）
  - section label（eyebrow）的辅助 serif
- 衬线 **不用于** 按钮、表单、导航、正文。

### 6.4 Hairline 轻边框、无 drop shadow

- 默认 1px hairline 边框，**不用** drop shadow。
- 浮起感（modal、toast、dropdown）用多层近透明微叠影（见 §9.8）。

### 6.5 单一深墨蓝主操作色 + 单一 ink-accent 装饰色

- 全站 **仅一个** 主操作色 `--r2a-primary` `#1e4d80`：登录、注册、保存、确认、focus ring、链接。
- 全站 **仅一个** ink-accent `--r2a-accent-ink` `#8b5a3c`：用于标题中文序号、知识卡片 tag、文本标记（`<mark>`）。
- **禁止** 再引入第二、第三个品牌强调色。
- 语义色（success/error/warning）仅用于状态 UI（Toast、内嵌校验），不参与主结构。

### 6.6 不破坏 1.3 已上线主链路

- 登录 → 首页输入 → 解析中 → 结果 → 保存到默认项目 / 指定项目 → 云端项目页 → 云端 note 详情页 → 刷新仍可读取：**布局与交互顺序不变，云端保存主链路不变**。
- v1.1.2 迁移期，UI 改动按页面小步进行，禁止一次性大规模重构。

---

## 7. 色彩规范

### 7.1 Token 命名约定

CSS 变量前缀：`--r2a-*`。文档与代码引用时使用下表 **Token 名**，避免散落 hex。

### 7.2 浅色（Light）Theme Token

**结构色：**

| Token | Hex | 用途 |
|-------|-----|------|
| `--r2a-primary` | `#1e4d80` | 主按钮、主 CTA、focus ring、链接 |
| `--r2a-primary-active` | `#163d68` | 主按钮按下 |
| `--r2a-on-primary` | `#ffffff` | 主按钮文字（浅色模式使用白色，暗色模式使用暖白） |
| `--r2a-primary-bg` | `#e8eff7` | 主色极浅底（选中态、链接 hover bg） |
| `--r2a-canvas` | `#ffffff` | 极少使用：仅当强对比白卡需要时（如 modal 内部） |
| `--r2a-canvas-soft` | `#f8f7f3` | 页面底（近白带一丝暖意） |
| `--r2a-surface` | `#ffffff` | 卡片、面板、输入框（纯白） |
| `--r2a-hover` | `#f2efe7` | nav item hover、按钮 hover bg |
| `--r2a-ink` | `#1f1d18` | 主标题、强调正文 |
| `--r2a-ink-secondary` | `#4a4640` | 次要正文 |
| `--r2a-ink-muted` | `#6e6a62` | 辅助说明、元信息 |
| `--r2a-ink-faint` | `#a8a39a` | 占位符、禁用文字、时间戳 |
| `--r2a-hairline` | `#ebe9e2` | 1px 边框 |
| `--r2a-hairline-soft` | `#f2f0ea` | section 内分隔线、dashed border |

**Ink Accent（单一装饰色）：**

| Token | Hex | 用途 | 严禁 |
|-------|-----|------|------|
| `--r2a-accent-ink` | `#8b5a3c` | 中文序号（核心观点 `一、二、三`）、知识卡片分类 tag、文本高亮标记字色 | 主按钮、导航高亮、大面积背景、表单 |
| `--r2a-accent-ink-bg` | `rgba(139,90,60,0.10)` | 文本 `<mark>` 高亮底色 | 任何结构色用途 |

### 7.3 深色（Dark）Theme Token

| Token | Hex | 用途 |
|-------|-----|------|
| `--r2a-primary` | `#5a87bd` | 主按钮（提亮以保证暗底可读，AA 通过） |
| `--r2a-primary-active` | `#7aa3d0` | 主按钮按下 |
| `--r2a-on-primary` | `#f0eadc` | 主按钮文字 |
| `--r2a-primary-bg` | `#162435` | 主色极浅底 |
| `--r2a-canvas` | `#1a1814` | 页面底（暖深褐黑，非纯黑） |
| `--r2a-canvas-soft` | `#1a1814` | 同上 |
| `--r2a-surface` | `#25221c` | 卡片表面（稍亮一档形成层次） |
| `--r2a-hover` | `#2f2b24` | hover bg |
| `--r2a-ink` | `#f0eadc` | 主文字（暖白） |
| `--r2a-ink-secondary` | `#c8c0b0` | 次要文字 |
| `--r2a-ink-muted` | `#928876` | 辅助说明 |
| `--r2a-ink-faint` | `#6e6557` | 占位符、禁用 |
| `--r2a-hairline` | `#3a3429` | 默认边框 |
| `--r2a-hairline-soft` | `#322d24` | 内分隔线 |
| `--r2a-accent-ink` | `#c89878` | ink accent（提亮版） |
| `--r2a-accent-ink-bg` | `rgba(200,152,120,0.14)` | 高亮底 |

### 7.4 语义色（**仅用于语义场景**）

| Token | Light | Dark | 浅底 Light | 浅底 Dark | 用途 |
|-------|-------|------|------------|-----------|------|
| `--r2a-success` | `#1aae39` | `#2ecc5a` | `#e6f9eb` | `#0b2714` | 成功 Toast、已同步 |
| `--r2a-error` | `#e53935` | `#f56565` | `#fde8e8` | `#2e1010` | 错误、校验失败 |
| `--r2a-warning` | `#f59e0b` | `#fbbf24` | `#fef3c7` | `#2a1e00` | 警告、待迁移 |

### 7.5 云端同步状态色（**仅用于同步 UI**）

| 状态 | 视觉 Token | 用法 |
|------|-----------|------|
| 本地模式 | `--r2a-ink-faint` | 小 pill，无强调 |
| 待同步 | `--r2a-warning` | 小 pill |
| 同步中 | `--r2a-primary` | 小 pill + spinner |
| 已同步 | `--r2a-success` | 小 pill |
| 失败 | `--r2a-error` | 小 pill + text link「重试」 |

**严禁** 同步色与主色混用、或用作其他装饰。

### 7.6 色彩约束汇总

| 类型 | Token | 允许 | 禁止 |
|------|-------|------|------|
| 主操作色 | `primary` | 按钮、focus ring、链接 | 装饰、大面积背景 |
| 表面色 | `canvas-soft`, `surface` | 页面底、卡片 | 彩色化 |
| 文字色 | `ink` 系列 | 文字分层 | 背景使用 |
| 边框色 | `hairline`, `hairline-soft` | 1px 边框 | 彩色化 |
| Ink Accent | `accent-ink` | 序号、tag、文本标记 | 主按钮、导航、结构背景、表单 |
| 语义色 | `success/error/warning` | Toast、inline 校验 | 主色替代 |

---

## 8. 字体规范

### 8.1 字体族

| 用途 | 字体栈 |
|------|--------|
| 界面 sans（默认） | `'Inter', 'Noto Sans SC', 'PingFang SC', system-ui, -apple-system, sans-serif` |
| 中文衬线（点睛） | `'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif` |
| 等宽（原文、代码、序号 metadata） | `'JetBrains Mono', ui-monospace, 'SF Mono', monospace` |

**字体加载**：Noto Serif SC 与 Noto Sans SC 可通过 Google Fonts 加载，仅加载 weight 400/500/600，避免引入冗余字重；必须保留系统 fallback（Noto Serif SC → Source Han Serif SC → Songti SC → serif；Noto Sans SC → PingFang SC → system-ui），Google Fonts 加载失败时页面仍需可读，且不应出现明显布局跳动。

### 8.2 字号层级

| Token | 字号 | 字重 | 行高 | 字间距 | 字体族 | 用途 |
|-------|------|------|------|--------|--------|------|
| `display-lg` | 36px | 600 | 1.3 | -0.01em | **serif** | 首页主标题、登录页主标题 |
| `display-md` | 28px | 600 | 1.3 | -0.01em | **serif** | 笔记详情标题、区块大标题 |
| `title` | 18px | 600 | 1.4 | -0.005em | **serif** | 知识卡片标题、对话框标题 |
| `title-sm` | 16px | 500 | 1.4 | 0 | sans | 列表项标题、项目名 |
| `body-md` | 15px | 400 | 1.75 | 0 | sans | **默认正文** |
| `body-lg` | 18px | 400 | 1.85 | 0.005em | **serif** | 一句话总结、长段引文（增强阅读感） |
| `body-sm` | 13.5px | 400 | 1.7 | 0 | sans | 次要正文、导航、卡片内容 |
| `button` | 14px | 500 | 1.4 | 0 | sans | 按钮文字 |
| `caption` | 12.5px | 400 | 1.5 | 0 | sans | 说明、时间戳、metadata |
| `eyebrow` | 11.5px | 500 | 1.4 | +0.16em | **serif** | section label（uppercase） |
| `code-sm` | 13px | 400 | 1.6 | 0 | mono | 原文对照、摘录 |

### 8.3 原则

- **Serif 仅在 §6.3 列出的场景使用**，不在正文、按钮、导航、表单出现。
- 标题 600，正文 400，按钮 500；避免 300 细体与 700 重体。
- 长文区域（笔记详情、解析结果正文）优先 `body-md`（15px / 1.75）；引文/总结使用 `body-lg`（serif）。
- `eyebrow` 必须使用 uppercase + `letter-spacing: 0.16em`，是"editorial 气质"的关键标识。

---

## 9. 间距与圆角

### 9.1 间距（基准 4px）

| Token | 值 | 用途 |
|-------|-----|------|
| `space-xxs` | 4px | icon 与文字间距 |
| `space-xs` | 8px | 紧凑堆叠 |
| `space-sm` | 12px | 表单项内、pill padding |
| `space-md` | 16px | 卡片内 padding 最小单位 |
| `space-lg` | 24px | 卡片标准 padding |
| `space-xl` | 32px | 区块间距 |
| `space-xxl` | 48px | section 间距 |
| `space-section` | 64px | 登录页、空状态垂直留白 |

### 9.2 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `radius-xs` | 3px | 复选框 |
| `radius-sm` | 4px | 输入框、小标签、知识卡片（index card 感） |
| `radius-md` | 6px | 次按钮、菜单行、nav item |
| `radius-button` | 8px | **主 / 次 CTA 按钮（不用 pill）** |
| `radius-lg` | 8px | 笔记列表卡片、对话框（与按钮同 radius 形成视觉节奏） |
| `radius-xl` | 12px | Toast、大容器、popover |

> **重大变更（v1.0 → v1.1）**：`radius-pill` 已废弃。Primary / Secondary 主 CTA 改为 `radius-button`（8px）。理由：pill 视觉血统来自营销页与消费 App，与"安静的个人知识工具"气质相冲。
>
> **v1.1 终版收紧**：`radius-lg` 12→8px、`radius-xl` 16→12px，对齐 Notion / Craft / Bear 的卡片 radius 区间（4–8px 为主）。原 12/16 偏向 consumer app 气质。

### 9.3 布局宽度

- 页面壳层 `r2aPageShell1020`（max ~1020px）保留。
- 笔记详情正文宽：max **720px**（增强阅读节奏）。
- 登录 / 注册卡片：max **400–440px**。

### 9.4 编辑性间距（仅限内容阅读区）

在笔记详情、解析结果、长引文等**内容阅读区**，允许使用非 8 倍数的间距值来制造 editorial 视觉节奏：

| 常用值 | 典型用途 |
|--------|----------|
| 14px | 标题与 meta 间距、section 内紧凑堆叠 |
| 18px | section label 与正文间距 |
| 22px | 侧栏 group 之间 |
| 36px | toolbar 与标题间距 |
| 40px | meta 与 tab 间距 |
| 44px | tab 与内容间距 |

**严格限定**：仅用于内容阅读区。**结构区**（按钮、卡片、输入框、表单、侧栏 padding、组件内 padding）仍严守 8 倍数（`space-*` token）。

理由：纯 8 倍数间距会让长文阅读节奏过于机械；少量编辑性间距让长文有"被精心排过版"的呼吸感，这是 editorial 气质的关键。

### 9.5 动效与过渡

**Duration token**：

| Token | 值 | 用途 |
|-------|-----|------|
| `--r2a-duration-fast` | 80ms | 颜色、透明度、文字色微变 |
| `--r2a-duration-base` | 150ms | **默认** hover、按钮态变化、border 变化 |
| `--r2a-duration-slow` | 250ms | 卡片位移、内容容器切换、modal 进出 |

**Easing token**：

| Token | 值 | 用途 |
|-------|-----|------|
| `--r2a-ease-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | **默认** 所有 hover / 状态变化 |
| `--r2a-ease-in-out` | `cubic-bezier(0.4, 0, 0.6, 1)` | 双向状态（modal 进出、抽屉） |

**规则**：

- 所有 transition 必须显式声明属性，**禁止** `transition: all`（性能差、不可控）。
- 默认 `transition: color var(--r2a-duration-base) var(--r2a-ease-out), background-color var(--r2a-duration-base) var(--r2a-ease-out)`。
- **禁止** 弹跳、spring、overshoot 类动效（与"安静知识工具"气质相冲）。
- **禁止** 超过 300ms 的过渡（除 modal/抽屉外）。
- 长时滚动条与 spinner 使用 CSS animation 自定义。

---

## 10. 组件规范

### 10.1 按钮

| 变体 | 背景 | 文字 | 边框 | 高度 | 圆角 |
|------|------|------|------|------|------|
| **Primary** | `--r2a-primary` | `--r2a-on-primary` | none | 40px | `radius-button` (8px) |
| **Secondary** | `--r2a-surface` | `--r2a-ink` | 1px `--r2a-hairline` | 40px | `radius-button` (8px) |
| **Utility** | transparent | `--r2a-ink-secondary` | 1px `--r2a-hairline` | 32px | `radius-md` (6px) |
| **Ghost / Text** | transparent | `--r2a-ink` 或 `--r2a-primary` | none | auto | — |
| **Dark Action** | `--r2a-ink` | `--r2a-on-primary` | none | 40px | `radius-button` (8px) |
| **Disabled** | `--r2a-canvas-soft` | `--r2a-ink-faint` | 1px `--r2a-hairline` | 40px | `radius-button` |

- Primary 全站唯一实心强调色，禁止第二个填充 CTA。
- **禁止** 使用 ink-accent 色作按钮填充。
- **按下态（`:active`）**：所有按钮加 `transform: scale(0.98)` + 对应 bg 变深；过渡时长 `--r2a-duration-fast`（80ms）。
- **悬停态（`:hover`）**：Primary → `--r2a-primary-active`；Secondary / Utility → `--r2a-hover` bg；过渡时长 `--r2a-duration-base`（150ms）。
- **聚焦态（`:focus-visible`）**：**仅键盘聚焦**显示 outline（鼠标点击不触发）。规则：`outline: 2px solid var(--r2a-primary); outline-offset: 2px; border-radius: inherit`。**禁止** `:focus`（会在鼠标点击时也显示 outline）。
- **Dark Action 使用场景**：仅用于侧栏「新建笔记」入口、空状态主 CTA、登录/注册首屏；其他场景一律用 Primary。Dark Action 和 Primary **不在同一视区同时出现**。

### 10.2 输入框

- 背景 `--r2a-surface`，1px hairline 边框，圆角 `radius-sm`（4px）。
- 高度 40px（单行），textarea min-height 120px。
- Focus：`box-shadow: 0 0 0 2px --r2a-primary`（soft ring）。
- 占位符 `--r2a-ink-faint`，内边距 `6px 12px`。
- 错误态：边框 `--r2a-error` + 下方 caption 错误文案。

### 10.3 卡片（两种）

**A. 内容容器卡片**（笔记列表、面板）：

- 背景 `--r2a-surface`，1px hairline，圆角 `radius-lg`（8px）。
- 内边距 `space-lg`（24px）。
- 默认无 shadow，hover：`--r2a-hover` bg + 边框略深。

**B. Index card 知识卡片**（笔记详情中的「知识卡片」section）：

- 背景 `--r2a-canvas-soft`（与页面底同色，制造"卡片嵌在纸上"感）。
- 1px hairline，圆角 `radius-sm`（4px——刻意小，强调"index card"质感）。
- 内边距 18px 20px。
- 顶部：分类 tag（**serif**，`--r2a-accent-ink` 色，11px）；标题（**serif**，17px / 600）；正文（sans，13.5px）。
- Hover：边框 `--r2a-ink-faint`（轻微变深，**不到** ink-muted）、`transform: translateY(-1px)`、过渡 `--r2a-duration-slow`。

### 10.4 标签（Tag / Badge）

| 类型 | 样式 |
|------|------|
| 默认 | `--r2a-canvas-soft` bg + `--r2a-ink-secondary` text + `eyebrow` + `radius-sm` + hairline |
| Primary | `--r2a-primary-bg` + `--r2a-primary` text |
| Ink Accent（知识卡片分类） | transparent + `--r2a-accent-ink` text + serif + uppercase 字间距 0.06em（**不使用底色**） |
| 成功 / 错误 / 警告 | 对应语义浅底 + 深字 |

### 10.5 数字 / 序号

**核心观点列表**：

- 序号使用 CSS `counter(... , cjk-ideographic)`（一、二、三、四、五、六...）。
- 字体 **serif**，字号 14–15px，字重 500，色 `--r2a-accent-ink`。
- 与正文水平间距 18px。
- **禁止** 圆形 badge、纯数字加底色块。

**纯数字（如行动清单完成度 `0 / 5`）**：

- 字体 **mono**，色 `--r2a-ink-muted`。

### 10.6 行动清单（Checklist）

- list 容器：无背景、无边框，只用排版。
- 每项：14px 复选框 + 14.5px 文本，padding `13px 0`，下方 **1px dashed `--r2a-hairline`**（paper checklist 质感）。
- 复选框：14×14px，1.5px solid `--r2a-ink-muted` 边框，`radius-xs`（3px），勾选后填充 `--r2a-ink`。
- Hover：背景 `rgba(244,241,234,0.5)` 极淡提亮。
- 完成度 `0/5 完成` 显示在 section 右上角，mono 字体，`--r2a-ink-muted` 色。

### 10.7 Section Label（eyebrow）

- 文本：uppercase + serif + 11.5px / 500 + letter-spacing 0.16em。
- 色 `--r2a-ink-muted`。
- 右侧 **可选** 一条 24px hairline 横线（装饰，editorial 风格）。
- 上下 margin：上方 `space-xxl`（48px），下方 18px。

### 10.8 文本标记（`<mark>`）

- 用于一句话总结、长引文中的关键数字 / 名词标注。
- 实现：渐变下划线（`linear-gradient(to bottom, transparent 60%, var(--r2a-accent-ink-bg) 60%)`），文字色 `--r2a-ink`，字重 500。
- **禁止** 使用纯黄色高亮、纯色底标记。

### 10.9 侧边栏导航

- 背景与页面底同 `--r2a-canvas-soft`。
- nav-item：无图标，前置 **4px 圆点**（不同项目可不同 ink-accent 衍生色，或统一 `--r2a-ink-faint`）。
- Active：背景 `--r2a-surface`（与主内容区同色，制造"被选中=被打开"感），字重 500。
- Hover：背景 `--r2a-hover`。

### 10.10 Toolbar 按钮（顶栏「编辑/导出/保存到项目」）

- 默认 utility 按钮样式（透明底 + hairline 边框）。
- 文字 13px，hairline 6px radius。
- **可选 progressive disclosure**：常态半隐（opacity 0.6），hover 笔记区域时恢复 full opacity。1.4 不强制实现，预留给视觉迭代 v2。

### 10.11 阴影

| 级别 | 用法 | 写法 |
|------|------|------|
| 0 — Flat | 默认卡片、行 | hairline only |
| 1 — Soft | 浮起卡片、toast、dropdown | 多层近透明叠影，最深 `rgba(20,16,10,0.04) 0 4px 18px` |
| 2 — Elevated | Modal、popover | 多层叠影，最深 `rgba(20,16,10,0.06) 0 12px 32px` |

阴影颜色注意：暖底用 **暖色调阴影**（`rgba(20,16,10,...)`），不用纯黑 `rgba(0,0,0,...)`，否则在暖底上发"脏"。

### 10.12 图标

- 使用线性 outline 图标（Heroicons / Lucide），色值通过 `currentColor` 继承。
- **禁止** emoji 作为正式资产。
- 侧边栏导航 **禁止** 使用图标——用文字 + 色点（见 §10.9）。

---

## 11. 笔记详情页规范

笔记详情页是产品最核心、停留时长最长的页面，规范如下：

1. **布局**：左侧栏 256px + 主内容区。主内容内 padding 32px / 64px / 96px（上 / 左右 / 下）。
2. **顶部 toolbar**：右对齐 utility 按钮，编辑 / 导出 / 保存到项目。
3. **标题**：`display-md`（28px serif），下方 14px 间距。
4. **Metadata 行**：`caption`（12.5px sans），各项之间用 3px 圆点分隔，max width 与标题对齐。下方 40px 间距至 tabs。
5. **Tabs**：「内容总结」/「原文对照」，下方 1px hairline，间距 28px，active 项底部 2px ink 色。
6. **Section 顺序**：一句话总结 → 核心观点 → 行动清单 → 知识卡片。每个 section 间距 `space-xxl`（48px）。
7. **一句话总结**：`body-lg`（18px serif），关键数字用 `<mark>`。
8. **核心观点**：中文序号列表（见 §10.5），每项之间 1px hairline-soft 分隔。
9. **行动清单**：见 §10.6。
10. **知识卡片**：2 列网格，gap 16px，使用 §10.3 B 型卡片。

---

## 12. 登录 / 注册页规范

1. 单列居中卡片，max-width 400–440px。
2. 页面底 `--r2a-canvas-soft`。
3. 标题 `display-md`（serif）+ 副说明 `caption` muted。
4. 主按钮 Primary 全宽。
5. **禁止** 大图 Hero、OAuth 大图标墙。

---

## 13. 云端同步状态规范

1. 展示位：侧栏用户区旁 / 顶栏 subtle 指示。
2. 状态色严格见 §7.5。
3. 失败态提供 text「重试」，成功态 **不弹** intrusive 弹窗。

---

## 14. 响应式

| 断点 | 宽度 | 要点 |
|------|------|------|
| Mobile | < 640px | 侧栏改为抽屉；登录卡片全宽减 margin；display-md → 22px |
| Tablet | 640–1024px | 1020 壳层保留 padding；项目列表 1 列 |
| Desktop | ≥ 1024px | 完整侧栏 + 主内容 |

触控目标最小 44×44px。**不做** 独立移动端 redesign。

---

## 15. 禁止事项

1. **禁止** 将 ink-accent 用于主按钮、导航高亮、大面积背景、表单。
2. **禁止** 卡片、按钮、导航默认加 drop-shadow。
3. **禁止** Primary / Secondary 按钮使用 `radius-pill`。
4. **禁止** 核心观点 / 列表序号使用圆形 badge（无论何色）。
5. **禁止** 侧边栏导航使用图标（用文字 + 色点）。
6. **禁止** 引入第二个品牌强调色 / 主操作色。
7. **禁止** 长文区域使用纯黑文字（必须用 `--r2a-ink`）。
8. **禁止** 纯白卡片直接铺在暖底上（卡片必须用 `--r2a-surface`，不用 `--r2a-canvas`）。
9. **禁止** 首页改成 ChatGPT 式对话流或官网式全屏 Hero。
10. **禁止** v1.0 与 v1.1 token 共存于同一页面。
11. **禁止** Agent 跳过 HTML 预览与 §18 验收清单直接合并 UI 改动。
12. **禁止** 使用 `transition: all`（必须显式声明属性）。
13. **禁止** 弹跳 / spring / overshoot 类动效。
14. **禁止** `:focus`（必须用 `:focus-visible`，避免鼠标点击触发 outline）。
15. **禁止** Dark Action 与 Primary 在同一视区同时出现。
16. **禁止** 结构区（按钮、表单、组件 padding）使用编辑性非 8 倍数间距。

---

## 16. v1.0 → v1.1 Token 迁移对照表

| v1.0 Token | v1.0 Hex | v1.1 Token | v1.1 Hex |
|------------|----------|------------|----------|
| `--r2a-primary` | `#0075de` | `--r2a-primary` | `#1e4d80` |
| `--r2a-primary-active` | `#005bab` | `--r2a-primary-active` | `#163d68` |
| `--r2a-primary-bg` | `#e8f3fd` | `--r2a-primary-bg` | `#e8eff7` |
| `--r2a-canvas-soft` | `#f6f5f4` | `--r2a-canvas-soft` | `#f8f7f3` |
| `--r2a-surface` | `#ffffff` | `--r2a-surface` | `#ffffff` |
| `--r2a-ink` | `#000000` | `--r2a-ink` | `#1f1d18` |
| `--r2a-ink-secondary` | `#31302e` | `--r2a-ink-secondary` | `#4a4640` |
| `--r2a-ink-muted` | `#615d59` | `--r2a-ink-muted` | `#6e6a62` |
| `--r2a-ink-faint` | `#a39e98` | `--r2a-ink-faint` | `#a8a39a` |
| `--r2a-hairline` | `#e6e6e6` | `--r2a-hairline` | `#ebe9e2` |
| `--r2a-accent-purple` 等 | — | **已废弃** | 统一为 `--r2a-accent-ink` `#8b5a3c` |
| `radius-pill` | 9999px | **已废弃** | `radius-button` 8px |
| `radius-lg` | 12px | `radius-lg` | 8px |
| `radius-xl` | 16px | `radius-xl` | 12px |
| — | — | `--r2a-duration-fast` | 80ms（新增） |
| — | — | `--r2a-duration-base` | 150ms（新增） |
| — | — | `--r2a-duration-slow` | 250ms（新增） |
| — | — | `--r2a-ease-out` | `cubic-bezier(0.4, 0, 0.2, 1)`（新增） |

---

## 17. 文档维护

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0-draft | 2026-06-09 | 1.3-0 首版（青绿主色，已废弃） |
| v1.0 | 2026-06-09 | 1.3-0 重写：Notion paper-calm，Notion Blue 主色 |
| v1.1 | 2026-06-11 | warm-restrained editorial 修正：深墨蓝主色、近白画布（仅一丝暖意，与 Notion / Craft 一致）、中文衬线点睛、ink-accent 单色装饰、去 pill 按钮 |
| v1.1 终版 | 2026-06-11 | 终版收口：radius 收紧（lg 12→8、xl 16→12 对齐 Notion/Craft）、新增 duration/ease token、补 `:focus-visible`、补按下态 scale、补编辑性间距规则、Dark Action 使用边界、知识卡片 hover 克制 |
| v1.1.1 | 2026-06-11 | 1.4-0 校正版：阶段从 1.3-G 对齐为 1.4；保护 1.3 已上线 Supabase/Auth 主链路；修正 radius-lg 与 checklist 尺寸矛盾；修正 §18 验收引用；补充字体加载 fallback 兜底 |
| v1.1.2 | 2026-06-11 | 预览修复版：修复按钮展示区对齐、中文序号列表因多余占位元素导致正文竖排的 bug、圆角展示区对齐；不改变设计方向与 token。 |

---

## 18. 人工验收清单

### 18.1 Token 与气质

- [ ] 浅色模式：页面底为近白 `#f8f7f3`（仅一丝暖意，非冷灰 `#f6f5f4`、非中度米色 `#f5f0e3`）
- [ ] 卡片表面为纯白 `#ffffff`，与画布形成"卡片浮在略暖画布上"的层次
- [ ] 主操作色为深墨蓝 `#1e4d80`，**全站唯一**
- [ ] Ink Accent `#8b5a3c` 仅出现在中文序号、知识卡片 tag、`<mark>`，**未** 出现在按钮、导航
- [ ] 主文字为暖近黑 `#1f1d18`，**未** 使用 `#000000` 纯黑

### 18.2 字体

- [ ] Noto Serif SC 已配置加载或系统 fallback，weight 400/500/600；Google Fonts 失败时页面仍可读
- [ ] 笔记标题、知识卡片标题、核心观点序号、section eyebrow 使用 serif
- [ ] 正文、按钮、导航、表单使用 sans
- [ ] 中文序号实际渲染为 `一、二、三...`（不是 `1、2、3`）

### 18.3 组件

- [ ] Primary / Secondary 按钮 8px 圆角，**未** 使用 pill
- [ ] 核心观点列表 **未** 使用圆形 badge
- [ ] 侧边栏导航 **未** 使用图标，使用文字 + 色点
- [ ] 知识卡片使用 4px 圆角 + 暖底（index card 感）
- [ ] 行动清单使用 dashed border 分隔
- [ ] `<mark>` 高亮使用渐变下划线，**未** 使用纯色底块

### 18.4 主链路回归

- [ ] 登录 → 输入 → 解析 → 结果 → 保存 → 云端项目 → note 详情 → 刷新读取 **仍可走通**
- [ ] 解析 A+B+C 防重复仍有效
- [ ] 云端同步五状态颜色与文案符合 §13

### 18.5 与 v1.0 共存

- [ ] 未迁移页面可暂时使用 v1.0 token，但已迁移页面 **完全切换** 到 v1.1.2
- [ ] 同一页面内 **无** v1.0 与 v1.1.2 token 共存

### 18.6 终版收口检查

- [ ] 所有卡片、对话框 `radius` ≤ 12px（未出现 16px 及以上）
- [ ] 所有 transition 显式声明属性，**未** 出现 `transition: all`
- [ ] 键盘 Tab 浏览能看到 focus outline，鼠标点击**不**触发 outline
- [ ] 按钮按下时有 `scale(0.98)` 微反馈
- [ ] Dark Action（侧栏「新建笔记」）与 Primary（如「保存到项目」）**不在同一视区同时显示填充态**
- [ ] 内容区允许 14 / 18 / 22 / 36 / 44 编辑性间距；结构区严守 8 倍数
- [ ] 知识卡片 hover 边框为 ink-faint（不是 ink-muted）
- [ ] HTML 预览中 Buttons、Component Signatures、Border Radius 三个展示区无错位、无竖排 bug
