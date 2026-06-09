export type SourceType =
  | "article"
  | "video"
  | "note"
  | "user_note"
  | "other";

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** 解析发起来源（1.2+） */
export type NoteSourceContext = "global" | "project";

/** 本地保存状态（1.2+）；缺省视为已保存，兼容 1.1 历史记录 */
export type NoteSavedStatus = "temporary" | "saved";

export interface Note {
  id: string;
  projectId: string;
  title: string;
  sourceType: SourceType;
  sourceName?: string;
  sourceUrl?: string;
  rawContent: string;
  summary: string;
  keyInsights: string[];
  actionItems: ActionItem[];
  knowledgeCards: KnowledgeCard[];
  tags: string[];
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  /** 未归档暂存；缺省视为 saved */
  savedStatus?: NoteSavedStatus;
  /** 解析入口；缺省视为 global */
  sourceContext?: NoteSourceContext;
}

export interface ActionItem {
  id: string;
  content: string;
  description?: string;
  isDone: boolean;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  tag?: string;
}

/** 解析结果页使用的临时结构（与保存后的 Note 字段对齐，便于后续串联） */
export interface ParseResultPreview {
  title: string;
  /** 兼容旧字段；优先用 sourceName + 页面拼接「来源：」 */
  sourceLabel: string;
  /** 展示用来源名，如「少数派」 */
  sourceName?: string;
  tags?: string[];
  /** 如 2024-05-20 */
  createdAtDisplay?: string;
  wordCount?: number;
  /** 用户粘贴的完整原文；旧 session 可能缺失 */
  rawContent?: string;
  summary: string;
  keyInsights: string[];
  actionItems: ActionItem[];
  knowledgeCards: KnowledgeCard[];
}
