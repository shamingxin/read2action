"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  autoSaveGlobalAnalyzeResult,
  autoSaveProjectAnalyzeResult,
} from "@/lib/auto-save-analyze-result";
import {
  AnalyzeClientError,
  bumpAnalyzeAttemptForRetry,
  clearAnalyzeRunSessionLocks,
  clearPendingAnalyzeContextStorage,
  pickPendingAnalyzeTextForRun,
  postAnalyze,
  readAnalyzeAttemptIdFromSession,
  readAnalyzeProjectIdFromSession,
  readAnalyzeRunIdFromSession,
  tryTakeAutoAnalyzeSessionSlot,
  writeLastAnalyzeResultToSession,
} from "@/lib/analyze-client";
import {
  r2aCardBorder,
  r2aCardRadius,
  r2aCardShadow,
  r2aPageShell1020,
} from "@/lib/r2a-ui-classes";
import {
  R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY,
  R2A_SESSION_ANALYZE_RUN_ID_KEY,
  R2A_SESSION_AUTO_ANALYZE_STARTED_KEY,
  R2A_SESSION_PENDING_ANALYZE_TEXT_KEY,
} from "@/types/analyze-api";
import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "读取内容",
  "提炼要点",
  "整理脉络",
  "生成笔记",
] as const;

type StepState = "done" | "current" | "upcoming";

/** 四步依次 current：约每步 950ms，最后一步展示后再跳转，总时长约 4.2s */
const STEP_ADVANCE_MS = 950;
const FINAL_PAUSE_BEFORE_REDIRECT_MS = 600;
const LONG_PARSE_HINT_SECONDS = 20;

function computeElapsedSeconds(startedAt: number, now = Date.now()): number {
  return Math.max(1, Math.floor((now - startedAt) / 1000) + 1);
}

function formatParsingTimeHint(elapsedSeconds: number): string {
  if (elapsedSeconds > LONG_PARSE_HINT_SECONDS) {
    return `已用 ${elapsedSeconds} 秒，仍在处理中...`;
  }
  return `已用 ${elapsedSeconds} 秒`;
}

function isAbortError(e: unknown): boolean {
  return (
    (e instanceof DOMException && e.name === "AbortError") ||
    (e instanceof Error && e.name === "AbortError")
  );
}

