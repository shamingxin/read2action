import type { Note, NoteSavedStatus } from "@/types";

/** localStorage 中用户从 /result 保存的笔记（与 mock 合并展示） */
export const R2A_LOCAL_SAVED_NOTES_KEY = "r2a:localSavedNotes" as const;

/** 全局未归档暂存笔记的占位 projectId（仅用于路由与本地查找） */
export const R2A_TEMPORARY_PROJECT_ID = "_temporary" as const;

/** 同标签页保存后通知侧栏 / 项目列表刷新 */
export const R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT =
  "r2a:local-saved-notes-changed" as const;

export type LocalSavedNotesEnvelope = { v: 1; notes: Note[] };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isNoteLike(v: unknown): v is Note {
  if (!isRecord(v)) return false;
  if (
    typeof v.id !== "string" ||
    typeof v.projectId !== "string" ||
    typeof v.title !== "string" ||
    typeof v.summary !== "string" ||
    typeof v.rawContent !== "string" ||
    !Array.isArray(v.keyInsights) ||
    !Array.isArray(v.actionItems) ||
    !Array.isArray(v.knowledgeCards) ||
    !Array.isArray(v.tags) ||
    typeof v.wordCount !== "number" ||
    typeof v.createdAt !== "string" ||
    typeof v.updatedAt !== "string" ||
    typeof v.sourceType !== "string"
  ) {
    return false;
  }
  if (
    v.savedStatus !== undefined &&
    v.savedStatus !== "temporary" &&
    v.savedStatus !== "saved"
  ) {
    return false;
  }
  if (
    v.sourceContext !== undefined &&
    v.sourceContext !== "global" &&
    v.sourceContext !== "project"
  ) {
    return false;
  }
  return true;
}

/** 1.1 历史记录无 savedStatus 时视为已保存 */
export function resolveNoteSavedStatus(note: Note): NoteSavedStatus {
  return note.savedStatus ?? "saved";
}

function safeParseEnvelope(raw: string | null): LocalSavedNotesEnvelope {
  if (raw == null || raw.trim() === "") return { v: 1, notes: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { v: 1, notes: [] };
  }
  if (!isRecord(parsed)) return { v: 1, notes: [] };
  const notesRaw = parsed.notes;
  if (!Array.isArray(notesRaw)) return { v: 1, notes: [] };
  const notes: Note[] = [];
  for (const item of notesRaw) {
    if (isNoteLike(item)) notes.push(item);
  }
  return { v: 1, notes };
}

/** 读取容器；异常或非法结构时返回空列表，不抛错 */
export function readLocalSavedNotesEnvelope(): LocalSavedNotesEnvelope {
  if (typeof window === "undefined") return { v: 1, notes: [] };
  try {
    return safeParseEnvelope(localStorage.getItem(R2A_LOCAL_SAVED_NOTES_KEY));
  } catch {
    return { v: 1, notes: [] };
  }
}

export function readAllLocalSavedNotes(): Note[] {
  return readLocalSavedNotesEnvelope().notes;
}

export function listLocalSavedNotesByProject(projectId: string): Note[] {
  return readAllLocalSavedNotes().filter((n) => n.projectId === projectId);
}

export function findLocalSavedNote(
  projectId: string,
  noteId: string,
): Note | undefined {
  return readAllLocalSavedNotes().find(
    (n) => n.id === noteId && n.projectId === projectId,
  );
}

export function findLocalSavedNoteById(noteId: string): Note | undefined {
  return readAllLocalSavedNotes().find((n) => n.id === noteId);
}

/**
 * 将暂存记录升级为已保存并写入目标项目。
 * @returns ok: false 时带可读 reason，供 Toast
 */
export function upgradeTemporaryNoteToSaved(
  noteId: string,
  projectId: string,
  patch: Partial<Pick<Note, "title" | "summary" | "rawContent" | "keyInsights" | "actionItems" | "knowledgeCards" | "tags" | "wordCount" | "sourceName">>,
): { ok: true; note: Note } | { ok: false; reason: string } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "仅可在浏览器中保存。" };
  }
  const existing = findLocalSavedNoteById(noteId);
  if (!existing) {
    return { ok: false, reason: "未找到暂存记录，请重新解析后再保存。" };
  }
  const savedAtIso = new Date().toISOString();
  const upgraded: Note = {
    ...existing,
    ...patch,
    id: noteId,
    projectId,
    savedStatus: "saved",
    sourceContext: existing.sourceContext ?? "global",
    createdAt: existing.createdAt,
    updatedAt: savedAtIso,
  };
  const result = appendOrUpsertLocalSavedNote(upgraded);
  if (!result.ok) return result;
  return { ok: true, note: upgraded };
}

function sortByUpdatedAtDesc(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function listLocalSavedNotesByProjectSorted(projectId: string): Note[] {
  return sortByUpdatedAtDesc(listLocalSavedNotesByProject(projectId));
}

/**
 * 追加或按 `note.id` 覆盖（同 id 只保留一条，避免异常重复）。
 * @returns ok: false 时带可读 reason，供 Toast
 */
export function appendOrUpsertLocalSavedNote(
  note: Note,
): { ok: true } | { ok: false; reason: string } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "仅可在浏览器中保存。" };
  }
  let env: LocalSavedNotesEnvelope;
  try {
    env = readLocalSavedNotesEnvelope();
  } catch {
    return { ok: false, reason: "读取本地笔记失败，请重试。" };
  }
  const next = env.notes.filter((n) => n.id !== note.id);
  next.push(note);
  const out: LocalSavedNotesEnvelope = { v: 1, notes: next };
  try {
    localStorage.setItem(R2A_LOCAL_SAVED_NOTES_KEY, JSON.stringify(out));
  } catch {
    return { ok: false, reason: "无法写入本地存储（可能已满或受限）。" };
  }
  return { ok: true };
}

export function dispatchLocalSavedNotesChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(R2A_LOCAL_SAVED_NOTES_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}
