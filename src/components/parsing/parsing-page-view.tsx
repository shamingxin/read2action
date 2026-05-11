"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  r2aCardBorder,
  r2aCardRadius,
  r2aCardShadow,
  r2aPageShell1020,
} from "@/lib/r2a-ui-classes";
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

export function ParsingPageView() {
  const router = useRouter();
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** 0～3：第 1～4 步依次为「进行中」；仅用于 UI，取消时不再更新 */
  const [phase, setPhase] = useState(0);

  const steps = useMemo(() => {
    return STEP_LABELS.map((label, i) => {
      let state: StepState;
      if (i < phase) state = "done";
      else if (i === phase) state = "current";
      else state = "upcoming";
      return { id: i + 1, label, state };
    });
  }, [phase]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timeoutsRef.current.push(id);
    };

    timeoutsRef.current = [];
    schedule(() => setPhase(1), STEP_ADVANCE_MS * 1);
    schedule(() => setPhase(2), STEP_ADVANCE_MS * 2);
    schedule(() => setPhase(3), STEP_ADVANCE_MS * 3);
    schedule(
      () => {
        router.push("/result");
      },
      STEP_ADVANCE_MS * 4 + FINAL_PAUSE_BEFORE_REDIRECT_MS,
    );

    return () => {
      clearAllTimeouts();
    };
  }, [router, clearAllTimeouts]);

  const handleCancel = useCallback(() => {
    clearAllTimeouts();
    router.push("/");
  }, [router, clearAllTimeouts]);

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
