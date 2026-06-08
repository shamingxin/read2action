import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY } from "@/types/analyze-api";

import {
  autoSaveGlobalAnalyzeResult,
  autoSaveProjectAnalyzeResult,
} from "./auto-save-analyze-result";
import {
  readAllLocalSavedNotes,
  R2A_LOCAL_SAVED_NOTES_KEY,
  R2A_TEMPORARY_PROJECT_ID,
} from "./local-saved-notes";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  } as Storage;
}

const okPayload = {
  ok: true as const,
  data: {
    title: "标题",
    sourceLabel: "粘贴",
    summary: "摘要",
    keyInsights: ["观点"],
    actionItems: [{ id: "a1", content: "行动", isDone: false }],
    knowledgeCards: [{ id: "k1", title: "卡", content: "内容" }],
  },
};

describe("autoSaveGlobalAnalyzeResult", () => {
  beforeEach(() => {
    const store = memoryStorage();
    vi.stubGlobal("localStorage", store);
    vi.stubGlobal("sessionStorage", memoryStorage());
    vi.stubGlobal(
      "window",
      {
        localStorage: store,
        sessionStorage: memoryStorage(),
        dispatchEvent: vi.fn(),
      } as unknown as Window & typeof globalThis,
    );
    vi.stubGlobal(
      "crypto",
      Object.assign(globalThis.crypto ?? {}, {
        randomUUID: () => "note-uuid-1",
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("writes temporary note to localStorage and session noteId", () => {
    autoSaveGlobalAnalyzeResult(okPayload);
    const notes = readAllLocalSavedNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe("note-uuid-1");
    expect(notes[0].projectId).toBe(R2A_TEMPORARY_PROJECT_ID);
    expect(notes[0].savedStatus).toBe("temporary");
    expect(localStorage.getItem(R2A_LOCAL_SAVED_NOTES_KEY)).toBeTruthy();
    expect(sessionStorage.getItem(R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY)).toBe(
      "note-uuid-1",
    );
  });
});

describe("autoSaveProjectAnalyzeResult", () => {
  beforeEach(() => {
    const store = memoryStorage();
    vi.stubGlobal("localStorage", store);
    vi.stubGlobal("sessionStorage", memoryStorage());
    vi.stubGlobal(
      "window",
      {
        localStorage: store,
        sessionStorage: memoryStorage(),
        dispatchEvent: vi.fn(),
      } as unknown as Window & typeof globalThis,
    );
    vi.stubGlobal(
      "crypto",
      Object.assign(globalThis.crypto ?? {}, {
        randomUUID: () => "project-note-1",
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("writes saved project note with sourceContext project", () => {
    autoSaveProjectAnalyzeResult(okPayload, "sha");
    const notes = readAllLocalSavedNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe("project-note-1");
    expect(notes[0].projectId).toBe("sha");
    expect(notes[0].savedStatus).toBe("saved");
    expect(notes[0].sourceContext).toBe("project");
    expect(notes[0].projectId).not.toBe(R2A_TEMPORARY_PROJECT_ID);
    expect(sessionStorage.getItem(R2A_SESSION_LAST_ANALYZE_NOTE_ID_KEY)).toBe(
      "project-note-1",
    );
  });
});
