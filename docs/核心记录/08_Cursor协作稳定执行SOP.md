# Cursor 协作稳定执行 SOP

> 适用项目：Read2Action  
> 适用场景：Cursor 经常卡住、超时、断联、重复请求权限、回复到一半中断、上下文膨胀、误改文件、自动执行过多命令等情况。  
> 核心原则：把 Cursor 从「全能自动开发者」降级成「分段执行工人」。

---

## 1. 背景问题

在 Read2Action 项目推进过程中，Cursor 多次出现以下问题：

1. 回复到一半卡住或中断。
2. 长时间 Thought，不继续输出。
3. 命令执行后无结果，或反复请求权限。
4. 新开对话后上下文占用过高。
5. 一次任务过大，导致改代码、跑命令、写 docs、git 操作混在一起。
6. 有时会不稳定地执行 git、修改非目标文件，增加回滚难度。
7. 卡住后继续追问，会继续消耗额度，但不一定解决问题。

因此项目后续统一采用「小任务、短上下文、强边界、先只读、后执行」的协作方式。

---

## 2. 总原则

一句话原则：

> 小任务、短上下文、先只读、后执行、强边界、勤冻结、少自动 git、不让 Cursor 碰高风险操作。

Cursor 不再被当作可以一次性完成整阶段任务的 agent，而是作为分段执行工具使用。

---

## 3. 任务必须切小

不要给 Cursor 这种大任务：

```text
完成 1.3-D 云端保存功能。
```

应拆成多个小任务：

```text
只读规划 1.3-D，不修改文件。
```

```text
只提取 SQL，不执行 SQL，不写代码。
```

```text
只写 Supabase 数据访问层，不改页面。
```

```text
只接项目列表，不接保存逻辑。
```

```text
只做验收检查，不修改代码。
```

每次任务只允许它完成一个明确 slice，避免上下文过大、半成品过多。

---

## 4. 每轮都声明权限边界

每次发给 Cursor 的任务，都应明确允许和禁止事项。

常用禁止项：

```text
不要修改任何文件，除非我明确允许。
不要执行 SQL。
不要使用 service_role。
不要修改 /api/analyze。
不要修改 localStorage。
不要 git add / commit / push。
不要继续修非本轮目标问题。
```

如果是只读任务，要明确写：

```text
本轮只读检查，不修改任何文件。
```

如果允许改代码，要明确写：

```text
本轮只允许修改以下文件：
- xxx
- xxx
其他文件不得修改。
```

---

## 5. 固定流程：先只读，再执行

每个阶段默认流程：

```text
只读检查 → 输出方案 → 用户确认 → 再改代码
```

不要让 Cursor 边想边改。

推荐模板：

```text
请先只读检查，不要修改文件。
输出：
1. 当前状态
2. 相关文件
3. 建议方案
4. 风险点
5. 下一步是否需要我确认
```

确认方案后，再单独发执行指令。

---

## 6. Git 操作必须单独一轮

不要让 Cursor 在开发任务中顺手 git commit。

正确流程：

```text
代码完成
→ 本地验收
→ 只读 git status
→ 确认变更范围
→ 单独授权 git add / commit
→ 不 push，除非明确要求
```

Git 提交指令模板：

```text
请执行本阶段冻结提交。

允许执行：
- git status --short
- git add
- git commit
- git status --short

不允许执行：
- git push
- 修改任何文件
- 执行 SQL
- 修改业务逻辑

提交后只输出：
1. git status --short
2. commit hash
3. 工作区是否干净
4. 是否可以进入下一阶段
```

---

## 7. SQL / Vercel 等高风险操作由用户手动执行

Cursor 可以负责：

1. 整理 SQL。
2. 整理操作步骤。
3. 整理验收 SQL。
4. 整理注意事项。

但以下操作优先由用户手动完成：

1. Supabase SQL Editor 执行 SQL。
2. Supabase Auth 配置。
3. Vercel 环境变量配置。
4. Vercel Redeploy。
5. Git push。

原因：

1. 可控。
2. 方便截图验收。
3. 避免 Cursor 中途超时后不知道执行到哪一步。
4. 避免误用 service_role、误改数据库或误触发线上部署。

