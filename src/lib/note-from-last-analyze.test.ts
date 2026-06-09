import { describe, expect, it } from "vitest";

import type { ActionItem, KnowledgeCard, ParseResultPreview } from "@/types";

import { R2A_TEMPORARY_PROJECT_ID } from "./local-saved-notes";
import {
  buildNoteFromLastAnalyze,
  buildTemporaryNoteFromLastAnalyze,
} from "./note-from-last-analyze";

const iso = "2026-05-13T12:00:00.000Z";

function basePreview(over: Partial<ParseResultPreview> = {}): ParseResultPreview {
  return {
    title: "标题",
    sourceLabel: "来源",
    summary: "摘要内容",
    keyInsights: ["观点一"],
    actionItems: [{ id: "a1", content: "行动", isDone: false }],
    knowledgeCards: [{ id: "k1", title: "卡", content: "内容" }],
    ...over,
  };
}

describe("buildNoteFromLastAnalyze", () => {
  it("returns null when title empty", () => {
    expect(
      buildNoteFromLastAnalyze({
        preview: basePreview({ title: "   " }),
        projectId: "sha",
        noteId: "nid",
        savedAtIso: iso,
      }),
    ).toBeNull();
  });

  it("returns null when summary empty", () => {
    expect(
      buildNoteFromLastAnalyze({
        preview: basePreview({ summary: "" }),
        projectId: "sha",
        noteId: "nid",
        savedAtIso: iso,
      }),
    ).toBeNull();
  });

  it("maps full Note with required fields", () => {
    const note = buildNoteFromLastAnalyze({
      preview: basePreview({
        sourceName: "少数派",
        tags: ["x"],
        wordCount: 99,
      }),
      projectId: "sha",
      noteId: "uuid-1",
      savedAtIso: iso,
    });
    expect(note).not.toBeNull();
    if (!note) return;
    expect(note.id).toBe("uuid-1");
    expect(note.projectId).toBe("sha");
    expect(note.sourceType).toBe("user_note");
    expect(note.sourceName).toBe("少数派");
    expect(note.tags).toEqual(["x"]);
    expect(note.wordCount).toBe(99);
    expect(note.createdAt).toBe(iso);
    expect(note.updatedAt).toBe(iso);
    expect(note.summary).toBe("摘要内容");
    expect(note.keyInsights).toEqual(["观点一"]);
  });

  it("defaults tags to []", () => {
    const note = buildNoteFromLastAnalyze({
      preview: basePreview({ tags: undefined }),
      projectId: "sha",
      noteId: "n",
      savedAtIso: iso,
    });
    expect(note?.tags).toEqual([]);
  });

  it("fills missing actionItem / knowledgeCard ids", () => {
    const note = buildNoteFromLastAnalyze({
      preview: basePreview({
        actionItems: [
          { content: "x", isDone: true } as unknown as ActionItem,
        ],
        knowledgeCards: [
          { title: "t", content: "c" } as unknown as KnowledgeCard,
        ],
      }),
      projectId: "p",
      noteId: "nid",
      savedAtIso: iso,
    });
    expect(note?.actionItems[0].id.length).toBeGreaterThan(4);
    expect(note?.knowledgeCards[0].id.length).toBeGreaterThan(4);
    expect(note?.actionItems[0].isDone).toBe(true);
  });

  it("sets savedStatus saved and sourceContext global by default", () => {
    const note = buildNoteFromLastAnalyze({
      preview: basePreview(),
      projectId: "sha",
      noteId: "n",
      savedAtIso: iso,
    });
    expect(note?.savedStatus).toBe("saved");
    expect(note?.sourceContext).toBe("global");
  });

  it("buildTemporaryNoteFromLastAnalyze maps temporary global note", () => {
    const note = buildTemporaryNoteFromLastAnalyze({
      preview: basePreview(),
      noteId: "temp-1",
      savedAtIso: iso,
    });
    expect(note).not.toBeNull();
    if (!note) return;
    expect(note.id).toBe("temp-1");
    expect(note.projectId).toBe(R2A_TEMPORARY_PROJECT_ID);
    expect(note.savedStatus).toBe("temporary");
    expect(note.sourceContext).toBe("global");
  });

  it("rawContent fallback is never undefined when preview lacks rawContent", () => {
    const note = buildNoteFromLastAnalyze({
      preview: basePreview(),
      projectId: "sha",
      noteId: "n",
      savedAtIso: iso,
    });
    expect(note?.rawContent).toBeDefined();
    expect(typeof note?.rawContent).toBe("string");
    expect(note!.rawContent.length).toBeGreaterThan(0);
    expect(note!.rawContent).toContain("摘要内容");
  });

  it("persists preview.rawContent as note rawContent when provided", () => {
    const pasted = "用户粘贴的完整原文\n第二段内容";
    const note = buildNoteFromLastAnalyze({
      preview: basePreview({ rawContent: pasted }),
      projectId: "sha",
      noteId: "n",
      savedAtIso: iso,
    });
    expect(note?.rawContent).toBe(pasted);
  });

  it("buildTemporaryNoteFromLastAnalyze keeps pasted rawContent", () => {
    const pasted = "暂存笔记原文";
    const note = buildTemporaryNoteFromLastAnalyze({
      preview: basePreview({ rawContent: pasted }),
      noteId: "temp-2",
      savedAtIso: iso,
    });
    expect(note?.rawContent).toBe(pasted);
  });
});
