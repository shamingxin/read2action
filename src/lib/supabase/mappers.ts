import { R2A_TEMPORARY_PROJECT_ID } from "@/lib/local-saved-notes";
import type { Note, Project } from "@/types";

import type {
  NoteInsert,
  NoteListRow,
  NoteRow,
  NoteUpdate,
  ProjectInsert,
  ProjectRow,
} from "@/lib/supabase/db-types";

/** 登录用户无云端项目时，保存弹窗自动创建（1.3-D 策略 A） */
export const DEFAULT_CLOUD_PROJECT_NAME = "默认项目";

/** 项目列表 / 单条查询列 */
export const PROJECT_SELECT_COLUMNS =
  "id,user_id,name,description,local_id,created_at,updated_at" as const;

/** 笔记列表列（省略大字段） */
export const NOTE_LIST_SELECT_COLUMNS =
  "id,user_id,project_id,title,source_type,source_name,source_url,summary,key_insights,action_items,knowledge_cards,tags,word_count,saved_status,source_context,local_id,created_at,updated_at" as const;

/** 笔记详情列（含 `raw_content` / `result_json`） */
export const NOTE_DETAIL_SELECT_COLUMNS =
  `${NOTE_LIST_SELECT_COLUMNS},raw_content,result_json` as const;

export function projectIdToDb(projectId: string): string | null {
  return projectId === R2A_TEMPORARY_PROJECT_ID ? null : projectId;
}

export function projectIdFromDb(projectId: string | null): string {
  return projectId ?? R2A_TEMPORARY_PROJECT_ID;
}

export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function projectToInsert(input: ProjectInsert): ProjectInsert {
  return {
    name: input.name.trim(),
    description: input.description ?? null,
    local_id: input.local_id ?? null,
  };
}

function rowToNoteCore(
  row: NoteRow | NoteListRow,
  rawContent: string,
): Note {
  return {
    id: row.id,
    projectId: projectIdFromDb(row.project_id),
    title: row.title,
    sourceType: row.source_type,
    sourceName: row.source_name ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    rawContent,
    summary: row.summary,
    keyInsights: [...row.key_insights],
    actionItems: row.action_items.map((item) => ({ ...item })),
    knowledgeCards: row.knowledge_cards.map((card) => ({ ...card })),
    tags: [...row.tags],
    wordCount: row.word_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    savedStatus: row.saved_status,
    sourceContext: row.source_context,
  };
}

export function rowToNote(row: NoteRow): Note {
  return rowToNoteCore(row, row.raw_content);
}

export function listRowToNote(row: NoteListRow): Note {
  return rowToNoteCore(row, "");
}

export function noteToResultJson(note: Note): Record<string, unknown> {
  return {
    title: note.title,
    summary: note.summary,
    sourceName: note.sourceName,
    sourceUrl: note.sourceUrl,
    rawContent: note.rawContent,
    keyInsights: note.keyInsights,
    actionItems: note.actionItems,
    knowledgeCards: note.knowledgeCards,
    tags: note.tags,
    wordCount: note.wordCount,
    savedStatus: note.savedStatus,
    sourceContext: note.sourceContext,
  };
}

export function noteToInsert(note: Note, options?: { localId?: string | null }): NoteInsert {
  return {
    project_id: projectIdToDb(note.projectId),
    title: note.title,
    source_type: note.sourceType,
    source_name: note.sourceName ?? null,
    source_url: note.sourceUrl ?? null,
    raw_content: note.rawContent,
    summary: note.summary,
    key_insights: note.keyInsights,
    action_items: note.actionItems,
    knowledge_cards: note.knowledgeCards,
    result_json: noteToResultJson(note),
    tags: note.tags,
    word_count: note.wordCount,
    saved_status: note.savedStatus ?? "saved",
    source_context: note.sourceContext ?? "global",
    local_id: options?.localId ?? null,
  };
}

export function noteToUpdate(note: Partial<Note>): NoteUpdate {
  const patch: NoteUpdate = {};

  if (note.projectId !== undefined) {
    patch.project_id = projectIdToDb(note.projectId);
  }
  if (note.title !== undefined) patch.title = note.title;
  if (note.sourceType !== undefined) patch.source_type = note.sourceType;
  if (note.sourceName !== undefined) patch.source_name = note.sourceName ?? null;
  if (note.sourceUrl !== undefined) patch.source_url = note.sourceUrl ?? null;
  if (note.rawContent !== undefined) patch.raw_content = note.rawContent;
  if (note.summary !== undefined) patch.summary = note.summary;
  if (note.keyInsights !== undefined) patch.key_insights = note.keyInsights;
  if (note.actionItems !== undefined) patch.action_items = note.actionItems;
  if (note.knowledgeCards !== undefined) patch.knowledge_cards = note.knowledgeCards;
  if (note.tags !== undefined) patch.tags = note.tags;
  if (note.wordCount !== undefined) patch.word_count = note.wordCount;
  if (note.savedStatus !== undefined) patch.saved_status = note.savedStatus;
  if (note.sourceContext !== undefined) patch.source_context = note.sourceContext;

  if (
    note.title !== undefined ||
    note.summary !== undefined ||
    note.rawContent !== undefined ||
    note.keyInsights !== undefined ||
    note.actionItems !== undefined ||
    note.knowledgeCards !== undefined ||
    note.tags !== undefined ||
    note.wordCount !== undefined ||
    note.savedStatus !== undefined ||
    note.sourceContext !== undefined ||
    note.sourceName !== undefined ||
    note.sourceUrl !== undefined
  ) {
    patch.result_json = noteToResultJson({
      id: "",
      projectId: note.projectId ?? R2A_TEMPORARY_PROJECT_ID,
      title: note.title ?? "",
      sourceType: note.sourceType ?? "user_note",
      sourceName: note.sourceName,
      sourceUrl: note.sourceUrl,
      rawContent: note.rawContent ?? "",
      summary: note.summary ?? "",
      keyInsights: note.keyInsights ?? [],
      actionItems: note.actionItems ?? [],
      knowledgeCards: note.knowledgeCards ?? [],
      tags: note.tags ?? [],
      wordCount: note.wordCount ?? 0,
      createdAt: "",
      updatedAt: "",
      savedStatus: note.savedStatus,
      sourceContext: note.sourceContext,
    });
  }

  return patch;
}
