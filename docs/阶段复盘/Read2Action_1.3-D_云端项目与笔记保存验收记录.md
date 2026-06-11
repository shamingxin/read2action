# Read2Action 1.3-D「云端项目 / 笔记保存」· 本地验收记录（D-1 / D-2 / D-3）

> **文档性质**：**1.3-D 子阶段**事实记录与验收归档（非 1.3 全版本终稿）。**不写**真实 API Key / token / 数据库密码。  
> **交叉引用**：`docs/核心记录/02_当前进度快照.md`、`docs/核心记录/03_下一步任务清单.md`、`docs/核心记录/04_重要决策日志.md`（**2026-06-11 · 1.3-D-3 本地验收**）、`docs/核心记录/06_版本更新记录.md`、`docs/PRD/1.3/1.3-A_Supabase账号与数据库方案.md`、`docs/版本启动方案/09_1.3-B_Supabase项目创建与环境变量启动方案.md`。

---

## 一、1.3-D 总目标（立项口径）

让 **已登录用户** 可将解析结果 **写入 Supabase**（`projects` / `notes`），并在 **侧栏 / 项目详情页** 读取云端数据；**未登录** 仍保留 **localStorage + mock** 回退。**不做** localStorage 批量迁移、**不做** 保存后自动跳转项目详情页、**不改** `/api/analyze`、**不改** 数据库表结构（本阶段仅应用层接入 + 人工 GRANT 修复权限）。

---

## 二、1.3-D-1 ✅ 数据访问层（本地验收通过）

### 完成内容

| 模块 | 说明 |
|------|------|
| **db-types** | `profiles` / `projects` / `notes` 行类型与 Insert/Update 类型 |
| **mappers** | `rowToProject` / `rowToNote` / `noteToInsert` / `projectIdToDb` 等；`DEFAULT_CLOUD_PROJECT_NAME = "默认项目"` |
| **session** | `getCurrentUser` / `requireCurrentUser` / `isAuthError` |
| **projects** | `listProjects` / `getProjectById` / `createProject` / `ensureDefaultProject` |
| **notes** | `listNotesByProjectId` / `getNoteById` / `insertNote` / `updateNote` 等 |

### 工程检查

- **`src/lib/supabase/mappers.test.ts`**：16 用例通过。  
- **`npm run test`**：**52 passed**。  
- **`npm run build`**：通过。

---

## 三、1.3-D-2 ✅ 结果页「保存到项目」云端写入（本地验收通过）

### 完成内容

- 结果页 **「保存到项目」** 弹窗：已登录时走 **Supabase 写入** 主链路（`listProjects` / `ensureDefaultProject` + `insertNote`）。  
- **`public.projects` / `public.notes`** 已成功新增记录（本地 Supabase 人工抽检）。  
- 保存弹窗 **不再闪本地模式**（auth 检查完成前显示 loading，避免先渲染游客 UI）。  
- 保存成功后 **不再跳转 404**（云端分支不 push 到 mock 项目 id）。  
- **保持 D-2 行为**：保存成功后 **停留 `/result`**，**不做** 自动跳转项目详情页。

### 排障记录（人工操作 · 非 repo migration）

- **现象**：`authenticated` 角色对 `projects` / `notes` **缺少** SELECT / INSERT / UPDATE / DELETE **表级权限**，导致云端读写失败。  
- **处理**：开发者已在 **Supabase SQL Editor** 手动执行 **GRANT** 修复（**未** 将 SQL 写入本仓库 migration）。  
- **口径**：属 **环境侧权限补齐**；后续新环境部署须复现相同 GRANT 或纳入正式 migration（**非本阶段交付**）。

---

## 四、1.3-D-3 ✅ 侧栏 / 项目详情页读取云端（本地验收通过）

### 完成内容

| # | 能力 | 结果 |
|---|------|------|
| 1 | 已登录侧栏项目列表读取 **Supabase `projects`** | ✅ |
| 2 | 项目详情页读取 **Supabase `notes`** 并展示列表 | ✅ |
| 3 | 保存到「默认项目」后，从侧栏进入默认项目详情页可见刚保存的 **note 标题** | ✅ |
| 4 | 刷新项目详情页后 **notes 仍展示** | ✅ |
| 5 | **退出登录**后跳转首页 **`/`**，避免停留在云端 UUID 路由 **404** | ✅ |
| 6 | Supabase **fetch 失败**（如 `Failed to fetch`）**不打爆页面**；侧栏 `try/catch` 回退，不出现 Next.js error overlay | ✅ |
| 7 | **未登录**保留本地 **mock / localStorage** 回退 | ✅ |

### 实现要点（摘要 · 供接力）

- **`src/app/projects/[projectId]/page.tsx`**：Server Component 已登录时优先 `getCloudProjectById` + `listNotesByProjectId`；未命中回退 mock。  
- **`src/components/layout/app-sidebar.tsx`**：`authReady` 防 mock 闪现；云端 `listProjects` 带 `try/catch`；退出 `router.push("/")`。  
- **`ProjectPageView`**：仍合并 server notes + localStorage（云端 projectId 与 mock id 不冲突）。

### 工程检查（D-3 收尾时）

- **`npm run test`**：**52 passed**。  
- **`npm run build`**：通过。

---

## 五、本阶段明确不做

1. **不做** localStorage 迁移（属 **1.3-E**）。  
2. **不做** 保存后自动跳转项目详情页（维持 D-2：**停留 `/result`**）。  
3. **不改** `/api/analyze`。  
4. **不改** 保存弹窗主逻辑（D-3 仅侧栏 / 详情页读取与稳定性修复）。  
5. **不做** 数据库表结构 / RLS 策略调整（GRANT 为环境侧人工修复）。  
6. **不做** Vercel 部署。  
7. **不 git commit / push**（截至本文档写入时；功能代码与 docs 均在本地工作区）。

---

## 六、当前状态与下一步

| 项 | 状态 |
|----|------|
| **1.3-D-1** | ✅ 本地验收通过 |
| **1.3-D-2** | ✅ 本地验收通过 |
| **1.3-D-3** | ✅ 本地验收通过 |
| **1.3-D 整体** | **进行中** — **等待决定是否进入 D-4**（如 note 详情读云端、最近列表读云端等，须单独立项） |
| **test / build** | **52 passed** / **build 通过** |

**默认下一决策点**：是否立项 **1.3-D-4**（或直接进入 **1.3-E** localStorage 迁移）；开工前仍须 **列文件清单 → 用户确认**。

---

## 七、人工验收清单（D-3 主链路 · 可复现）

1. 登录新账号。  
2. 完成一次解析。  
3. 在结果页保存到「默认项目」→ 确认仍在 **`/result`**。  
4. Supabase **`public.notes`** 新增记录。  
5. 点击左侧云端「默认项目」进入详情页 → 可见刚保存的 **note 标题**。  
6. 刷新详情页 → **notes 仍展示**；侧栏 **不闪现** mock 项目列表。  
7. 退出登录 → 落 **`/`**，无 **404**。  
8. 访客模式访问 mock 项目 → **不崩溃**，localStorage 逻辑可用。
