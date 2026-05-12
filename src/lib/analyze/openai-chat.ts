import { ANALYZE_MODEL_TIMEOUT_MS, DEFAULT_AI_BASE_URL } from "./constants";
import { ERROR_CODES } from "./error-codes";

export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionResult = {
  content: string;
  finishReason: string | null;
  latencyMs: number;
};

function normalizeBaseUrl(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim();
  const base = trimmed.length > 0 ? trimmed.replace(/\/+$/, "") : DEFAULT_AI_BASE_URL;
  return base;
}

/**
 * OpenAI-compatible `POST /chat/completions`（无 SDK）。
 * 超时抛出带 code 的 Error，供 route 映射为 504 MODEL_TIMEOUT。
 */
export async function callOpenAICompatibleChat(params: {
  baseUrl?: string;
  apiKey: string;
  model: string;
  messages: ChatCompletionMessage[];
  signal: AbortSignal;
}): Promise<ChatCompletionResult> {
  const base = normalizeBaseUrl(params.baseUrl);
  const url = `${base}/chat/completions`;
  const started = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: 0.3,
    }),
    signal: params.signal,
  });

  const latencyMs = Date.now() - started;

  if (!res.ok) {
    let message = `上游返回 HTTP ${res.status}`;
    let code: string = ERROR_CODES.MODEL_ERROR;
    try {
      const errJson: unknown = await res.json();
      const errMsg =
        errJson &&
        typeof errJson === "object" &&
        "error" in errJson &&
        errJson.error &&
        typeof errJson.error === "object" &&
        "message" in errJson.error &&
        typeof (errJson.error as { message?: unknown }).message === "string"
          ? (errJson.error as { message: string }).message
          : null;
      if (errMsg) message = errMsg;

      const errType =
        errJson &&
        typeof errJson === "object" &&
        "error" in errJson &&
        errJson.error &&
        typeof errJson.error === "object" &&
        "type" in errJson.error
          ? String((errJson.error as { type?: unknown }).type ?? "")
          : "";
      const lower = `${errType} ${message}`.toLowerCase();
      if (
        res.status === 400 &&
        (lower.includes("content_policy") ||
          lower.includes("content filter") ||
          lower.includes("safety") ||
          lower.includes("policy"))
      ) {
        code = ERROR_CODES.MODEL_REFUSAL;
      }
      if (res.status === 403) {
        code = ERROR_CODES.MODEL_REFUSAL;
      }
    } catch {
      // ignore parse failure
    }
    const err = new Error(message) as Error & { code: string; status: number };
    err.code = code;
    err.status = res.status;
    throw err;
  }

  const data: unknown = await res.json();
  const choice =
    data &&
    typeof data === "object" &&
    "choices" in data &&
    Array.isArray((data as { choices?: unknown }).choices)
      ? (data as { choices: unknown[] }).choices[0]
      : undefined;

  const finishReason =
    choice &&
    typeof choice === "object" &&
    "finish_reason" in choice &&
    typeof (choice as { finish_reason?: unknown }).finish_reason === "string"
      ? (choice as { finish_reason: string }).finish_reason
      : null;

  const content =
    choice &&
    typeof choice === "object" &&
    "message" in choice &&
    (choice as { message?: unknown }).message &&
    typeof (choice as { message: { content?: unknown } }).message === "object" &&
    typeof (choice as { message: { content?: unknown } }).message.content === "string"
      ? (choice as { message: { content: string } }).message.content
      : "";

  if (finishReason === "content_filter") {
    const err = new Error("内容未通过安全策略，无法解析。") as Error & { code: string };
    err.code = ERROR_CODES.MODEL_REFUSAL;
    throw err;
  }

  if (!content.trim()) {
    const err = new Error("模型未返回有效内容。") as Error & { code: string };
    err.code = ERROR_CODES.MODEL_ERROR;
    throw err;
  }

  return { content, finishReason, latencyMs };
}

export function createModelAbortSignal(): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ANALYZE_MODEL_TIMEOUT_MS);
  const cancel = () => {
    clearTimeout(timer);
  };
  return {
    signal: controller.signal,
    cancel,
  };
}
