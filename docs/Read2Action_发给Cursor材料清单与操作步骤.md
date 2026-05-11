# Read2Action 发给 Cursor 的材料清单与操作步骤

> 版本：v0.7  
> 用途：告诉你下一步到底要给 Cursor 发什么、怎么发、每一步让 Cursor 做什么。

---

## 1. 你现在是否可以进入 Cursor 开发？

可以。

原因：

```text
1. 产品方向已确认
2. 1.0 MVP 范围已确认
3. 6 个核心页面已完成最终高保真设计稿
4. 主流程可以跑通
5. 组件和交互状态已经足够支撑第一版开发
6. Cursor Rules 和交接文档已准备好
```

接下来进入的是：

```text
Cursor 开发 1.0 可运行原型
```

不是完整商业产品开发、真实 AI 接入、真实数据库开发、正式上线版。

---

## 2. 发给 Cursor 的内容

### 必发

1. Figma 设计稿链接
2. `Read2Action_Cursor_Rules.md`
3. `Read2Action_Cursor开发交接总文档.md`
4. `Read2Action_交互跳转逻辑文档.md`
5. `Read2Action_Cursor首轮提示词.md`

### 建议一起发

6. `Read2Action_项目总进度.md`
7. `Read2Action_决策日志.md`
8. `Read2Action_当前进度快照_v0.8.md`
9. `Read2Action_下一步任务清单.md`

### 暂时不用发

10. `Read2Action_方法论沉淀.md`

原因：方法论沉淀主要用于作品集包装，Cursor 开发时不是必须。等开发完成、上线后再用于作品集复盘。

---

## 3. 推荐文件放置方式

在你的项目文件夹 `read2action` 里建立：

```text
read2action/
├── docs/
│   ├── Read2Action_项目总进度.md
│   ├── Read2Action_当前进度快照_v0.8.md
│   ├── Read2Action_决策日志.md
│   ├── Read2Action_下一步任务清单.md
│   ├── Read2Action_Cursor开发交接总文档.md
│   ├── Read2Action_交互跳转逻辑文档.md
│   └── Read2Action_Cursor首轮提示词.md
├── .cursor/
│   └── rules/
│       └── Read2Action_Cursor_Rules.md
└── assets/
    └── icons/
```

如果暂时不想整理目录，也可以先全部放在项目根目录，让 Cursor 读取。

---

## 4. 第一次打开 Cursor 后怎么做

### Step 1：打开项目文件夹

用 Cursor 打开你的本地文件夹：

```text
read2action
```

### Step 2：放入文档

把这些 md 文件放进 `docs/`：

```text
Read2Action_项目总进度.md
Read2Action_当前进度快照_v0.8.md
Read2Action_决策日志.md
Read2Action_下一步任务清单.md
Read2Action_Cursor开发交接总文档.md
Read2Action_交互跳转逻辑文档.md
Read2Action_Cursor首轮提示词.md
```

把 Cursor Rules 放到：

```text
.cursor/rules/Read2Action_Cursor_Rules.md
```

### Step 3：新建 Cursor 对话

在 Cursor 里新开一个 Agent Chat。

先发：

```text
请先阅读 docs 目录和 .cursor/rules 里的所有 Read2Action 文档，理解项目背景、1.0 范围、页面结构、交互逻辑和开发规则。先不要写代码，读完后请总结你理解的开发目标、页面范围、路由、组件拆解和第一阶段开发计划。
```

### Step 4：发 Figma 链接

继续发：

```text
这是 Read2Action 1.0 的 Figma 设计稿链接：
【粘贴你的 Figma 链接】

请以 Figma 为视觉标准，优先还原这 6 个页面：
1. 首页 / 新笔记输入页
2. AI 解析中页
3. 解析结果页
4. 项目目录页
5. 笔记详情页：内容总结
6. 笔记详情页：原文对照
```

### Step 5：让 Cursor 先出计划

发：

