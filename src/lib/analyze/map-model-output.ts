import type { ActionItem, KnowledgeCard, ParseResultPreview } from "@/types/index";
import { ERROR_CODES } from "./error-codes";

/** 模型 JSON 形状（与 docs/08 §8 对齐） */
type ModelJsonShape = {
  title?: unknown;
  summary?: unknown;
  keyInsights?: unknown;
  actionItems?: unknown;
  knowledgeCards?: unknown;
};

function asNonEmptyString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

function asStringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    if (typeof item === "string" && item.trim()) {
      out.push(item.trim());
      if (out.length >= max) break;
    }
  }
  return out;
}

function mapActionItems(v: unknown): ActionItem[] {
  if (!Array.isArray(v)) return [];
  const out: ActionItem[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const content = asNonEmptyString((item as { content?: unknown }).content);
    if (!content) continue;
    const description = asNonEmptyString((item as { description?: unknown }).description) ?? undefined;
    out.push({
      id: crypto.randomUUID(),
      content,
      description,
      isDone: false,
    });
    if (out.length >= 12) break;
  }
  return out;
}

function mapKnowledgeCards(v: unknown): KnowledgeCard[] {
  if (!Array.isArray(v)) return [];
  const out: KnowledgeCard[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const title = asNonEmptyString((item as { title?: unknown }).title);
    const content = asNonEmptyString((item as { content?: unknown }).content);
    if (!title || !content) continue;
    const tag = asNonEmptyString((item as { tag?: unknown }).tag) ?? undefined;
    out.push({
      id: crypto.randomUUID(),
      title,
      content,
      tag,
    });
    if (out.length >= 8) break;
  }
  return out;
}

/**
 * 解析模型输出的 JSON 文本并映射为 ParseResultPreview。
 * 失败抛出 code=MODEL_ERROR 的 Error。
 */
export function mapModelJsonToParseResult(params: {
  rawContent: string;
  modelContent: string;
}): ParseResultPreview {
  let parsed: unknown;
  try {
    parsed = JSON.parse(params.modelContent.trim());
  } catch {
    const err = new Error("解析结果格式异常，请重试。") as Error & { code: string };
    err.code = ERROR_CODES.MODEL_ERROR;
    throw err;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    const err = new Error("解析结果格式异常，请重试。") as Error & { code: string };
    err.code = ERROR_CODES.MODEL_ERROR;
    throw err;
  }

  const o = parsed as ModelJsonShape;
  const summary = asNonEmptyString(o.summary);
  if (!summary) {
    const err = new Error("解析结果格式异常，请重试。") as Error & { code: string };
    err.code = ERROR_CODES.MODEL_ERROR;
    throw err;
  }

  const firstLine =
    params.rawContent.trim().split(/\r?\n/).find((l) => l.trim().length > 0)?.trim() ?? "";
  const title =
    asNonEmptyString(o.title) ?? (firstLine.slice(0, 80).trim() || "未命名笔记");

  const keyInsights = asStringArray(o.keyInsights, 12);
  const actionItems = mapActionItems(o.actionItems);
  const knowledgeCards = mapKnowledgeCards(o.knowledgeCards);

  const sourceName = "粘贴正文";
  const wordCount = [...params.rawContent].length;

  return {
    title,
    sourceLabel: sourceName,
    sourceName,
    tags: [],
    createdAtDisplay: new Date().toISOString().slice(0, 10),
    wordCount,
    rawContent: params.rawContent,
    summary,
    keyInsights,
    actionItems,
    knowledgeCards,
  };
}
