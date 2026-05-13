import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ParsingPageView } from "@/components/parsing/parsing-page-view";
import {
  R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY,
  R2A_SESSION_ANALYZE_RUN_ID_KEY,
  R2A_SESSION_AUTO_ANALYZE_STARTED_KEY,
  R2A_SESSION_PENDING_ANALYZE_TEXT_KEY,
} from "@/types/analyze-api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const minimalOkData = {
  title: "T",
  sourceLabel: "粘贴正文",
  sourceName: "粘贴正文",
  summary: "S",
  keyInsights: ["a"],
  actionItems: [{ id: "1", content: "c", isDone: false }],
  knowledgeCards: [{ id: "2", title: "k", content: "x" }],
};

function seedSession() {
  sessionStorage.setItem(R2A_SESSION_PENDING_ANALYZE_TEXT_KEY, "hello body");
  sessionStorage.setItem(R2A_SESSION_ANALYZE_RUN_ID_KEY, "run-test-1");
  sessionStorage.setItem(R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY, "attempt-test-1");
  sessionStorage.removeItem(R2A_SESSION_AUTO_ANALYZE_STARTED_KEY);
}

describe("ParsingPageView /api/analyze dedupe", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "crypto",
      Object.assign(globalThis.crypto ?? {}, {
        randomUUID: () => "00000000-0000-4000-8000-000000000001",
      }),
    );
    seedSession();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it("StrictMode: exactly one POST /api/analyze for auto flow", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: minimalOkData }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <StrictMode>
        <ParsingPageView />
      </StrictMode>,
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const analyzePosts = fetchMock.mock.calls.filter(
      (c) =>
        c[0] === "/api/analyze" &&
        (c[1] as RequestInit | undefined)?.method === "POST",
    );
    expect(analyzePosts.length).toBe(1);
  });

  it("retry after failure issues a second POST", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let calls = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      calls += 1;
      if (calls === 1) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ok: false,
            error: { code: "MODEL_ERROR", message: "fail once" },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ ok: true, data: minimalOkData }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <StrictMode>
        <ParsingPageView />
      </StrictMode>,
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const retryBtn = await screen.findByRole("button", { name: "重试" });
    await act(async () => {
      fireEvent.click(retryBtn);
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const analyzePosts = fetchMock.mock.calls.filter(
      (c) =>
        c[0] === "/api/analyze" &&
        (c[1] as RequestInit | undefined)?.method === "POST",
    );
    expect(analyzePosts.length).toBe(2);
  });
});
