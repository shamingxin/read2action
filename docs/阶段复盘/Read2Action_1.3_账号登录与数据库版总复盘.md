# Read2Action 1.3 账号登录与数据库版总复盘

> **文档性质**：Read2Action 1.3 **正式总复盘**（版本目标、完成内容、问题闭环、线上部署、验收视角、commit 索引、冻结口径）。  
> **交叉引用**：分步实录见 **`Read2Action_1.3-D_云端项目与笔记保存验收记录.md`**；决策与时间线见 **`docs/核心记录/04_重要决策日志.md`**、**`docs/核心记录/06_版本更新记录.md`**。  
> **版本状态（2026-06-11）**：**✅ 功能主线已 push / 已部署 / Production 线上验收通过**（最新功能 commit **`9c08757`**）；**✅ 复盘文档已完成沉淀**；**1.3 核心交付范围正式冻结**；**1.3-E / 1.3-F 留待后续单独立项**。

---

## 1. 1.3 版本目标

Read2Action 1.3 在 **1.2 本地暂存与归档体验** 已冻结的基础上，将产品从 **localStorage 本地工具** 升级为 **账号 + 云端数据库** 可持续使用的 Web 工具。

核心目标：

> 已登录用户可将解析结果写入 Supabase，并在侧栏 / 项目页 / 笔记详情页读取云端数据；未登录用户仍保留 1.2 完整 localStorage + mock 回退体验。

本阶段 **不** 借机做 localStorage 批量迁移（1.3-E）、文件上传（1.4）、大 UI 重构或 `/api/analyze` 重写。

---

## 2. 1.3 已完成内容

| # | 交付项 | 小步 | 状态 |
|---|--------|------|------|
| 1 | 界面设计规范 v1.0（paper-calm productivity） | **1.3-0** | ✅ 冻结 |
| 2 | Supabase 账号与数据库方案（三表 + RLS + 迁移草案） | **1.3-A** | ✅ 冻结 |
| 3 | Supabase 项目创建与环境变量配置 | **1.3-B** | ✅ 完成 |
| 4 | Auth 基础设施（`@supabase/ssr`、middleware、`/auth/callback`） | **1.3-C-1** | ✅ |
| 5 | 登录 / 注册 / 登出 / 侧栏登录态 | **1.3-C-2** | ✅ 事实冻结 |
| 6 | Supabase 数据访问层（mappers / session / projects / notes） | **1.3-D-1** | ✅ |
| 7 | 结果页「保存到项目」云端写入 | **1.3-D-2** | ✅ |
| 8 | 侧栏 / 项目详情页读取云端 projects / notes | **1.3-D-3** | ✅ |
| 9 | 线上部署 + note 详情页修复 + Production 验收 | **1.3-D-4** | ✅ |
| 10 | 解析主链路（`/` → `/parsing` → `/api/analyze` → `/result`）未被破坏 | 全阶段 | ✅ |
| 11 | 未登录 mock / localStorage 回退保留 | 全阶段 | ✅ |

### 2.1 小步 commit 索引

| 小步 | 状态 | 关键 commit | 摘要 |
|------|------|-------------|------|
| **1.3-C** | ✅ | `f4b8a53` | Supabase Auth 登录 / 注册 / 登出 / 侧栏登录态 |
| **1.3-D 主链路** | ✅ | `d5f5a88` | 云端 projects / notes 读写；保存弹窗；侧栏；项目详情 |
| **1.3-D-4 修复** | ✅ | `9c08757` | 云端 note 详情页 404 修复 |

### 2.2 线上部署信息

| 项 | 内容 |
|----|------|
| **线上地址** | `https://read2action.vercel.app` |
| **Production commit** | **`9c08757`** |
| **Vercel 环境变量** | `AI_MODEL`、`AI_BASE_URL`、`AI_API_KEY`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Supabase Site URL** | `https://read2action.vercel.app` |
| **Supabase Redirect URLs** | localhost + read2action.vercel.app + `*.vercel.app` |

---

## 3. 本阶段关键问题与解决过程

| 问题 | 现象 / 本质 | 解决过程摘要 |
|------|-------------|--------------|
| **`authenticated` 缺表级权限** | 云端读写 `projects` / `notes` 失败 | D-2 在 Supabase SQL Editor **手动 GRANT**（未写入 repo migration） |
| **保存弹窗闪本地模式** | auth 检查完成前先渲染游客 UI | D-2 增加 loading 态，auth 确认后再切换云端模式 |
| **退出登录停留在 UUID 路由 404** | 云端 projectId 与 mock 不兼容 | D-3 退出 `router.push("/")` |
| **云端 note 详情页 404** | 详情页仅读 mock + localStorage | D-4 `getCloudNoteById` + `cloudNote` 渲染分支；commit **`9c08757`** |
| **Production 500** | `MIDDLEWARE_INVOCATION_FAILED`；缺 Supabase 环境变量 | Vercel 补齐 `NEXT_PUBLIC_SUPABASE_*` → Redeploy |
| **邮箱确认后不自动登录** | Supabase Auth 行为 | **1.3-C-2 已知限制**（MVP：验证后手动登录）；不作为阻塞 |

