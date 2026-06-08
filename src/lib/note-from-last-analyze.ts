import { R2A_TEMPORARY_PROJECT_ID } from "@/lib/local-saved-notes";
import type {
  ActionItem,
  KnowledgeCard,
  Note,
  ParseResultPreview,
} from "@/types";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function ensureActionItems(items: ActionItem[]): ActionItem[] {
  return items.map((item) => ({
    ...item,
    id: typeof item.id === "string" && item.id.trim() ? item.id : newId(),
    content: item.content,
    description: item.description,
    isDone: item.isDone ?? false,
  }));
}

function ensureKnowledgeCards(items: KnowledgeCard[]): KnowledgeCard[] {
  return items.map((item) => ({
    ...item,
    id: typeof item.id === "string" && item.id.trim() ? item.id : newId(),
    title: item.title,
    content: item.content,
    tag: item.tag,
  }));
}

function fallbackWordCount(preview: ParseResultPreview): number {
  if (typeof preview.wordCount === "number" && preview.wordCount >= 0) {
    return preview.wordCount;
  }
  const blob = [
    preview.title,
    preview.summary,
    ...preview.keyInsights,
    ...preview.actionItems.map((a) => a.content),
    ...preview.knowledgeCards.map((k) => `${k.title}\n${k.content}`),
  ].join("\n");
  return [...blob].length;
}

/** 本阶段不依赖完整粘贴原文；保证非空字符串供详情页使用 */
function buildRawContentFallback(preview: ParseResultPreview): string {
  const parts: string[] = [preview.title, preview.summary];
  if (preview.keyInsights.length) {
    parts.push("核心观点：", ...preview.keyInsights.map((s) => `· ${s}`));
  }
  return parts.filter(Boolean).join("\n\n").trim() || preview.title;
}

export type BuildNoteFromLastAnalyzeInput = {
  preview: ParseResultPreview;
  projectId: string;
  noteId: string;
  savedAtIso: string;
  savedStatus?: Note["savedStatus"];
  sourceContext?: Note["sourceContext"];
};

function buildNoteCore(
  preview: ParseResultPreview,
  noteId: string,
  projectId: string,
  savedAtIso: string,
  extra?: Pick<Note, "savedStatus" | "sourceContext">,
): Note | null {
  const title = preview.title?.trim();
  const summary = preview.summary?.trim();
  if (!title || !summary) return null;

  return {
    id: noteId,
    projectId,
    title,
    sourceType: "user_note",
    sourceName: preview.sourceName?.trim() || "用户粘贴文本",
    rawContent: buildRawContentFallback(preview),
    summary,
    keyInsights: preview.keyInsights.map((s) => String(s)),
    actionItems: ensureActionItems(preview.actionItems),
    knowledgeCards: ensureKnowledgeCards(preview.knowledgeCards),
    tags: Array.isArray(preview.tags) ? [...preview.tags] : [],
    wordCount: fallbackWordCount(preview),
    createdAt: savedAtIso,
    updatedAt: savedAtIso,
    ...extra,
  };
}

/**
 * 将 session 中的解析预览映射为持久化 `Note`。
 * 缺 title / summary（非空）时返回 null，与保存弹窗失败一致。
 */
export function buildNoteFromLastAnalyze(
  input: BuildNoteFromLastAnalyzeInput,
): Note | null {
  const { preview, projectId, noteId, savedAtIso, savedStatus, sourceContext } =
    input;
  return buildNoteCore(preview, noteId, projectId, savedAtIso, {
    savedStatus: savedStatus ?? "saved",
    sourceContext: sourceContext ?? "global",
  });
}

/** 全局解析成功后自动暂存的未归档记录 */
export function buildTemporaryNoteFromLastAnalyze(input: {
  preview: ParseResultPreview;
  noteId: string;
  savedAtIso: string;
}): Note | null {
  const { preview, noteId, savedAtIso } = input;
  return buildNoteCore(
    preview,
    noteId,
    R2A_TEMPORARY_PROJECT_ID,
    savedAtIso,
    { savedStatus: "temporary", sourceContext: "global" },
  );
}
