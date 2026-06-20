"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { seedPendingAnalyzeSession } from "@/lib/analyze-client";
import {
  r2aBtnPrimary,
  r2aCardBorder,
  r2aCardRadius,
  r2aCardShadow,
  r2aHomeInnerColumn,
  r2aPageShell1020,
} from "@/lib/r2a-ui-classes";
import { cn } from "@/lib/utils";

/** 与 Figma「Frame 3 / FeatureGrid」文案一致 */
const featureItems = [
  { title: "核心观点", description: "提炼内容里的关键判断，帮你快速抓住重点。" },
  { title: "行动清单", description: "把值得执行的想法整理成清晰的下一步。" },
  { title: "知识卡片", description: "沉淀可复用的概念、方法和启发。" },
  { title: "保存到项目", description: "把整理结果归档到项目里，方便后续回看。" },
] as const;

export function HomeNotePanel() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const canSubmit = value.trim().length > 0;

  const handleStart = useCallback(() => {
    if (!value.trim()) {
      toast.info("请输入内容后再整理");
      return;
    }
    seedPendingAnalyzeSession(value);
    router.push("/parsing");
  }, [router, value]);

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-[var(--r2a-canvas-soft)]">
      <div className={cn(r2aPageShell1020, "flex-1")}>
        <div className={cn(r2aHomeInnerColumn, "flex-1")}>
          <header className="flex flex-col gap-4">
            <h1 className="font-heading text-[32px] font-semibold leading-[1.35] text-[var(--r2a-ink)]">
              你的思考，值得被整理
            </h1>
            <p className="max-w-none text-[15px] font-normal leading-relaxed text-[var(--r2a-ink-secondary)] md:whitespace-nowrap">
              粘贴一段文字，或随手记下一个想法，我会帮你整理成清晰的笔记。
            </p>
          </header>

          <section
            className={cn(
              "flex flex-col overflow-hidden bg-white",
              r2aCardRadius,
              r2aCardBorder,
              r2aCardShadow,
            )}
            aria-label="新笔记输入"
          >
            <label htmlFor="note-input" className="sr-only">
              今天想整理点什么？
            </label>
            <div className="flex flex-col px-5 pt-5">
              <textarea
                id="note-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="今天想整理点什么？"
                className={cn(
                  "min-h-[332px] w-full resize-none border-0 bg-transparent p-0",
                  "text-[15px] leading-relaxed text-[var(--r2a-ink)]",
                  "placeholder:text-[14px] placeholder:font-normal placeholder:text-[var(--r2a-ink-faint)]",
                  "shadow-none focus:shadow-none focus-visible:shadow-none",
                  "outline-none outline-0 ring-0 ring-offset-0",
                  "focus:outline-none focus:outline-0 focus:ring-0 focus:ring-offset-0",
                  "focus-visible:outline-none focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                )}
              />
            </div>

            <div className="flex min-h-[68px] shrink-0 items-center justify-end px-4 py-2">
                <button
                  type="button"
                  aria-disabled={!canSubmit}
                  disabled={!canSubmit}
                  onClick={handleStart}
                  className={cn(
                    r2aBtnPrimary,
                    "w-full max-w-[228px] sm:w-[228px]",
                    !canSubmit &&
                      "cursor-not-allowed opacity-40 saturate-75 hover:bg-[var(--r2a-ink)] hover:opacity-40",
                  )}
                >
                  开始整理
                </button>
            </div>
          </section>

          <section aria-labelledby="home-features-heading" className="flex flex-col">
            <div
              id="home-features-heading"
              className="flex items-center gap-3 pt-6"
            >
              <span className="font-heading text-[12px] font-medium leading-none text-[var(--r2a-ink-muted)]">
                你将获得
              </span>
              <div className="h-px w-6 rounded-sm bg-[var(--r2a-hairline)]" aria-hidden />
            </div>

            <ul className="grid grid-cols-2 gap-4 pt-3 lg:grid-cols-4">
              {featureItems.map(({ title, description }) => (
                <li
                  key={title}
                  className={cn(
                    "flex flex-col gap-2 bg-[var(--r2a-canvas-soft)] px-4 py-3",
                    r2aCardRadius,
                    r2aCardBorder,
                  )}
                >
                  <span className="text-[14px] font-semibold leading-tight text-[var(--r2a-ink)]">
                    {title}
                  </span>
                  <span className="text-[12px] font-normal leading-tight text-[var(--r2a-ink-muted)]">
                    {description}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
