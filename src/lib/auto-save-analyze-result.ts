import type { AnalyzeSuccessResponse } from "@/types/analyze-api";

import {
  writeLastAnalyzeNoteIdToSession,
} from "@/lib/analyze-client";
import {
  appendOrUpsertLocalSavedNote,
  dispatchLocalSavedNotesChanged,
} from "@/lib/local-saved-notes";
import {
  buildNoteFromLastAnalyze,
  buildTemporaryNoteFromLastAnalyze,
} from "@/lib/note-from-last-analyze";

function newNoteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 全局解析成功后自动写入 localStorage（temporary）。
 * 失败时静默跳过，不阻断跳转 /result。
 */
export function autoSaveGlobalAnalyzeResult(
  result: AnalyzeSuccessResponse,
): void {
  if (typeof window === "undefined") return;
  const noteId = newNoteId();
  const savedAtIso = new Date().toISOString();
  const note = buildTemporaryNoteFromLastAnalyze({
    preview: result.data,
    noteId,
    savedAtIso,
  });
  if (!note) return;
  const writeResult = appendOrUpsertLocalSavedNote(note);
  if (!writeResult.ok) return;
  writeLastAnalyzeNoteIdToSession(noteId);
  dispatchLocalSavedNotesChanged();
}

/**
 * 项目页解析成功后自动写入 localStorage（saved + project）。
 * 失败时静默跳过，不阻断跳转 /result。
 */
export function autoSaveProjectAnalyzeResult(
  result: AnalyzeSuccessResponse,
  projectId: string,
): void {
  if (typeof window === "undefined") return;
  const trimmedProjectId = projectId.trim();
  if (!trimmedProjectId) return;
  const noteId = newNoteId();
  const savedAtIso = new Date().toISOString();
  const note = buildNoteFromLastAnalyze({
    preview: result.data,
    projectId: trimmedProjectId,
    noteId,
    savedAtIso,
    savedStatus: "saved",
    sourceContext: "project",
  });
  if (!note) return;
  const writeResult = appendOrUpsertLocalSavedNote(note);
  if (!writeResult.ok) return;
  writeLastAnalyzeNoteIdToSession(noteId);
  dispatchLocalSavedNotesChanged();
}