```text
请你先不要写代码，先输出开发计划：
1. 技术栈
2. 路由结构
3. 目录结构
4. 组件拆解
5. mock 数据结构
6. 开发顺序
7. 第一轮会创建哪些文件
```

### Step 6：确认后再让它开始

等 Cursor 输出计划后，如果没问题，再发：

```text
计划可以。请按第一阶段开始执行：初始化 Next.js + TypeScript + Tailwind + shadcn/ui 项目结构，并先完成全局 Layout、Sidebar、mock 数据和类型定义。不要一次性写完全部页面。
```

---

## 5. Cursor 开发分阶段指令

### 第一阶段：项目初始化 + 基础结构

```text
请先完成第一阶段：
1. 初始化 Next.js + TypeScript + Tailwind CSS 项目
2. 配置 shadcn/ui 和 lucide-react
3. 创建基础目录结构
4. 创建 types/index.ts
5. 创建 data/projects.mock.ts、data/notes.mock.ts、data/result.mock.ts
6. 创建 AppLayout 和 AppSidebar
7. 先保证首页能显示左侧 Sidebar 和右侧空内容区

不要开发全部页面，完成后告诉我改了哪些文件。
```

### 第二阶段：首页

```text
请开发首页 / 新笔记输入页：
1. 还原 Figma 首页布局
2. 实现统一大输入框
3. 输入为空时开始解析按钮禁用
4. 输入有内容时按钮可点击
5. 点击开始解析跳转 /parsing
6. 模型下拉可以先做静态
7. 底部展示四个“你将获得”的卡片
```

### 第三阶段：解析中

```text
请开发 AI 解析中页面：
1. 路由为 /parsing
2. 展示标题“正在为你解析内容…”
3. 展示预计 20 秒
4. 展示 4 步进度条
5. 展示 LIVE PREVIEW 骨架屏
6. 2-3 秒后自动跳转 /result
7. 点击取消解析弹出确认弹窗，确认后返回首页
```

### 第四阶段：解析结果

```text
请开发解析结果页：
1. 路由为 /result
2. 使用 result.mock.ts 数据
3. 展示一句话总结、核心观点、行动清单、知识卡片
4. 实现保存到项目弹窗，默认保存到“沙”
5. 保存成功后 Toast 提示“已保存到项目”
6. 可跳转 /projects/sha
7. 编辑和导出先用 Toast mock
```

### 第五阶段：项目目录

```text
请开发项目目录页：
1. 路由为 /projects/[projectId]
2. 展示当前项目名
3. 展示顶部快速解析输入条
4. 展示项目内笔记列表表格
5. 点击笔记行进入详情页
6. 搜索支持按标题和标签前端过滤
7. 更多操作和分页可以先静态或 mock
```

### 第六阶段：笔记详情

```text
请开发笔记详情页：
1. 路由为 /projects/[projectId]/notes/[id]
2. 展示面包屑、标题、来源、标签、创建时间、字数
3. 实现内容总结 / 原文对照 Tab 切换
4. 内容总结展示总结、知识卡片、核心观点、行动清单、原文摘录
5. 原文对照展示原始内容
6. checkbox 支持本地切换状态
```

### 第七阶段：统一视觉与交互

```text
请统一检查所有页面：
1. 是否接近 Figma
2. Sidebar 是否复用
3. 页面间距、圆角、边框、阴影是否统一
4. hover / focus / disabled 状态是否存在
5. 文案是否正确
6. 是否没有出现“保存到知识库”等旧文案
7. 主流程是否能完整跑通
```

---

## 6. 每次让 Cursor 改代码时的注意事项

每次都尽量这样说：

```text
请先说明你准备修改哪些文件，再开始修改。
修改后请总结：
1. 修改了哪些文件
2. 实现了什么功能
3. 如何测试
4. 是否有遗留问题
```

不要一次性让 Cursor “把整个项目做完”。更推荐分阶段小步推进。
