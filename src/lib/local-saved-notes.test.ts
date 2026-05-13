import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Note } from "@/types";

import {
  appendOrUpsertLocalSavedNote,
  readAllLocalSavedNotes,
  readLocalSavedNotesEnvelope,
  R2A_LOCAL_SAVED_NOTES_KEY,
  listLocalSavedNotesByProjectSorted,
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

function sampleNote(over: Partial<Note> = {}): Note {
  const base: Note = {
    id: "n1",
    projectId: "sha",
    title: "T",
    sourceType: "user_note",
    sourceName: "用户粘贴文本",
    rawContent: "raw",
    summary: "S",
    keyInsights: ["a"],
    actionItems: [{ id: "ai1", content: "do", isDone: false }],
    knowledgeCards: [{ id: "kc1", title: "K", content: "C" }],
    tags: [],
    wordCount: 10,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-02T00:00:00.000Z",
  };
  return { ...base, ...over };
}

describe("local-saved-notes", () => {
  beforeEach(() => {
    const store = memoryStorage();
    vi.stubGlobal("localStorage", store);
    vi.stubGlobal(
      "window",
      { localStorage: store } as unknown as Window & typeof globalThis,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns empty list when key missing", () => {
    expect(readAllLocalSavedNotes()).toEqual([]);
    expect(readLocalSavedNotesEnvelope().notes).toEqual([]);
  });

  it("safely degrades on invalid JSON", () => {
    localStorage.setItem(R2A_LOCAL_SAVED_NOTES_KEY, "{not json");
    expect(readAllLocalSavedNotes()).toEqual([]);
  });

  it("appends and reads new note", () => {
    const n = sampleNote({ id: "a" });
    expect(appendOrUpsertLocalSavedNote(n)).toEqual({ ok: true });
    expect(readAllLocalSavedNotes()).toHaveLength(1);
    expect(readAllLocalSavedNotes()[0].id).toBe("a");
  });

  it("replaces same id instead of duplicating", () => {
    const n1 = sampleNote({ id: "same", title: "first" });
    const n2 = sampleNote({
      id: "same",
      title: "second",
      updatedAt: "2026-05-10T00:00:00.000Z",
    });
    expect(appendOrUpsertLocalSavedNote(n1)).toEqual({ ok: true });
    expect(appendOrUpsertLocalSavedNote(n2)).toEqual({ ok: true });
    const all = readAllLocalSavedNotes();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe("second");
  });

  it("listLocalSavedNotesByProjectSorted filters and sorts by updatedAt desc", () => {
    appendOrUpsertLocalSavedNote(
      sampleNote({
        id: "1",
        projectId: "sha",
        updatedAt: "2026-05-01T00:00:00.000Z",
      }),
    );
    appendOrUpsertLocalSavedNote(
      sampleNote({
        id: "2",
        projectId: "sha",
        updatedAt: "2026-05-10T00:00:00.000Z",
      }),
    );
    appendOrUpsertLocalSavedNote(
      sampleNote({
        id: "3",
        projectId: "other",
        updatedAt: "2026-06-01T00:00:00.000Z",
      }),
    );
    const sorted = listLocalSavedNotesByProjectSorted("sha");
    expect(sorted.map((x) => x.id)).toEqual(["2", "1"]);
  });

  it("returns ok:false when setItem throws", () => {
    const store = memoryStorage();
    vi.spyOn(store, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    vi.stubGlobal("localStorage", store);
    vi.stubGlobal(
      "window",
      { localStorage: store } as unknown as Window & typeof globalThis,
    );
    const r = appendOrUpsertLocalSavedNote(sampleNote());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/无法写入/);
  });
});
