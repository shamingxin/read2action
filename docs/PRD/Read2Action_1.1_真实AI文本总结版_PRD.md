# Read2Action 1.1 PRD

**版本名**：Read2Action 1.1「真实 AI 文本总结版」  
**文档角色**：记录 1.1 版本的产品定义，供版本回溯与接力参考。  
**状态**：✅ 已完成并线上验收通过（2026-05-13）。1.1 功能与线上验收冻结。

---

## 1. 版本定位

在 1.0 已有六页主流程基础上，将核心解析结果从静态 mock 升级为**真实大模型基于用户输入文本生成的结构化总结**，并在结果页展示真实输出。

**1.1 只做一件事**：文本进 → 真实 AI 出 → 结果页真展示 → 手动保存到 localStorage。

这是从「演示原型」到「真实可用」的第一步，但仍不接数据库或账号。

---

## 2. 版本目标

1. 接入真实大模型 API（DeepSeek），用户输入文本后返回真实结构化总结。
2. 结果页展示真实 AI 生成内容，替换 mock 解析结果。
3. 手动保存到项目后写入 `localStorage`，刷新后不丢失。
4. 修复重复请求 P0 问题，确保单次解析仅发一条 POST 请求。
5. GitHub + Vercel 线上同步部署，环境变量安全管理。

---

## 3. 用户价值

| 用户动作 | 产品响应 | 感知价值 |
|----------|----------|----------|
| 粘贴一段真实文本 | 调用真实 AI 解析 | 不是假数据，是真正被理解 |
| 等待解析 | /parsing 四步进度，约 3.5s | 等待感合理 |
| 查看结果 | 真实 AI 结构化总结 | 有用的内容整理 |
| 点保存到项目 | 写入 localStorage，刷新不丢 | 成果被保留，不用担心消失 |
| 再次打开 | 侧栏「最近」和项目页可找回 | 有归档感 |

---

## 4. 范围内

1. 新增服务端 `POST /api/analyze` Route Handler，调用真实大模型（DeepSeek）。
2. `/parsing` 页发起单次 `POST /api/analyze`，防止重复请求（A+B+C 方案）。
3. 响应映射到现有 UI 字段（`ParseResultPreview`），结果页展示真实 AI 内容。
4. sessionStorage 临时传递解析结果（`r2a:lastAnalyzeResult`）。
5. `/result` 手动保存到项目 → 写入 `localStorage`（`r2a:localSavedNotes`）。
6. 侧栏「最近」、项目页笔记列表与 localStorage 合并展示（不替换 mock，并集）。
7. 详情页支持查看本地保存记录，刷新不丢。
8. API Key 仅在服务端读取，不入库，不写入 docs。
9. `.env.local` 在 `.gitignore` 中忽略；Vercel 使用 Sensitive 环境变量。
10. `npm run test` / `lint` / `build` 全部通过，单测覆盖核心 lib。

---

## 5. 范围外

1. 不接真实数据库（localStorage 为明确边界）。
2. 不做登录注册。
3. 不做链接全文抓取与 URL 内容自动拉取。
4. 不做文件上传解析。
5. 不做多模型 Provider 架构（单一 DeepSeek，1.2+ 再统一）。
6. 不做解析完成自动保存（须手动点「保存到项目」）。
7. 不做解析历史 / 未归档暂存池（列为 1.2）。
8. 不做大视觉改版，不推翻 1.0 六页结构。
9. 不做方法论自动生成。
10. 不做多用户 / 多端同步。

---

## 6. 核心流程

```text
首页：粘贴文本，点「开始解析」
→ sessionStorage 暂存待解析正文
→ /parsing：单次 POST /api/analyze（30s 超时，防重复 A+B+C）
→ 成功：sessionStorage 存结果，跳转 /result
→ 失败：展示可理解错误态，仅手动点「重试」再请求（不静默回退 mock）
→ /result：优先读 sessionStorage 真实结果，无则 mock
→ 点「保存到项目」→ 选项目 → 写入 localStorage（r2a:localSavedNotes）
→ Toast「已保存到项目」，跳转 /projects/{projectId}/notes/{newNoteId}
→ 侧栏「最近」和项目页列表：mock ∪ localStorage，updatedAt 降序
→ 详情页：mock 命中优先；否则客户端读 localStorage
→ 刷新后记录不丢（localStorage 持久化）
```

---

## 7. 数据 / 状态规则

| 层次 | Key | 说明 |
|------|-----|------|
| sessionStorage | `r2a:pendingAnalyzeText` | 待解析正文，传递给 /parsing |
| sessionStorage | `r2a:lastAnalyzeResult` | 解析成功结果，/result 读取后清除 |
| localStorage | `r2a:localSavedNotes` | 手动保存的笔记，格式 `{ v: 1, notes }` |
| 自定义事件 | `r2a:local-saved-notes-changed` | 侧栏「最近」等监听刷新 |

**关键规则**：
- `/parsing` 未点「重试」时，仅发 1 条 `POST /api/analyze`（StrictMode、cleanup、abort 均已处理）。
- 同 `id` 保存做 upsert，不产生重复条目。
- Mock 笔记与本地保存笔记并集展示，mock 命中优先于 localStorage（详情页）。
- 侧栏「最近」整页刷新瞬间可能短暂显示 mock 态（hydration），不阻断功能。
- API Key 仅在服务端 `process.env.AI_API_KEY` 读取，前端零接触。

---

## 8. 验收标准

| 项目 | 标准 |
|------|------|
| 真实 AI 结果 | /result 展示真实大模型内容，非固定 mock |
| 单次请求 | Network 过滤 analyze 后，主路径仅 1 条 POST /api/analyze，Status 200 |
| 保存不丢 | 保存后刷新，侧栏「最近」、项目页、详情页记录均存在 |
| 详情可访问 | 本地保存笔记可正常打开详情页，不 404 |
| Mock 不破坏 | 原有 mock 笔记详情仍可正常访问 |
| 安全 | API Key 不出现在前端代码、网络请求或 git 历史 |
| 工程 | npm run test / lint / build 全部通过 |
| 线上 | Vercel Production 部署成功，线上 18 项验收通过 |

---

## 9. 现实校准

- **localStorage 是明确边界，非降级**：1.1 明确不接数据库，localStorage 是版本设计，非欠债。
- **P0（重复请求）已解决**：A+B+C 方案收束，后续改解析链仍建议 Network 验收。
- **rawContent 为兜底拼接**：详情页「原文」是 summary 字段兜底，非完整粘贴原文，属 1.1 预期。
- **「最近」刷新瞬间**：hydration 导致短暂 mock 态，不阻断功能，1.2 再统一处理。
- **链接输入**：当前版本仅提示「请复制正文粘贴」，不自动抓取，属 1.1 预期边界。

---

## 关联文档

- 1.1 启动契约（执行细节）：`docs/版本启动方案/08_1.1真实AI文本总结启动方案.md`
- 1.1 正式总复盘：`docs/阶段复盘/Read2Action_1.1_真实AI文本总结版总复盘.md`
- 1.1 上线验收事实：`docs/阶段复盘/Read2Action_1.1_上线与验收收尾记录.md`
- P0 排障过程：`docs/阶段复盘/Read2Action_1.1_P0_重复请求排障与验收实录.md`

---

**文档路径**：`docs/PRD/Read2Action_1.1_真实AI文本总结版_PRD.md`  
**最后更新**：2026-06-05
