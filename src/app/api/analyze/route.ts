import { buildAnalyzeMessages } from "@/lib/analyze/prompt";
import {
  callOpenAICompatibleChat,
  createModelAbortSignal,
} from "@/lib/analyze/openai-chat";
import { mapModelJsonToParseResult } from "@/lib/analyze/map-model-output";
import { ERROR_CODES } from "@/lib/analyze/error-codes";
import { jsonError, jsonSuccess } from "@/lib/analyze/http";
import { validateAnalyzeBody } from "@/lib/analyze/validate-input";
import type { AnalyzeSuccessResponse } from "@/types/analyze-api";

export const runtime = "nodejs";

function isAbortError(e: unknown): boolean {
  if (e instanceof Error && e.name === "AbortError") return true;
  if (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError") {
    return true;
  }
  return false;
}

function getErrorCode(e: unknown): string | undefined {
  if (typeof e === "object" && e !== null && "code" in e && typeof (e as { code?: unknown }).code === "string") {
    return (e as { code: string }).code;
  }
  return undefined;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, ERROR_CODES.INTERNAL_ERROR, "请求体不是合法的 JSON。");
  }

  const validated = validateAnalyzeBody(body);
  if (validated instanceof Response) {
    return validated;
  }

  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  if (!apiKey) {
    return jsonError(
      500,
      ERROR_CODES.INTERNAL_ERROR,
      "服务未配置 AI_API_KEY，请联系管理员或查阅 README。",
    );
  }
  if (!model) {
    return jsonError(
      500,
      ERROR_CODES.INTERNAL_ERROR,
      "服务未配置 AI_MODEL，请联系管理员或查阅 README。",
    );
  }

  const baseUrl = process.env.AI_BASE_URL?.trim();
  const messages = buildAnalyzeMessages(validated.text);

  const { signal, cancel } = createModelAbortSignal();
  let completion;
  try {
    completion = await callOpenAICompatibleChat({
      baseUrl: baseUrl && baseUrl.length > 0 ? baseUrl : undefined,
      apiKey,
      model,
      messages,
      signal,
    });
  } catch (e: unknown) {
    if (isAbortError(e)) {
      return jsonError(504, ERROR_CODES.MODEL_TIMEOUT, "解析超时，请稍后重试。");
    }
    const code = getErrorCode(e);
    const msg = e instanceof Error ? e.message : "模型调用失败，请稍后重试。";
    if (code === ERROR_CODES.MODEL_REFUSAL) {
      return jsonError(422, ERROR_CODES.MODEL_REFUSAL, "内容无法解析，请修改正文后重试。");
    }
    if (code === ERROR_CODES.MODEL_ERROR) {
      return jsonError(502, ERROR_CODES.MODEL_ERROR, msg);
    }
    return jsonError(502, ERROR_CODES.MODEL_ERROR, msg);
  } finally {
    cancel();
  }

  try {
    const data = mapModelJsonToParseResult({
      rawContent: validated.text,
      modelContent: completion.content,
    });
    const payload: AnalyzeSuccessResponse = {
      ok: true,
      data,
      meta: {
        model,
        latencyMs: completion.latencyMs,
      },
    };
    return jsonSuccess(200, payload);
  } catch (e: unknown) {
    const code = getErrorCode(e);
    if (code === ERROR_CODES.MODEL_ERROR) {
      const msg = e instanceof Error ? e.message : "解析结果格式异常，请重试。";
      return jsonError(502, ERROR_CODES.MODEL_ERROR, msg);
    }
    return jsonError(500, ERROR_CODES.INTERNAL_ERROR, "服务暂时不可用，请稍后重试。");
  }
}
