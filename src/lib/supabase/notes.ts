import type { SupabaseClient } from "@supabase/supabase-js";

import { R2A_TEMPORARY_PROJECT_ID } from "@/lib/local-saved-notes";
import type { NoteListRow, NoteRow } from "@/lib/supabase/db-types";
import {
  listRowToNote,
  NOTE_DETAIL_SELECT_COLUMNS,
  NOTE_LIST_SELECT_COLUMNS,
  noteToInsert,
  noteToUpdate,
  projectIdToDb,
  rowToNote,
} from "@/lib/supabase/mappers";
import {
  isAuthError,
  requireCurrentUser,
  type SupabaseAuthError,
} from "@/lib/supabase/session";
import type { Note } from "@/types";

export type SupabaseDataError = SupabaseAuthError | {
  code: "supabase_error";
  message: string;
};

function toDataError(message: string): SupabaseDataError {
  return { code: "supabase_error", message };
}

export function isDataError<T>(
  value: T | SupabaseDataError,
): value is SupabaseDataError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    (value.code === "not_authenticated" || value.code === "supabase_error")
  );
}

export async function listNotesByProjectId(
  supabase: SupabaseClient,
  projectId: string,
): Promise<Note[] | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  let query = supabase
    .from("notes")
    .select(NOTE_LIST_SELECT_COLUMNS)
    .order("updated_at", { ascending: false });

  if (projectId === R2A_TEMPORARY_PROJECT_ID) {
    query = query.is("project_id", null);
  } else {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error) return toDataError(error.message);
  return (data as NoteListRow[]).map(listRowToNote);
}

export async function listRecentNotes(
  supabase: SupabaseClient,
  limit = 20,
): Promise<Note[] | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_LIST_SELECT_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return toDataError(error.message);
  return (data as NoteListRow[]).map(listRowToNote);
}

export async function getNoteById(
  supabase: SupabaseClient,
  noteId: string,
): Promise<Note | null | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_DETAIL_SELECT_COLUMNS)
    .eq("id", noteId)
    .maybeSingle();

  if (error) return toDataError(error.message);
  if (!data) return null;
  return rowToNote(data as NoteRow);
}

export async function getNoteByLocalId(
  supabase: SupabaseClient,
  localId: string,
): Promise<Note | null | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_DETAIL_SELECT_COLUMNS)
    .eq("local_id", localId)
    .maybeSingle();

  if (error) return toDataError(error.message);
  if (!data) return null;
  return rowToNote(data as NoteRow);
}

export async function insertNote(
  supabase: SupabaseClient,
  note: Note,
  options?: { localId?: string | null },
): Promise<Note | SupabaseDataError> {
  const user = await requireCurrentUser(supabase);
  if (isAuthError(user)) return user;

  const payload = {
    ...noteToInsert(note, options),
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("notes")
    .insert(payload)
    .select(NOTE_DETAIL_SELECT_COLUMNS)
    .single();

  if (error) return toDataError(error.message);
  return rowToNote(data as NoteRow);
}

export async function updateNote(
  supabase: SupabaseClient,
  noteId: string,
  patch: Partial<Note>,
): Promise<Note | SupabaseDataError> {
  const auth = await requireCurrentUser(supabase);
  if (isAuthError(auth)) return auth;

  const dbPatch = noteToUpdate(patch);
  if (Object.keys(dbPatch).length === 0) {
    const existing = await getNoteById(supabase, noteId);
    if (isDataError(existing)) return existing;
    if (!existing) return toDataError("笔记不存在。");
    return existing;
  }

  const { data, error } = await supabase
    .from("notes")
    .update(dbPatch)
    .eq("id", noteId)
    .select(NOTE_DETAIL_SELECT_COLUMNS)
    .single();

  if (error) return toDataError(error.message);
  return rowToNote(data as NoteRow);
}

/** 将应用层 projectId 转为查询条件（含未归档 `project_id IS NULL`） */
export async function deleteNote(
  supabase: SupabaseClient,
  noteId: string,
): Promise<true | SupabaseDataError> {
  const user = await requireCurrentUser(supabase);
  if (isAuthError(user)) return user;

  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return toDataError(error.message);
  if (!data) return toDataError("笔记不存在或无权删除。");
  return true;
}

export function resolveDbProjectFilter(projectId: string): {
  column: "project_id";
  value: string | null;
} {
  return {
    column: "project_id",
    value: projectIdToDb(projectId),
  };
}
