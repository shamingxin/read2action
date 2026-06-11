import { describe, expect, it } from "vitest";

import { R2A_TEMPORARY_PROJECT_ID } from "@/lib/local-saved-notes";
import type { NoteListRow, NoteRow, ProjectRow } from "@/lib/supabase/db-types";
import {
  DEFAULT_CLOUD_PROJECT_NAME,
  listRowToNote,
  noteToInsert,
  noteToResultJson,
  noteToUpdate,
  projectIdFromDb,
  projectIdToDb,
  projectToInsert,
  rowToNote,
  rowToProject,
} from "@/lib/supabase/mappers";
import type { Note } from "@/types";

const projectRow: ProjectRow = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  name: "默认项目",
  description: "desc",
  local_id: "sha",
  created_at: "2026-06-10T08:00:00.000Z",
  updated_at: "2026-06-10T09:00:00.000Z",
};

const noteRow: NoteRow = {
  id: "33333333-3333-4333-8333-333333333333",
  user_id: "22222222-2222-4222-8222-222222222222",
  project_id: "11111111-1111-4111-8111-111111111111",
  title: "测试笔记",
  source_type: "user_note",
  source_name: "用户粘贴文本",
  source_url: null,
  raw_content: "原文内容",
  summary: "摘要",
  key_insights: ["观点一"],
  action_items: [{ id: "a1", content: "行动", isDone: false }],
  knowledge_cards: [{ id: "k1", title: "卡片", content: "内容" }],
  result_json: { summary: "摘要" },
  tags: ["标签"],
  word_count: 12,
  saved_status: "saved",
  source_context: "global",
  local_id: null,
  created_at: "2026-06-10T08:00:00.000Z",
  updated_at: "2026-06-10T09:00:00.000Z",
};

const sampleNote: Note = {
  id: "33333333-3333-4333-8333-333333333333",
  projectId: "11111111-1111-4111-8111-111111111111",
  title: "测试笔记",
  sourceType: "user_note",
  sourceName: "用户粘贴文本",
  rawContent: "原文内容",
  summary: "摘要",
  keyInsights: ["观点一"],
  actionItems: [{ id: "a1", content: "行动", isDone: false }],
  knowledgeCards: [{ id: "k1", title: "卡片", content: "内容" }],
  tags: ["标签"],
  wordCount: 12,
  createdAt: "2026-06-10T08:00:00.000Z",
  updatedAt: "2026-06-10T09:00:00.000Z",
  savedStatus: "saved",
  sourceContext: "global",
};

describe("supabase mappers", () => {
  it("DEFAULT_CLOUD_PROJECT_NAME 为策略 A 约定值", () => {
    expect(DEFAULT_CLOUD_PROJECT_NAME).toBe("默认项目");
  });

  describe("projectIdToDb / projectIdFromDb", () => {
    it("未归档占位映射为 NULL", () => {
      expect(projectIdToDb(R2A_TEMPORARY_PROJECT_ID)).toBeNull();
    });

    it("普通 UUID 原样保留", () => {
      const id = "11111111-1111-4111-8111-111111111111";
      expect(projectIdToDb(id)).toBe(id);
    });

    it("NULL 映射回未归档占位", () => {
      expect(projectIdFromDb(null)).toBe(R2A_TEMPORARY_PROJECT_ID);
    });
  });

  describe("rowToProject", () => {
    it("映射 Project 字段并省略 null description", () => {
      const mapped = rowToProject(projectRow);
      expect(mapped).toEqual({
        id: projectRow.id,
        name: "默认项目",
        description: "desc",
        createdAt: projectRow.created_at,
        updatedAt: projectRow.updated_at,
      });
    });

    it("description 为 null 时不出现在结果中", () => {
      const mapped = rowToProject({ ...projectRow, description: null });
      expect(mapped.description).toBeUndefined();
    });
  });

  describe("projectToInsert", () => {
    it("trim name 并规范化可选字段", () => {
      expect(
        projectToInsert({
          name: "  新项目  ",
          description: undefined,
          local_id: undefined,
        }),
      ).toEqual({
        name: "新项目",
        description: null,
        local_id: null,
      });
    });
  });

  describe("rowToNote / listRowToNote", () => {
    it("完整行映射为 Note", () => {
      const mapped = rowToNote(noteRow);
      expect(mapped.projectId).toBe(noteRow.project_id);
      expect(mapped.rawContent).toBe("原文内容");
      expect(mapped.keyInsights).toEqual(["观点一"]);
      expect(mapped.savedStatus).toBe("saved");
    });

    it("project_id 为 null 时映射为 _temporary", () => {
      const mapped = rowToNote({ ...noteRow, project_id: null });
      expect(mapped.projectId).toBe(R2A_TEMPORARY_PROJECT_ID);
    });

    it("列表行省略 raw_content 时返回空字符串", () => {
      const listRow: NoteListRow = { ...noteRow };
      delete (listRow as Partial<NoteRow>).raw_content;
      delete (listRow as Partial<NoteRow>).result_json;
      const mapped = listRowToNote(listRow);
      expect(mapped.rawContent).toBe("");
      expect(mapped.title).toBe("测试笔记");
    });
  });

  describe("noteToInsert", () => {
    it("Note 映射为 DB insert payload", () => {
      const payload = noteToInsert(sampleNote);
      expect(payload.project_id).toBe(sampleNote.projectId);
      expect(payload.source_type).toBe("user_note");
      expect(payload.saved_status).toBe("saved");
      expect(payload.source_context).toBe("global");
      expect(payload.local_id).toBeNull();
      expect(payload.result_json).toMatchObject({
        title: "测试笔记",
        summary: "摘要",
      });
    });

    it("未归档 projectId 写入 NULL project_id", () => {
      const payload = noteToInsert({
        ...sampleNote,
        projectId: R2A_TEMPORARY_PROJECT_ID,
        savedStatus: "temporary",
      });
      expect(payload.project_id).toBeNull();
      expect(payload.saved_status).toBe("temporary");
    });

    it("支持显式 localId", () => {
      const payload = noteToInsert(sampleNote, { localId: "local-note-1" });
      expect(payload.local_id).toBe("local-note-1");
    });
  });

  describe("noteToResultJson", () => {
    it("包含解析相关核心字段", () => {
      const json = noteToResultJson(sampleNote);
      expect(json).toMatchObject({
        title: sampleNote.title,
        summary: sampleNote.summary,
        rawContent: sampleNote.rawContent,
        keyInsights: sampleNote.keyInsights,
      });
    });
  });

  describe("noteToUpdate", () => {
    it("仅包含有值的 patch 字段", () => {
      const patch = noteToUpdate({
        projectId: R2A_TEMPORARY_PROJECT_ID,
        savedStatus: "saved",
      });
      expect(patch.project_id).toBeNull();
      expect(patch.saved_status).toBe("saved");
      expect(patch.title).toBeUndefined();
    });

    it("更新内容字段时同步 result_json", () => {
      const patch = noteToUpdate({ summary: "新摘要" });
      expect(patch.summary).toBe("新摘要");
      expect(patch.result_json).toMatchObject({ summary: "新摘要" });
    });
  });
});
