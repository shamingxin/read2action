import type { NoteSavedStatus, NoteSourceContext, SourceType } from "@/types";
import type { ActionItem, KnowledgeCard } from "@/types";

/** `public.projects` 行（与 migration 草案一致） */
export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  local_id: string | null;
  created_at: string;
  updated_at: string;
};

/** `public.notes` 全量行（详情查询） */
export type NoteRow = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  source_type: SourceType;
  source_name: string | null;
  source_url: string | null;
  raw_content: string;
  summary: string;
  key_insights: string[];
  action_items: ActionItem[];
  knowledge_cards: KnowledgeCard[];
  result_json: Record<string, unknown> | null;
  tags: string[];
  word_count: number;
  saved_status: NoteSavedStatus;
  source_context: NoteSourceContext;
  local_id: string | null;
  created_at: string;
  updated_at: string;
};

/** 列表查询行（省略 `raw_content` / `result_json`） */
export type NoteListRow = Omit<NoteRow, "raw_content" | "result_json"> & {
  raw_content?: never;
  result_json?: never;
};

export type ProjectInsert = {
  name: string;
  description?: string | null;
  local_id?: string | null;
};

export type NoteInsert = {
  project_id: string | null;
  title: string;
  source_type: SourceType;
  source_name?: string | null;
  source_url?: string | null;
  raw_content: string;
  summary: string;
  key_insights: string[];
  action_items: ActionItem[];
  knowledge_cards: KnowledgeCard[];
  result_json?: Record<string, unknown> | null;
  tags: string[];
  word_count: number;
  saved_status: NoteSavedStatus;
  source_context: NoteSourceContext;
  local_id?: string | null;
};

export type NoteUpdate = Partial<
  Pick<
    NoteInsert,
    | "project_id"
    | "title"
    | "source_type"
    | "source_name"
    | "source_url"
    | "raw_content"
    | "summary"
    | "key_insights"
    | "action_items"
    | "knowledge_cards"
    | "result_json"
    | "tags"
    | "word_count"
    | "saved_status"
    | "source_context"
    | "local_id"
  >
>;