---

## 8. Cursor 卡住时的处理方式

当出现以下情况：

1. 一直转圈。
2. Thought 很久不输出。
3. 命令卡住。
4. 回复一半断掉。
5. 反复点击 Submit 才有反应。
6. 看起来已经陷入循环。

不要继续在同一条任务里硬救。

推荐处理：

```text
停止当前任务
不要追加复杂信息
新开 Cursor Chat
用短接力继续
```

卡住后的对话通常上下文已经混乱，继续追问会消耗额度，也可能让 Cursor 改乱文件。

---

## 9. 新 Cursor 对话接力格式

新开 Cursor 对话时，不要粘贴全部历史。

固定使用短接力：

```text
当前阶段：
已完成：
当前问题：
本轮只做：
禁止事项：
完成后只输出：
```

示例：

```text
当前阶段：
1.3-D 云端项目 / 笔记保存，准备做数据访问层。

已完成：
1.3-C Auth 已冻结，登录 / 注册 / 退出闭环通过。
Supabase SQL migration 已手动执行并验收通过。

当前问题：
需要新增 Supabase projects / notes 的最小数据访问层。

本轮只做：
只读检查相关文件，并输出建议方案。

禁止事项：
不要修改文件。
不要执行 SQL。
不要使用 service_role。
不要修改 /api/analyze。
不要修改 localStorage。
不要 git add / commit / push。

完成后只输出：
1. 相关文件
2. 建议新增/修改文件
3. 风险点
4. 下一步执行指令建议
```

---

## 10. 模型使用策略

常规任务可使用 Auto：

1. docs 更新。
2. 只读检查。
3. 简单 UI 调整。
4. 文件结构梳理。
5. commit 前核对。

关键任务可临时使用更强模型：

1. 复杂 bug 修复。
2. 数据库 / RLS 设计。
3. Auth / callback / cookie 问题。
4. 多文件代码重构。
5. 线上部署故障排查。

不要长期用高消耗模型跑长对话，否则额度消耗过快。

---

## 11. Read2Action 项目专用安全边界

以下内容未经明确授权，不允许 Cursor 修改：

1. `/api/analyze`
2. DeepSeek / AI API Key 相关逻辑
3. localStorage 持久化逻辑
4. Supabase SQL
5. service_role
6. Vercel 环境变量
7. Git push
8. 已冻结版本 docs

涉及以下内容时必须先只读规划：

1. 数据库 schema。
2. RLS policy。
3. 登录态 / Auth callback。
4. 本地数据迁移。
5. 线上部署。
6. 大范围 UI 重构。
7. 版本冻结提交。

---

## 12. 阶段推进推荐节奏

每个小阶段统一按以下顺序推进：

```text
1. 只读盘点
2. 输出方案
3. 用户确认
4. 小范围改代码
5. 本地验收
6. docs 收尾
7. git status 核对
8. git commit 冻结
9. 新开对话接力
```

避免一个阶段内连续做太多不同类型的任务。

---

## 13. Cursor Run Mode 建议

如果 Cursor 经常自动执行不该执行的命令，建议进入：

```text
Cursor Settings → Agents → Run Mode
```

将 Run Mode 调整为：

```text
Ask Every Time
```

这样每次执行命令前都会询问，可以减少误执行 git、误跑命令、误触发高风险操作的概率。

在新 chat 开头，也可以补充：

```text
You do NOT have permission to run git commit, git add, git push, or any git commands that modify the repository.
Read and edit files only when I explicitly allow it.
```

---

## 14. 当前结论

Cursor 仍然可以继续作为 Read2Action 的主要开发执行工具，但使用方式必须调整：

1. 不再一次性托管整阶段。
2. 不再默认自动执行高风险操作。
3. 不再让它边规划边修改。
4. 不再在卡住对话里硬救。
5. 不再把 Git / SQL / Vercel 混在开发任务里。

最终协作方式：

> ChatGPT 负责阶段判断、边界控制、验收逻辑和复盘；  
> Cursor 负责小任务代码执行；  
> 用户负责关键确认、高风险手动操作和最终验收。
