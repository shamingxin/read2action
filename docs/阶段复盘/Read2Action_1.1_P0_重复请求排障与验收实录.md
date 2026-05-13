# Read2Action 1.1 · P0：`/parsing` 重复请求排障与 Network 验收实录

> **文档性质**：**阶段复盘 / 过程实录** — 保留 **现象 → 尝试路径 → 中间误判 → 最终方案 → 验收数字**，供总复盘与作品集引用。  
> **交叉引用**：接力节点结论仍见 **`docs/核心记录/02_当前进度快照.md` §1.6**（现仅保留摘要）；方法论纪律见 **`docs/核心记录/07_方法论沉淀.md` §2.4～§2.6**；决策与日期见 **`docs/核心记录/04`**、**`docs/核心记录/06`**；**1.1 总复盘**见 **`Read2Action_1.1_真实AI文本总结版总复盘.md`**。

---

## 1. 背景（P0 定义）

**原始 P0**：**`/parsing` 重复请求 `POST /api/analyze`** → **DeepSeek 等费用风险**（非普通 UI bug）。

---

## 2. 排障过程实录（摘自当时接力文档）

### 2.1 中间问题（按时间顺序）

1. 曾出现 **0 条 POST**：**`pendingAnalyzeText`** 被 **提前清理**；**`/parsing` 一闪而过回首页**；Network 过滤 **analyze** 后为 **0** 条 **`POST`**。  
2. 曾出现 **多条 POST**：费用风险 **仍在**。  
3. **A+B+C** 等修复后，重复请求 **疑似压住**，但又出现 **1 条 POST 长期 pending**：页面卡在 **`/parsing`**；Network 显示 **Status unknown / request not finished**（易误判为上游）。  
4. 最终发现本地 **dev server** 出现 **Turbopack FATAL**（`FATAL: An unexpected Turbopack error occurred`）；终端反复 **`GET /parsing` 200**；**干扰**对 **`/api/analyze`** 复验的判断。

### 2.2 最终修复方案（工程面摘要）

1. **保留 A+B+C 防重复请求**（不推翻）：**`setTimeout(0)`** 替代 **`queueMicrotask`**；**`autoBootRanRef`**；**sessionStorage** 级 **request lock**；**`runId` + `attemptId`**；成功路径 **`writeLastAnalyzeResult` → `clearPending` → `clearAnalyzeRunSessionLocks` → `push("/result")`**。  
2. **`package.json`**：**`"dev": "next dev --webpack"`**（Next **16** 下无 flag 的 **`next dev` 默认 Turbopack**，显式 **webpack** 作本地复验基线）。  
3. **杀掉旧 dev 进程**；**`rm -rf .next`**；**重新 `npm run dev`**。  
4. 确认本地服务：**Next.js 16.2.6（webpack）**、**`http://localhost:3000`**。

---

## 3. 最终验收结果（人工 + 工程）

### 3.1 人工复验（示例一次）

1. Chrome DevTools Network 过滤 **analyze**；  
2. 首页输入测试文本；  
3. **点击一次**「开始解析」；  
4. **全程不点重试、不刷新**；  
5. Network **仅 1 条** analyze 相关请求；  
6. **Status 200**；  
7. **Time** 约 **6.37s**（随模型与网络变化，以当时复验为准）；  
8. 页面成功进入 **`/result`**；  
9. **`/result`** 展示 **真实 AI 总结内容**。

### 3.2 工程检查（当时快照）

1. **`npm run test`**：通过；**2** 个测试文件，**14** 条用例全部通过。  
2. **`npm run lint`**：通过；eslint 无报错退出。  
3. **`npm run build`**：通过；编译与 TypeScript 检查完成，路由表正常。

### 3.3 备注

- Vitest 可能提示 **`environmentMatchGlobs` deprecated**，**不影响**通过。  
- **`next build`** 终端仍可能打印 **Turbopack** 相关 **生产构建**侧字样，与 **`dev` 使用 `--webpack`** 是**两回事**。

---

**文档路径**：`docs/阶段复盘/Read2Action_1.1_P0_重复请求排障与验收实录.md`
