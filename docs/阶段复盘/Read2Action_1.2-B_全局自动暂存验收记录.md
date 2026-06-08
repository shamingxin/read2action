# Read2Action 1.2-B「记录生命周期补全：全局自动暂存」· 浏览器验收记录

> **文档性质**：**1.2-B 子阶段**事实记录与验收归档（非 1.2 全版本终稿）。**不写**真实 API Key / token。  
> **交叉引用**：`docs/核心记录/02_当前进度快照.md`、`docs/核心记录/03_下一步任务清单.md`、`docs/核心记录/04_重要决策日志.md`（**2026-06-08 · 1.2-B**）、`docs/核心记录/06_版本更新记录.md`、`docs/版本启动方案/08_1.2解析记录暂存与归档体验优化启动方案.md`。

---

## 一、1.2-B 目标

在 **1.2-A 真实空状态基线** 之上，补齐 **全局解析入口**（首页 / 侧栏「新笔记」等）的 **自动暂存** 闭环：

1. 全局解析成功后，结果 **自动写入 `localStorage`**，用户 **无需** 先点「保存到项目」。  
2. 自动写入的记录带 **`savedStatus: "temporary"`**、**`sourceContext: "global"`**，占位 **`projectId = _temporary`**。  
3. **`/result`** 页展示「**已自动暂存，可保存到项目归档**」状态提示。  
4. 侧栏「**最近**」可找回未手动保存的暂存记录；点击可进入详情。  
5. 用户点「**保存到项目**」后，将同一条 **temporary** 记录 **升级为 `saved`** 并写入目标 **`projectId`**。  
6. **1.1 历史记录**无 **`savedStatus`** 字段时，**默认视为 `saved`**，兼容旧数据。  
7. **模型选择 UI** 仅保留 **DeepSeek**（与本地 `.env.local` 中 `AI_MODEL=deepseek-chat` 对齐；密钥仅服务端，不入库、不进前端）。

---

## 二、本次完成内容（实现摘要）

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/lib/auto-save-analyze-result.ts` | 解析成功后在 `/parsing` 成功路径调用：建 **temporary** 笔记 → **`appendOrUpsertLocalSavedNote`** → 写 session **`noteId`** → 派发列表刷新事件 |
| `src/lib/auto-save-analyze-result.test.ts` | 自动暂存写入与 session `noteId` 单测 |

### 主要修改

| 层级 | 变更要点 |
|------|----------|
| **类型** | `Note` 增加可选 **`savedStatus`** / **`sourceContext`**；`analyze-api` 增加 **`R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY`** |
| **local-saved-notes** | **`R2A_TEMPORARY_PROJECT_ID`**、`resolveNoteSavedStatus`、`findLocalSavedNoteById`、`upgradeTemporaryNoteToSaved`；校验与 1.1 兼容 |
| **note-from-last-analyze** | **`buildTemporaryNoteFromLastAnalyze`**；手动保存路径显式 **`saved` + global** |
| **analyze-client** | **`seedPendingAnalyzeSession`**（首页 / 项目页进入 `/parsing` 前统一写 pending 与 run 锁）；**`read/writeLastAnalyzeNoteIdFromSession`** |
| **parsing-page-view** | 成功跳转前在 **`writeLastAnalyzeResultToSession`** 之后调用 **`autoSaveGlobalAnalyzeResult`**（**不**新增 HTTP） |
| **result-page-view** | 读 session `noteId` + local 记录，**temporary** 时展示蓝色状态条 |
| **save-to-project-dialog** | 若 session 对应 **temporary** 记录 → **`upgradeTemporaryNoteToSaved`**，否则走原 **`appendOrUpsert`** |
| **notes/[id]/page** | **`projectId === _temporary`** 时合成「未归档」项目壳，供侧栏链路与详情路由 |
| **model-options / model-select** | 仅 **DeepSeek** 单选项；单选项时 **无下拉** |
| **home-note-panel / project-page-view** | 默认模型 **`deepseek-chat`**；项目页补 **`seedPendingAnalyzeSession`** |

### 工程检查（收尾时）

- **`npm run test`**：**5** 文件、**32** 用例全部通过（含 **`parsing-page-view` StrictMode 单次 POST**、**`auto-save`**、**`local-saved-notes`**）。  
- **`npm run lint`**：通过。  
- **`npm run build`**：通过。

---

## 三、浏览器验收结果（✅ 2026-06-08 人工主流程）

| # | 验收项 | 结果 |
|---|--------|------|
| 1 | 首页模型选择只剩 **DeepSeek** | ✅ |
| 2 | 首页输入 → 解析成功 | ✅ |
| 3 | **`/result`** 出现「**已自动暂存，可保存到项目归档**」 | ✅ |
| 4 | **不**点「保存到项目」时，侧栏「**最近**」可找回该记录 | ✅ |
| 5 | 点击最近记录可进入 **详情页** | ✅ |
| 6 | 点「保存到项目」→ 选项目 → 记录进入目标项目；页面提示「**已保存到项目**」 | ✅ |
| 7 | **`/api/analyze`** 未修改 | ✅（代码审阅 + 验收口径） |
| 8 | **`/parsing`** 单次请求机制未发现破坏 | ✅（**A+B+C** 未动；仅成功路径多写 localStorage） |
| 9 | **test / lint / build** 通过 | ✅ |

**阶段口径**：**1.2-B 浏览器主流程验收通过**；业务代码与本文档 **尚未 commit**（待用户明确指令后单独收口）。

---

## 四、明确未做（本小步范围外）

以下属 **完整 1.2 PRD** 或后续子阶段，**不在 1.2-B 实现**：

1. **项目内解析自动归档**（项目页顶部解析成功后直接 **`saved` + projectId**）。  
2. 侧栏「最近」**「未归档 / 已保存」状态标签**。  
3. 最近列表 **直接归档**操作（不经 `/result` 或详情）。  
4. Toast 文案精修、按钮 **loading / disabled** 全量优化。  
5. **数据库**、**登录注册**、**文件上传**、**链接抓取**、**多模型 Provider** 架构。  
6. **1.2-C 及以后**子阶段能力（须 **单独拆小阶段** 后再立项）。

---

## 五、风险约束（验收时确认）

| 约束 | 状态 |
|------|------|
| **未修改** `src/app/api/analyze/route.ts` 及 `src/lib/analyze/*` | ✅ |
| **未破坏** `/parsing` **A+B+C** 单次请求机制（`tryTakeAutoAnalyzeSessionSlot`、`commitRef`、`autoBootRanRef` 等核心逻辑未改） | ✅ |
| **DeepSeek API Key** 仅 **`.env.local` / 部署环境变量**（服务端）；**未**写入前端代码或本文档 | ✅ |

---

## 六、后续接力说明

- **1.2-B**：功能与浏览器验收 **✅**；待 **用户确认后** `git add` + `commit`（**禁止** Cursor 自动 commit / push / 配置 remote）。  
- **进入 1.2-C 前**：须按 **`03`** 与 **`08`** 再 **拆小阶段**、列文件清单并经用户确认；**不得**一次性落地完整 1.2 PRD 剩余项。
