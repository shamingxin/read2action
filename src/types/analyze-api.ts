import type { ParseResultPreview } from "./index";

/** 首页写入、`/parsing` 读取的用户待解析正文（sessionStorage） */
export const R2A_SESSION_PENDING_ANALYZE_TEXT_KEY =
  "r2a:pendingAnalyzeText" as const;

/** 首页「开始解析」与 /parsing 自动流程对齐：一次提交一条 run，用于防重复 POST */
export const R2A_SESSION_ANALYZE_RUN_ID_KEY = "r2a:analyzeRunId" as const;

/** 与 runId 组合；用户点「重试」时 bump，允许新的单次 POST */
export const R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY = "r2a:analyzeAttemptId" as const;

/**
 * 自动路径（非重试）对 `runId|attemptId` 的单次消费标记；与 tryTakeAutoAnalyzeSessionSlot 配套。
 */
export const R2A_SESSION_AUTO_ANALYZE_STARTED_KEY =
  "r2a:autoAnalyzeStarted" as const;

/** `/parsing` 成功后写入、`/result` 优先读取的最近一次解析结果（sessionStorage） */
export const R2A_SESSION_LAST_ANALYZE_RESULT_KEY =
  "r2a:lastAnalyzeResult" as const;

/** 全局解析自动暂存后写入的 noteId，供 /result 与「保存到项目」复用同一条记录 */
export const R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY =
  "r2a:lastAnalyzeNoteId" as const;

/** POST /api/analyze 请求体（与 docs/08 §6.1 对齐） */
export interface AnalyzeRequestBody {
  text: string;
  locale?: string;
  requestId?: string;
}

export interface AnalyzeSuccessResponse {
  ok: true;
  data: ParseResultPreview;
  meta?: {
    model?: string;
    latencyMs?: number;
  };
}

export interface AnalyzeErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;
