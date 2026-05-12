import type { ParseResultPreview } from "./index";

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