export function ParsingPageView() {
  const router = useRouter();
  const routerRef = useRef(router);
  useLayoutEffect(() => {
    routerRef.current = router;
  }, [router]);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);
  const textRef = useRef("");
  const resultRef = useRef<Awaited<ReturnType<typeof postAnalyze>> | null>(
    null,
  );
  const stepsCompleteRef = useRef(false);
  /** 与 useEffect 世代对齐：StrictMode cleanup / 取消解析 时递增，丢弃过期异步与定时器回调 */
  const commitRef = useRef(0);
  /** 同一时刻最多一个 in-flight POST /api/analyze */
  const inFlightRef = useRef(false);
  /** A：setTimeout(0) 启动自动解析的句柄，cleanup 必须 clearTimeout（浏览器下为 number） */
  const autoBootTimerRef = useRef<number | null>(null);
  /** B：自动路径宏任务回调是否已执行（cleanup 复位，避免残留 + StrictMode 第二轮） */
  const autoBootRanRef = useRef(false);

  const [phase, setPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const parsingStartedAtRef = useRef<number | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeHintVisible, setTimeHintVisible] = useState(false);

  const innerRetryRef = useRef<(() => void) | null>(null);

  const clearTickInterval = useCallback(() => {
    if (tickIntervalRef.current != null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const syncElapsedFromStartedAt = useCallback(() => {
    const startedAt = parsingStartedAtRef.current;
    if (startedAt == null) return;
    setElapsedSeconds(computeElapsedSeconds(startedAt));
  }, []);

  const startTickInterval = useCallback(() => {
    if (tickIntervalRef.current != null) return;
    tickIntervalRef.current = setInterval(() => {
      syncElapsedFromStartedAt();
    }, 1000);
  }, [syncElapsedFromStartedAt]);

  /** 解析开始：保留已有 startedAt，避免 StrictMode 重挂载导致计时闪回 */
  const ensureParsingTimeHint = useCallback(() => {
    if (parsingStartedAtRef.current == null) {
      parsingStartedAtRef.current = Date.now();
    }
    setTimeHintVisible(true);
    syncElapsedFromStartedAt();
    startTickInterval();
  }, [startTickInterval, syncElapsedFromStartedAt]);

  /** 用户重试：显式重置 startedAt */
  const resetParsingTimeHintForRetry = useCallback(() => {
    clearTickInterval();
    parsingStartedAtRef.current = Date.now();
    setTimeHintVisible(true);
    syncElapsedFromStartedAt();
    startTickInterval();
  }, [clearTickInterval, startTickInterval, syncElapsedFromStartedAt]);

  const stopParsingTimeHint = useCallback(() => {
    clearTickInterval();
    parsingStartedAtRef.current = null;
    setTimeHintVisible(false);
    setElapsedSeconds(0);
  }, [clearTickInterval]);

  const pauseParsingTimeHint = useCallback(() => {
    clearTickInterval();
  }, [clearTickInterval]);

  const steps = useMemo(() => {
    return STEP_LABELS.map((label, i) => {
      let state: StepState;
      if (i < phase) state = "done";
      else if (i === phase) state = "current";
      else state = "upcoming";
      return { id: i + 1, label, state };
    });
  }, [phase]);

  useEffect(() => {
    const myCommit = ++commitRef.current;
    cancelledRef.current = false;

    const clearTimeouts = () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };

    const tryNavigate = () => {
      if (cancelledRef.current) return;
      if (commitRef.current !== myCommit) return;
      const result = resultRef.current;
      if (!result || !stepsCompleteRef.current) return;
      stopParsingTimeHint();
      // 成功且请求已结束：先落结果 → 按来源自动落库 → 清 pending/project 上下文（仅此时）→ 再跳转 /result
      writeLastAnalyzeResultToSession(result);
      const projectId = readAnalyzeProjectIdFromSession();
      if (projectId) {
        autoSaveProjectAnalyzeResult(result, projectId);
      } else {
        autoSaveGlobalAnalyzeResult(result);
      }
      clearPendingAnalyzeContextStorage();
      clearAnalyzeRunSessionLocks();
      routerRef.current.push("/result");
    };

    const scheduleStepTimers = () => {
      clearTimeouts();
      stepsCompleteRef.current = false;
      setPhase(0);
      const schedule = (fn: () => void, ms: number) => {
        const id = setTimeout(() => {
          if (cancelledRef.current) return;
          if (commitRef.current !== myCommit) return;
          fn();
        }, ms);
        timeoutsRef.current.push(id);
      };
      schedule(() => setPhase(1), STEP_ADVANCE_MS * 1);
      schedule(() => setPhase(2), STEP_ADVANCE_MS * 2);
      schedule(() => setPhase(3), STEP_ADVANCE_MS * 3);
      schedule(() => {
        stepsCompleteRef.current = true;
        tryNavigate();
      }, STEP_ADVANCE_MS * 4 + FINAL_PAUSE_BEFORE_REDIRECT_MS);
    };

    const runFetchOnce = async (
      signal: AbortSignal,
      source: "auto" | "retry",
    ) => {
      if (inFlightRef.current) return;
      const text = textRef.current.trim();
      if (!text) return;
      if (source === "auto") {
        const runId = readAnalyzeRunIdFromSession();
        const attemptId = readAnalyzeAttemptIdFromSession();
        if (
          runId &&
          attemptId &&
          !tryTakeAutoAnalyzeSessionSlot(runId, attemptId)
        ) {
          return;
        }
      }
      inFlightRef.current = true;
      try {
        const res = await postAnalyze(
          { text, requestId: crypto.randomUUID() },
          { signal },
        );
        if (cancelledRef.current) return;
        if (commitRef.current !== myCommit) return;
        resultRef.current = res;
        tryNavigate();
      } catch (e: unknown) {
        if (cancelledRef.current) return;
        if (commitRef.current !== myCommit) return;
        if (isAbortError(e)) return;
        resultRef.current = null;
        clearTimeouts();
        // 解析失败不清 session pending：避免未发起/未完成 POST 时 key 被误删；重试依赖 textRef；仅成功 tryNavigate 或用户取消/回首页时清理。
        const msg =
          e instanceof AnalyzeClientError
            ? e.message
            : "整理失败，请稍后重试。";
        queueMicrotask(() => {
          if (commitRef.current !== myCommit) return;
          pauseParsingTimeHint();
          setError(msg);
        });
      } finally {
        inFlightRef.current = false;
      }
    };

    const readPendingText = (): string => {
      try {
        return (
          sessionStorage.getItem(R2A_SESSION_PENDING_ANALYZE_TEXT_KEY)?.trim() ??
          ""
        );
      } catch {
        return "";
      }
    };

    const beginRun = () => {
      const text = pickPendingAnalyzeTextForRun(
        readPendingText(),
        textRef.current,
      );
      if (!text) {
        queueMicrotask(() => {
          if (commitRef.current !== myCommit) return;
          setCanRetry(false);
          setError("未找到待整理内容，请返回首页重新输入。");
        });
        return;
      }
      textRef.current = text;
      try {
        let runId = readAnalyzeRunIdFromSession();
        let attemptId = readAnalyzeAttemptIdFromSession();
        if (!runId || !attemptId) {
          runId =
            runId ||
            (typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-r`);
          attemptId =
            attemptId ||
            (typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-a`);
          sessionStorage.setItem(R2A_SESSION_ANALYZE_RUN_ID_KEY, runId);
          sessionStorage.setItem(R2A_SESSION_ANALYZE_ATTEMPT_ID_KEY, attemptId);
          sessionStorage.removeItem(R2A_SESSION_AUTO_ANALYZE_STARTED_KEY);
        }
      } catch {
        /* ignore */
      }
      if (autoBootTimerRef.current != null) {
        clearTimeout(autoBootTimerRef.current);
        autoBootTimerRef.current = null;
      }
      autoBootTimerRef.current = window.setTimeout(() => {
        autoBootTimerRef.current = null;
        if (commitRef.current !== myCommit) return;
        if (autoBootRanRef.current) return;
        autoBootRanRef.current = true;
        setCanRetry(true);
        setError(null);
        resultRef.current = null;
        stepsCompleteRef.current = false;
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        ensureParsingTimeHint();
        scheduleStepTimers();
        void runFetchOnce(abortRef.current.signal, "auto");
      }, 0);
    };

    const innerRetry = () => {
      if (!textRef.current.trim()) return;
      if (inFlightRef.current) return;
      bumpAnalyzeAttemptForRetry();
      autoBootRanRef.current = false;
      setError(null);
      resultRef.current = null;
      stepsCompleteRef.current = false;
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      resetParsingTimeHintForRetry();
      scheduleStepTimers();
      void runFetchOnce(abortRef.current.signal, "retry");
    };

    innerRetryRef.current = innerRetry;
    beginRun();

    return () => {
      commitRef.current += 1;
      cancelledRef.current = true;
      if (autoBootTimerRef.current != null) {
        clearTimeout(autoBootTimerRef.current);
        autoBootTimerRef.current = null;
      }
      autoBootRanRef.current = false;
      abortRef.current?.abort();
      inFlightRef.current = false;
      clearTimeouts();
      innerRetryRef.current = null;
      clearTickInterval();
      // 刻意不调用 stopParsingTimeHint：StrictMode 重挂载时保留 startedAt，避免时间闪回
      // 刻意不调用 clearPendingAnalyzeTextStorage：StrictMode cleanup 只打断请求/定时器，不得删待解析正文
    };
  }, [
    clearTickInterval,
    ensureParsingTimeHint,
    pauseParsingTimeHint,
    resetParsingTimeHintForRetry,
    stopParsingTimeHint,
  ]);

  const handleRetry = useCallback(() => {
    if (!canRetry) return;
    innerRetryRef.current?.();
  }, [canRetry]);

  const handleCancel = useCallback(() => {
    commitRef.current += 1;
    cancelledRef.current = true;
    stopParsingTimeHint();
    if (autoBootTimerRef.current != null) {
      clearTimeout(autoBootTimerRef.current);
      autoBootTimerRef.current = null;
    }
    abortRef.current?.abort();
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    clearPendingAnalyzeContextStorage();
    clearAnalyzeRunSessionLocks();
    router.push("/");
  }, [router, stopParsingTimeHint]);

  const handleGoHome = useCallback(() => {
    stopParsingTimeHint();
    if (autoBootTimerRef.current != null) {
      clearTimeout(autoBootTimerRef.current);
      autoBootTimerRef.current = null;
    }
    clearPendingAnalyzeContextStorage();
    clearAnalyzeRunSessionLocks();
    router.push("/");
  }, [router, stopParsingTimeHint]);

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className={r2aPageShell1020}>
        <header className="flex min-h-[62px] items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[28px] font-semibold leading-tight text-[var(--r2a-ink)]">
              正在为你整理内容…
            </h1>
            {timeHintVisible ? (
              <p className="text-[13.5px] font-normal leading-tight text-[var(--r2a-ink-muted)]">
                {formatParsingTimeHint(elapsedSeconds)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className={cn(
              "inline-flex h-10 min-w-[104px] shrink-0 items-center justify-center rounded-[var(--r2a-radius-button)]",
              "border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-4 text-[14px] font-medium text-[var(--r2a-ink-secondary)]",
              "transition-[background-color,color,transform] duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)] active:scale-[0.98]",
            )}
          >
            取消整理
          </button>
        </header>

        {error ? (
          <div
            className={cn(
              "mb-4 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-5 py-4",
              "text-[13.5px] leading-relaxed text-[var(--r2a-ink-secondary)] shadow-[var(--r2a-shadow-soft)]",
            )}
            role="alert"
          >
            <p className="font-medium text-[var(--r2a-error)]">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {canRetry ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className={cn(
                    "inline-flex min-h-10 items-center justify-center rounded-[var(--r2a-radius-button)] bg-[#1e4d80] px-4 text-[14px] font-medium text-white",
                    "transition-[background-color,transform] duration-150 ease-out hover:bg-[#163d68] active:scale-[0.98]",
                  )}
                >
                  重试
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleGoHome}
                className={cn(
                  "inline-flex min-h-10 items-center justify-center rounded-[var(--r2a-radius-button)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-4 text-[14px] font-medium text-[var(--r2a-ink-secondary)]",
                  "transition-[background-color,color,transform] duration-150 ease-out hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)] active:scale-[0.98]",
                )}
              >
                返回首页
              </button>
            </div>
          </div>
        ) : null}

        <nav
          className="flex flex-wrap items-center gap-4 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-5 py-4 shadow-[var(--r2a-shadow-soft)]"
          aria-label="整理进度"
        >
          {steps.map((step, index) => (
            <div key={step.id} className="contents">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                    step.state === "done" &&
                      "border-[#1e4d80] bg-[#1e4d80] text-white",
                    step.state === "current" &&
                      "border-[#1e4d80] bg-[#1e4d80] text-white tabular-nums",
                    step.state === "upcoming" &&
                      "border-[var(--r2a-hairline)] bg-[var(--r2a-canvas-soft)] text-[var(--r2a-ink-faint)] tabular-nums",
                  )}
                  aria-current={step.state === "current" ? "step" : undefined}
                >
                  {step.state === "done" ? "✓" : step.id}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-[12px] font-medium",
                    step.state === "upcoming"
                      ? "text-[var(--r2a-ink-muted)]"
                      : "text-[var(--r2a-ink)]",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden h-0.5 w-8 shrink-0 rounded-[1px] sm:block",
                    steps[index].state === "done"
                      ? "bg-[#1e4d80]"
                      : "bg-[var(--r2a-hairline)]",
                  )}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </nav>

        <section
          className={cn(
            "flex w-full flex-col bg-[var(--r2a-surface)]",
            r2aCardRadius,
            r2aCardBorder,
            r2aCardShadow,
            "px-6 py-5",
          )}
          aria-label="整理预览"
        >
          <div
            className={cn(
              "flex w-full max-w-[924px] flex-col gap-3 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-canvas-soft)]",
              "px-4 py-4",
            )}
          >
            <div className="h-2 max-w-[480px] rounded bg-[var(--r2a-hairline)]" />
            <div className="h-2 max-w-[360px] rounded bg-[var(--r2a-hairline-soft)]" />
            <div className="flex flex-wrap gap-3">
              <div className="h-[72px] min-w-[120px] flex-1 rounded-[var(--r2a-radius-sm)] border border-[var(--r2a-hairline-soft)] bg-[var(--r2a-surface)] sm:max-w-[140px]" />
              <div className="h-[72px] min-w-[120px] flex-1 rounded-[var(--r2a-radius-sm)] border border-[var(--r2a-hairline-soft)] bg-[var(--r2a-surface)] sm:max-w-[140px]" />
              <div className="h-[72px] min-w-[120px] flex-1 rounded-[var(--r2a-radius-sm)] border border-[var(--r2a-hairline-soft)] bg-[var(--r2a-surface)] sm:max-w-[140px]" />
            </div>
            <div className="h-[6px] max-w-[180px] rounded bg-[var(--r2a-hairline)]" />
            <div className="h-[6px] max-w-[220px] rounded bg-[var(--r2a-hairline-soft)]" />
            <div className="h-[6px] max-w-[260px] rounded bg-[var(--r2a-hairline-soft)]" />
            <div className="h-[6px] max-w-[300px] rounded bg-[var(--r2a-hairline-soft)]" />
            <div className="h-[6px] max-w-[340px] rounded bg-[var(--r2a-hairline-soft)]" />
            <div className="h-24 w-full max-w-[600px] rounded-[var(--r2a-radius-sm)] border border-[var(--r2a-hairline-soft)] bg-[var(--r2a-surface)]" />
          </div>
        </section>
      </div>
    </div>
  );
}