---

## 4. 最终解决方案

1. **双模式并行** — 已登录走 Supabase 云端主链路；未登录保留 1.2 localStorage + mock 完整体验。  
2. **RLS 隔离** — 安全靠 Supabase RLS + anon key，不靠藏 key；`requireCurrentUser` 守卫所有云端读写。  
3. **最小三表** — `profiles` / `projects` / `notes`；`local_id` 预留迁移幂等。  
4. **保存行为不变** — 保存成功后仍停留 `/result`，不自动跳转项目详情页。  
5. **`/api/analyze` 不动** — 解析链仍走 1.1 A+B+C 纪律；AI 变量与 Supabase 变量分轨配置。  
6. **分小步交付** — 0 → A → B → C → D（D-1～D-4）逐步验收，每步列文件清单并经用户确认。

---

## 5. 验收者视角 · 固定验收路径

1. **访客模式** — 首页解析 → `/result` → localStorage 保存 → mock 项目可见  
2. **登录 / 注册** — `/login`、`/signup`、侧栏登录态、退出回 `/`  
3. **已登录解析** — 文本 → AI 结果 → 保存到默认项目  
4. **云端读取** — 侧栏项目列表 → 项目详情 notes 列表 → **note 详情页**  
5. **刷新持久化** — 刷新后云端 notes 仍在  
6. **线上 Production** — `read2action.vercel.app` 全链路抽检  

**D-4 Production 验收结论（2026-06-11）**：上述路径 **✅ 全部通过**。

---

## 6. 已知限制与非阻塞项

| 项 | 口径 |
|----|------|
| 邮箱确认后不保证自动登录 | **1.3-C-2 已知限制**；MVP 手动登录 |
| 侧栏「最近」仍读 localStorage | 未接云端；留待后续单独立项 |
| 侧栏「新增项目」等功能 | 仍为 Toast 占位 |
| localStorage 未批量迁移到云端 | 属 **1.3-E**，本版本不做 |
| 轻微页面加载 / 切换卡顿 | 记入后续体验优化 backlog，**非 1.3 阻塞** |
| `authenticated` GRANT 为环境侧人工修复 | 新环境部署须复现或纳入正式 migration |

---

## 7. 1.3 最终结论

1. **1.3 核心交付已完成并冻结** — 已 push 到 GitHub，Vercel Production 已部署，线上验收通过。  
2. **功能冻结 commit**：**`9c08757`** `fix(1.3-D): support cloud note detail page`（含 D-4 修复；D 主链路 **`d5f5a88`**）。  
3. **1.3 复盘文档已完成沉淀** — 含 D 分步实录、总复盘、核心记录同步。  
4. **后续不再扩展 1.3 核心范围** — 不回头改 Auth / 云端读写主链路，除非修阻塞 bug。  
5. **下一阶段默认选项**：**1.3-E**（localStorage 迁移）或 **1.3-F**（轻量 UI 统一 + 体验优化）；或直接进入 **1.4**（文件上传）。

---

## 8. 后续版本规划（备忘）

| 版本 | 定位 | 状态 |
|------|------|------|
| **1.3-E** | localStorage → 云端迁移 | 待立项 |
| **1.3-F** | 轻量 UI 统一 + 体验优化（含加载卡顿） | 待立项 |
| **1.4** | 文件上传 / 更多输入来源 | 规划备忘 |

---

## 附录 A. 工程与测试

- **测试**：Vitest **52** 条（含 `mappers.test.ts` 16 条）。  
- **解析链纪律**：**未改** `/api/analyze` 核心；**保留** `/parsing` **A+B+C**；本地 dev 仍建议 **`next dev --webpack`**。  
- **存储**：已登录 → Supabase；未登录 → **`localStorage`**（`r2a:localSavedNotes`）+ mock。

---

## 附录 B. 相关提交索引

```text
f4b8a53 feat: complete supabase auth login signup flow
d5f5a88 feat(1.3-D): 接入 Supabase 云端项目与笔记保存
9c08757 fix(1.3-D): support cloud note detail page
```

**1.3 最终功能 commit**：**`9c08757`**。

---

**文档路径**：`docs/阶段复盘/Read2Action_1.3_账号登录与数据库版总复盘.md`
