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
  AnalyzeClientError,
  bumpAnalyzeAttemptForRetry,
  clearAnalyzeRunSessionLocks,
  clearPendingAnalyzeTextStorage,
  pickPendingAnalyzeTextForRun,
  postAnalyze,
  readAnalyzeAttemptIdFromSession,
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
  "结构化处理",
  "生成结果",
] as const;

type StepState = "done" | "current" | "upcoming";

/** 四步依次 current：约每步 950ms，最后一步展示后再跳转，总时长约 4.2s */
const STEP_ADVANCE_MS = 950;
const FINAL_PAUSE_BEFORE_REDIRECT_MS = 600;

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

  const innerRetryRef = useRef<(() => void) | null>(null);

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
      // 成功且请求已结束：先落结果 → 清 pending（仅此时）→ 再跳转 /result；不在 cleanup / abort / catch 中清 pending
      writeLastAnalyzeResultToSession(result);
      clearPendingAnalyzeTextStorage();
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
            : "解析失败，请稍后重试。";
        queueMicrotask(() => {
          if (commitRef.current !== myCommit) return;
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
          setError("未找到待解析内容，请返回首页重新输入。");
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
      // 刻意不调用 clearPendingAnalyzeTextStorage：StrictMode cleanup 只打断请求/定时器，不得删待解析正文
    };
  }, []);

  const handleRetry = useCallback(() => {
    if (!canRetry) return;
    innerRetryRef.current?.();
  }, [canRetry]);

  const handleCancel = useCallback(() => {
    commitRef.current += 1;
    cancelledRef.current = true;
    if (autoBootTimerRef.current != null) {
      clearTimeout(autoBootTimerRef.current);
      autoBootTimerRef.current = null;
    }
    abortRef.current?.abort();
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    clearPendingAnalyzeTextStorage();
    clearAnalyzeRunSessionLocks();
    router.push("/");
  }, [router]);

  const handleGoHome = useCallback(() => {
    if (autoBootTimerRef.current != null) {
      clearTimeout(autoBootTimerRef.current);
      autoBootTimerRef.current = null;
    }
    clearPendingAnalyzeTextStorage();
    clearAnalyzeRunSessionLocks();
    router.push("/");
  }, [router]);

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[#F4F5F9]">
      <div className={r2aPageShell1020}>
        <header className="flex min-h-[62px] items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-semibold leading-tight text-[#121212]">
              正在为你解析内容…
            </h1>
            <p className="text-[14px] font-normal leading-tight text-[#939393]">
              预计 20 秒
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className={cn(
              "inline-flex h-[46px] min-w-[112px] shrink-0 items-center justify-center rounded-lg",
              "border border-[#E5E7EB] bg-white px-6 text-[16px] font-medium text-[#363636]",
              "transition-colors hover:bg-[#F9FAFB]",
            )}
          >
            取消解析
          </button>
        </header>

        {error ? (
          <div
            className="mb-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B]"
            role="alert"
          >
            <p>{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {canRetry ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className={cn(
                    "inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#363636]",
                    "hover:bg-[#FAFAFC]",
                  )}
                >
                  重试
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleGoHome}
                className={cn(
                  "inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#363636]",
                  "hover:bg-[#FAFAFC]",
                )}
              >
                返回首页
              </button>
            </div>
          </div>
        ) : null}

        <nav
          className="flex flex-wrap items-center gap-4"
          aria-label="解析进度"
        >
          {steps.map((step, index) => (
            <div key={step.id} className="contents">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    step.state === "done" && "bg-[#4F46E5] text-white",
                    step.state === "current" &&
                      "bg-[#4F46E5] text-white tabular-nums",
                    step.state === "upcoming" &&
                      "bg-[#E5E8ED] text-[#939393] tabular-nums",
                  )}
                  aria-current={step.state === "current" ? "step" : undefined}
                >
                  {step.state === "done" ? "✓" : step.id}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-[12px] font-medium",
                    step.state === "upcoming"
                      ? "text-[#939393]"
                      : "text-[#121212]",
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
                      ? "bg-[#4F46E5]"
                      : "bg-[#E5E7EB]",
                  )}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </nav>

        <section
          className={cn(
            "flex w-full flex-col gap-4 bg-white",
            r2aCardRadius,
            r2aCardBorder,
            r2aCardShadow,
            "p-5 pb-6 pt-5 pr-6 pl-6",
          )}
          aria-label="解析预览"
        >
          <p className="text-[11px] font-medium tracking-wide text-[#939393]">
            ● LIVE PREVIEW
          </p>
          <div
            className={cn(
              "flex w-full max-w-[924px] flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFC]",
              "p-3 px-4 py-4",
            )}
          >
            <div className="h-2 max-w-[480px] rounded bg-[#E8EBF0]" />
            <div className="h-2 max-w-[360px] rounded bg-[#E8EBF0]" />
            <div className="flex flex-wrap gap-3">
              <div className="h-[72px] min-w-[120px] flex-1 rounded bg-[#E8EBF0] sm:max-w-[140px]" />
              <div className="h-[72px] min-w-[120px] flex-1 rounded bg-[#E8EBF0] sm:max-w-[140px]" />
              <div className="h-[72px] min-w-[120px] flex-1 rounded bg-[#E8EBF0] sm:max-w-[140px]" />
            </div>
            <div className="h-[6px] max-w-[180px] rounded bg-[#E8EBF0]" />
            <div className="h-[6px] max-w-[220px] rounded bg-[#E8EBF0]" />
            <div className="h-[6px] max-w-[260px] rounded bg-[#E8EBF0]" />
            <div className="h-[6px] max-w-[300px] rounded bg-[#E8EBF0]" />
            <div className="h-[6px] max-w-[340px] rounded bg-[#E8EBF0]" />
            <div className="h-24 w-full max-w-[600px] rounded bg-[#E8EBF0]" />
          </div>
        </section>
      </div>
    </div>
  );
}
