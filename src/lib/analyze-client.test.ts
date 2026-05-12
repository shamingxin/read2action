import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyzeClientError, postAnalyze } from "./analyze-client";

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
