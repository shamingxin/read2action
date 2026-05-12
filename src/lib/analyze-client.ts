import type { ParseResultPreview } from "@/types";
import type {
  AnalyzeRequestBody,
  AnalyzeSuccessResponse,
} from "@/types/analyze-api";
import {
  R2A_SESSION_LAST_ANALYZE_RESULT_KEY,
  R2A_SESSION_PENDING_ANALYZE_TEXT_KEY,
} from "@/types/analyze-api";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export class AnalyzeClientError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AnalyzeClientError";
    this.code = code;
  }
}

const DEFAULT_ANALYZE_TIMEOUT_MS = 30_000;

/** 从 sessionStorage 移除待解析正文（成功 / 失败 / 取消后调用，避免再次进入 /parsing 自动打 API） */
export function clearPendingAnalyzeTextStorage(): void {
  try {
    sessionStorage.removeItem(R2A_SESSION_PENDING_ANALYZE_TEXT_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * 调用 POST /api/analyze；成功返回 envelope；失败抛 AnalyzeClientError（不伪装成功）。
 * `timeoutMs` 默认 30s，与 `signal` 合并：任一 abort 即中止 fetch。
 */
export async function postAnalyze(
  body: AnalyzeRequestBody,
  init?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<AnalyzeSuccessResponse> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_ANALYZE_TIMEOUT_MS;
  const timeoutCtrl = new AbortController();
  const tid = setTimeout(() => timeoutCtrl.abort(), timeoutMs);

  const merged = new AbortController();
  const bumpMerged = () => {
    if (!merged.signal.aborted) merged.abort();
  };

  const userSig = init?.signal;
  if (userSig) {
    if (userSig.aborted) {
      clearTimeout(tid);
      throw new DOMException("Aborted", "AbortError");
    }
    userSig.addEventListener("abort", bumpMerged, { once: true });
  }
  timeoutCtrl.signal.addEventListener("abort", bumpMerged, { once: true });

  let res: Response;
  try {
    res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: merged.signal,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      if (userSig?.aborted) throw e;
      throw new AnalyzeClientError(
        "MODEL_TIMEOUT",
        "解析超时，请稍后重试。",
      );
    }
    throw new AnalyzeClientError(
      "NETWORK_ERROR",
      "网络异常，请检查连接后重试。",
    );
  } finally {
    clearTimeout(tid);
    if (userSig) userSig.removeEventListener("abort", bumpMerged);
    timeoutCtrl.signal.removeEventListener("abort", bumpMerged);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new AnalyzeClientError(
      "INTERNAL_ERROR",
      "响应格式异常，请重试。",
    );
  }

  if (!isRecord(json)) {
    throw new AnalyzeClientError(
      "INTERNAL_ERROR",
      "服务暂时不可用，请稍后重试。",
    );
  }

  if (json.ok === true && isRecord(json.data)) {
    return json as unknown as AnalyzeSuccessResponse;
  }

  if (json.ok === false && isRecord(json.error)) {
    const err = json.error;
    const code = typeof err.code === "string" ? err.code : "INTERNAL_ERROR";
    const message =
      typeof err.message === "string" && err.message.trim()
        ? err.message
        : "解析失败，请稍后重试。";
    throw new AnalyzeClientError(code, message);
  }

  throw new AnalyzeClientError(
    "INTERNAL_ERROR",
    "服务暂时不可用，请稍后重试。",
  );
}

export function writeLastAnalyzeResultToSession(
  payload: AnalyzeSuccessResponse,
): void {
  try {
    sessionStorage.setItem(
      R2A_SESSION_LAST_ANALYZE_RESULT_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // 配额或隐私模式：仍尝试跳转，由结果页决定是否回退 mock
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** 读取并校验最近一次成功解析；无效或缺失则返回 null（由调用方回退 mock） */
export function readLastAnalyzeResultFromSession(): ParseResultPreview | null {
  if (typeof window === "undefined") return null;
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(R2A_SESSION_LAST_ANALYZE_RESULT_KEY);
  } catch {
    return null;
  }
  if (raw == null || raw.trim() === "") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || parsed.ok !== true) return null;
  const data = parsed.data;
  if (!isRecord(data)) return null;
  if (!isNonEmptyString(data.title) || !isNonEmptyString(data.summary))
    return null;
  if (!Array.isArray(data.keyInsights)) return null;
  if (!Array.isArray(data.actionItems)) return null;
  if (!Array.isArray(data.knowledgeCards)) return null;

  return data as unknown as ParseResultPreview;
}
