import type { AnalyzeRequestBody } from "@/types/analyze-api";
import { ANALYZE_MAX_TEXT_CHARS } from "./constants";
import { ERROR_CODES } from "./error-codes";
import { jsonError } from "./http";

/** 与 docs/08 §9.2 一致的启发式：避免把长文误判为「纯链接」 */
function isMostlyLinkInput(text: string): boolean {
  const t = text.trim();
  if (t.length === 0) return false;

  if (/^https?:\/\/\S+$/.test(t) && t.length < 2048) {
    return true;
  }

  const lines = t.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length > 3) return false;

  const nonWs = t.replace(/\s/g, "");
  if (nonWs.length === 0) return false;

  const urlCharMatches = nonWs.match(/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/g);
  const urlChars = urlCharMatches?.length ?? 0;
  return urlChars / nonWs.length > 0.85;
}

export type ValidatedAnalyzeInput = {
  text: string;
  locale?: string;
  requestId?: string;
};

/**
 * 校验请求体；失败时返回可直接 `return` 的 Response。
 */
export function validateAnalyzeBody(body: unknown): ValidatedAnalyzeInput | Response {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return jsonError(400, ERROR_CODES.INTERNAL_ERROR, "请求体必须是 JSON 对象。");
  }

  const { text, locale, requestId } = body as Partial<AnalyzeRequestBody>;

  if (typeof text !== "string") {
    return jsonError(400, ERROR_CODES.EMPTY_INPUT, "缺少有效的 text 字段。");
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return jsonError(400, ERROR_CODES.EMPTY_INPUT, "请输入要解析的正文。");
  }

  if (text.length > ANALYZE_MAX_TEXT_CHARS) {
    return jsonError(
      400,
      ERROR_CODES.INPUT_TOO_LONG,
      `正文过长，请控制在 ${ANALYZE_MAX_TEXT_CHARS} 字符以内。`,
    );
  }

  if (isMostlyLinkInput(text)) {
    return jsonError(
      422,
      ERROR_CODES.LINK_INPUT_NOT_SUPPORTED,
      "当前版本暂不支持自动读取链接正文，请复制正文后粘贴。",
    );
  }

  if (locale !== undefined && typeof locale !== "string") {
    return jsonError(400, ERROR_CODES.INTERNAL_ERROR, "locale 必须是字符串。");
  }
  if (requestId !== undefined && typeof requestId !== "string") {
    return jsonError(400, ERROR_CODES.INTERNAL_ERROR, "requestId 必须是字符串。");
  }

  return {
    text,
    locale: typeof locale === "string" ? locale : undefined,
    requestId: typeof requestId === "string" ? requestId : undefined,
  };
}
