import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { R2A_SESSION_PENDING_ANALYZE_TEXT_KEY } from "@/types/analyze-api";
import type { AnalyzeSuccessResponse } from "@/types/analyze-api";
import type { ParseResultPreview } from "@/types";
import {
  R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY,
  R2A_SESSION_AUTO_ANALYZE_STARTED_KEY,
} from "@/types/analyze-api";

import {
  AnalyzeClientError,
  bumpAnalyzeAttemptForRetry,
  clearPendingAnalyzeTextStorage,
  pickPendingAnalyzeTextForRun,
  postAnalyze,
  tryTakeAutoAnalyzeSessionSlot,
  writeLastAnalyzeResultToSession,
} from "./analyze-client";

const minimalOkData = {
  title: "T",
  sourceLabel: "粘贴正文",
  sourceName: "粘贴正文",
  summary: "S",
  keyInsights: ["a"],
  actionItems: [{ id: "1", content: "c", isDone: false }],
  knowledgeCards: [{ id: "2", title: "k", content: "x" }],
};

describe("postAnalyze", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes global fetch exactly once per postAnalyze call", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: minimalOkData,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await postAnalyze({ text: "hello" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/analyze");
  });

  it("maps timeout abort to MODEL_TIMEOUT (no infinite retry in caller)", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          const s = init?.signal;
          if (!s) {
            reject(new Error("no signal"));
            return;
          }
          const onAbort = () => {
            reject(new DOMException("Aborted", "AbortError"));
          };
          if (s.aborted) {
            onAbort();
            return;
          }
          s.addEventListener("abort", onAbort, { once: true });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const settled = postAnalyze({ text: "x" }, { timeoutMs: 100 }).then(
      () => ({ ok: true as const, err: undefined as undefined }),
      (err: unknown) => ({ ok: false as const, err }),
    );

    await vi.advanceTimersByTimeAsync(200);
    const out = await settled;

    expect(out.ok).toBe(false);
    expect(out.err).toBeInstanceOf(AnalyzeClientError);
    expect((out.err as AnalyzeClientError).code).toBe("MODEL_TIMEOUT");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("pickPendingAnalyzeTextForRun", () => {
  it("prefers non-empty session snapshot over ref", () => {
    expect(pickPendingAnalyzeTextForRun("  from storage  ", "ref")).toBe(
      "from storage",
    );
  });

  it("falls back to ref when session reads empty (StrictMode / transient read)", () => {
    expect(pickPendingAnalyzeTextForRun("", "  body  ")).toBe("body");
  });

  it("returns empty when both empty", () => {
    expect(pickPendingAnalyzeTextForRun("  ", "")).toBe("");
  });
});

describe("tryTakeAutoAnalyzeSessionSlot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false on second take for same run|attempt", () => {
    const { store } = stubSessionStore({});
    expect(tryTakeAutoAnalyzeSessionSlot("run-a", "att-1")).toBe(true);
    expect(store[R2A_SESSION_AUTO_ANALYZE_STARTED_KEY]).toBe("run-a|att-1");
    expect(tryTakeAutoAnalyzeSessionSlot("run-a", "att-1")).toBe(false);
  });

  it("returns true when runId or attemptId empty (no lock)", () => {
    stubSessionStore({});
    expect(tryTakeAutoAnalyzeSessionSlot("", "x")).toBe(true);
    expect(tryTakeAutoAnalyzeSessionSlot("", "x")).toBe(true);
  });
});

describe("bumpAnalyzeAttemptForRetry", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes a new attempt id to sessionStorage", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "retry-attempt-uuid",
    });
    const { store } = stubSessionStore({});
    const id = bumpAnalyzeAttemptForRetry();
    expect(id).toBe("retry-attempt-uuid");
    expect(store[R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY]).toBe(id);
  });
});

/** P0：postAnalyze / 写结果不得误删 pending；仅显式 clearPending 才删 */
function stubSessionStore(initial: Record<string, string>) {
  const store = { ...initial };
  const removeItem = vi.fn((k: string) => {
    delete store[k];
  });
  vi.stubGlobal(
    "sessionStorage",
    {
      getItem: (k: string) => (k in store ? store[k]! : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem,
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
      key: () => null,
      get length() {
        return Object.keys(store).length;
      },
    } as Storage,
  );
  return { store, removeItem };
}

describe("postAnalyze vs pending storage (P0)", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does not remove pending key on success", async () => {
    const { store, removeItem } = stubSessionStore({
      [R2A_SESSION_PENDING_ANALYZE_TEXT_KEY]: "keep-me",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: minimalOkData }),
      }),
    );

    await postAnalyze({ text: "hello" });

    expect(removeItem).not.toHaveBeenCalled();
    expect(store[R2A_SESSION_PENDING_ANALYZE_TEXT_KEY]).toBe("keep-me");
  });

  it("does not remove pending key on API error envelope", async () => {
    const { store, removeItem } = stubSessionStore({
      [R2A_SESSION_PENDING_ANALYZE_TEXT_KEY]: "keep-me",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: false,
          error: { code: "MODEL_ERROR", message: "upstream" },
        }),
      }),
    );

    await expect(postAnalyze({ text: "x" })).rejects.toThrow(AnalyzeClientError);
    expect(removeItem).not.toHaveBeenCalled();
    expect(store[R2A_SESSION_PENDING_ANALYZE_TEXT_KEY]).toBe("keep-me");
  });
});

describe("writeLastAnalyzeResultToSession vs pending (P0)", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does not remove pending key when writing last result", () => {
    const { store, removeItem } = stubSessionStore({
      [R2A_SESSION_PENDING_ANALYZE_TEXT_KEY]: "pending-body",
    });
    writeLastAnalyzeResultToSession({
      ok: true,
      data: minimalOkData as unknown as ParseResultPreview,
    } satisfies AnalyzeSuccessResponse);

    expect(removeItem).not.toHaveBeenCalled();
    expect(store[R2A_SESSION_PENDING_ANALYZE_TEXT_KEY]).toBe("pending-body");
  });
});

describe("clearPendingAnalyzeTextStorage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes r2a:pendingAnalyzeText from sessionStorage", () => {
    const store: Record<string, string> = {};
    vi.stubGlobal(
      "sessionStorage",
      {
        getItem: (k: string) => (k in store ? store[k]! : null),
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: (k: string) => {
          delete store[k];
        },
        clear: () => {
          for (const k of Object.keys(store)) delete store[k];
        },
        key: () => null,
        get length() {
          return Object.keys(store).length;
        },
      } as Storage,
    );

    store[R2A_SESSION_PENDING_ANALYZE_TEXT_KEY] = "body";
    clearPendingAnalyzeTextStorage();
    expect(store[R2A_SESSION_PENDING_ANALYZE_TEXT_KEY]).toBeUndefined();
  });
});
