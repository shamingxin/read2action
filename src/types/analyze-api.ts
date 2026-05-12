import type { ParseResultPreview } from "./index";

/** 首页写入、`/parsing` 读取的用户待解析正文（sessionStorage） */
export const R2A_SESSION_PENDING_ANALYZE_TEXT_KEY =
  "r2a:pendingAnalyzeText" as const;

/** `/parsing` 成功后写入、`/result` 优先读取的最近一次解析结果（sessionStorage） */
export const R2A_SESSION_LAST_ANALYZE_RESULT_KEY =
  "r2a:lastAnalyzeResult" as const;

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
