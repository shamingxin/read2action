import type { ParseResultPreview } from "@/types";
import type {
  AnalyzeRequestBody,
  AnalyzeSuccessResponse,
} from "@/types/analyze-api";
import {
  R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY,
  R2A_SESSION_ANALYZE_PROJECT_ID_KEY,
  R2A_SESSION_ANALYZE_RUN_ID_KEY,
  R2A_SESSION_AUTO_ANALYZE_STARTED_KEY,
  R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY,
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

function normalizeAnalyzeErrorMessage(message: string): string {
  return message
    .replaceAll("解析结果", "整理结果")
    .replaceAll("解析", "整理");
}

/**
 * 从 sessionStorage 移除待解析正文。
 * 调用时机（与 `/parsing` 一致）：解析成功、已写入 `lastAnalyzeResult` 且准备 `push("/result")` **之前**清 pending；或用户点「取消解析」「返回首页」。不在 effect cleanup / fetch 发起前 / Abort 路径中调用。
 * 不在 `postAnalyze` 失败 catch 中调用，以免 StrictMode / abort 竞态下误删 pending。
 */
export function clearPendingAnalyzeTextStorage(): void {
  try {
    sessionStorage.removeItem(R2A_SESSION_PENDING_ANALYZE_TEXT_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAnalyzeProjectIdFromSession(): void {
  try {
    sessionStorage.removeItem(R2A_SESSION_ANALYZE_PROJECT_ID_KEY);
  } catch {
    /* ignore */
  }
}

/** 成功离开 /parsing 或用户取消时：清除待解析正文与项目来源上下文 */
export function clearPendingAnalyzeContextStorage(): void {
  clearPendingAnalyzeTextStorage();
  clearAnalyzeProjectIdFromSession();
}

export type SeedPendingAnalyzeSessionOptions = {
  projectId?: string;
};

/**
 * 首页 / 项目页进入 `/parsing` 前写入待解析正文与 run 锁。
 * 与 `/parsing` A+B+C 配套：每次新解析使用新的 runId / attemptId，并清除自动槽。
 * 项目页传入 `projectId` 时写入，供成功后自动归档；全局入口不传并清除残留 projectId。
 */
export function seedPendingAnalyzeSession(
  text: string,
  options?: SeedPendingAnalyzeSessionOptions,
): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const projectId = options?.projectId?.trim();
  try {
    sessionStorage.setItem(R2A_SESSION_PENDING_ANALYZE_TEXT_KEY, trimmed);
    const runId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-r`;
    const attemptId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-a`;
    sessionStorage.setItem(R2A_SESSION_ANALYZE_RUN_ID_KEY, runId);
    sessionStorage.setItem(R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY, attemptId);
    sessionStorage.removeItem(R2A_SESSION_AUTO_ANALYZE_STARTED_KEY);
    if (projectId) {
      sessionStorage.setItem(R2A_SESSION_ANALYZE_PROJECT_ID_KEY, projectId);
    } else {
      sessionStorage.removeItem(R2A_SESSION_ANALYZE_PROJECT_ID_KEY);
    }
  } catch {
    /* 隐私模式等：仍进入 /parsing，由解析页提示无正文 */
  }
}

export function readAnalyzeProjectIdFromSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = sessionStorage
      .getItem(R2A_SESSION_ANALYZE_PROJECT_ID_KEY)
      ?.trim();
    return id || null;
  } catch {
    return null;
  }
}

/**
 * `/parsing` 选用待解析正文：优先当前 sessionStorage；若为空则回退到 ref 内已同步的正文。
 * 用于 StrictMode 双次 effect 或 storage 短暂读空时，避免误判「无正文」而跳过 `postAnalyze`。
 */
export function pickPendingAnalyzeTextForRun(
  fromSessionStorage: string,
  cachedFromRef: string,
): string {
  const a = fromSessionStorage.trim();
  const b = cachedFromRef.trim();
  return (a || b).trim();
}

function analyzeAutoSlotValue(runId: string, attemptId: string): string {
  return `${runId}|${attemptId}`;
}

export function readAnalyzeRunIdFromSession(): string {
  try {
    return sessionStorage.getItem(R2A_SESSION_ANALYZE_RUN_ID_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function readAnalyzeAttemptIdFromSession(): string {
  try {
    return (
      sessionStorage.getItem(R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY)?.trim() ?? ""
    );
  } catch {
    return "";
  }
}

/**
 * 自动路径（非重试）：同一 `runId|attemptId` 在 tab 内只允许占用一次，用于 StrictMode / 重挂载防重复 POST。
 * @returns true 表示本次可继续发起 `postAnalyze`；false 表示已占用，应跳过。
 */
export function tryTakeAutoAnalyzeSessionSlot(
  runId: string,
  attemptId: string,
): boolean {
  if (!runId || !attemptId) return true;
  try {
    const want = analyzeAutoSlotValue(runId, attemptId);
    const cur = sessionStorage.getItem(R2A_SESSION_AUTO_ANALYZE_STARTED_KEY);
    if (cur === want) return false;
    sessionStorage.setItem(R2A_SESSION_AUTO_ANALYZE_STARTED_KEY, want);
    return true;
  } catch {
    return true;
  }
}

/** 用户点「重试」：新 attempt，使自动槽与下一次 POST 对齐 */
export function bumpAnalyzeAttemptForRetry(): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    sessionStorage.setItem(R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

/** 成功离开 /parsing、取消、回首页时移除 run / attempt / 自动槽（不含 pending，pending 由调用方清） */
export function clearAnalyzeRunSessionLocks(): void {
  try {
    sessionStorage.removeItem(R2A_SESSION_AUTO_ANALYZE_STARTED_KEY);
    sessionStorage.removeItem(R2A_SESSION_ANALYZE_RUN_ID_KEY);
    sessionStorage.removeItem(R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY);
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
        "整理超时，请稍后重试。",
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
      "整理失败，请稍后重试。",
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
        ? normalizeAnalyzeErrorMessage(err.message)
        : "整理失败，请稍后重试。";
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

export function writeLastAnalyzeNoteIdToSession(noteId: string): void {
  try {
    sessionStorage.setItem(R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY, noteId);
  } catch {
    /* ignore */
  }
}

export function readLastAnalyzeNoteIdFromSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = sessionStorage.getItem(R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY)?.trim();
    return id || null;
  } catch {
    return null;
  }
}

export function clearLastAnalyzeNoteIdFromSession(): void {
  try {
    sessionStorage.removeItem(R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY);
  } catch {
    /* ignore */
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
