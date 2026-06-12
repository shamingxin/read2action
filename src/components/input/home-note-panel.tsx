"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ModelSelect } from "@/components/ui/model-select";
import { seedPendingAnalyzeSession } from "@/lib/analyze-client";
import { DEFAULT_MODEL_VALUE } from "@/lib/model-options";
import {
  r2aBtnPrimary,
  r2aCardBorder,
  r2aCardRadius,
  r2aCardShadow,
  r2aHomeInnerColumn,
  r2aPageShell1020,
  r2aPlusCircleButton,
} from "@/lib/r2a-ui-classes";
import { cn } from "@/lib/utils";

/** 与 Figma「Frame 3 / FeatureGrid」文案一致 */
const featureItems = [
  { title: "一句话总结", description: "快速把握核心要点" },
  { title: "核心观点提炼", description: "提炼关键信息与洞见" },
  { title: "行动清单", description: "明确下一步行动" },
  { title: "知识卡片", description: "结构化沉淀知识" },
] as const;

export function HomeNotePanel() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [model, setModel] = useState<string>(DEFAULT_MODEL_VALUE);

  const canSubmit = value.trim().length > 0;

  const handleStart = useCallback(() => {
    if (!value.trim()) {
      toast.info("请输入内容后再解析");
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
              今日事，我来帮。
            </h1>
            <p className="max-w-[384px] text-[15px] font-normal leading-relaxed text-[var(--r2a-ink-secondary)]">
              粘贴文本、链接或你的想法，让 AI 帮你整理成结构化笔记
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
              笔记内容
            </label>
            <div className="flex flex-col px-5 pt-5">
              <textarea
                id="note-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="粘贴文本、链接或你的想法，让 AI 帮你整理成结构化笔记"
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

            <div className="flex min-h-[68px] shrink-0 items-center justify-between border-t border-[var(--r2a-hairline-soft)] px-4 py-2">
              <button
                type="button"
                className={r2aPlusCircleButton}
                aria-label="更多输入方式（占位）"
                onClick={() => toast.info("添加附件功能暂未开放")}
              >
                <Plus className="size-4" strokeWidth={1.8} aria-hidden />
              </button>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-3 pl-3">
                <ModelSelect value={model} onValueChange={setModel} />

                <button
                  type="button"
                  aria-disabled={!canSubmit}
                  onClick={handleStart}
                  className={cn(
                    r2aBtnPrimary,
                    "gap-2",
                    "w-full max-w-[228px] sm:w-[228px]",
                    !canSubmit &&
                      "cursor-not-allowed opacity-40 saturate-75 hover:bg-[var(--r2a-ink)] hover:opacity-40",
                  )}
                >
                  <Sparkles
                    className="size-[18px] shrink-0 text-current"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  开始解析
                </button>
              </div>
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
                    "flex flex-col gap-2 bg-[var(--r2a-canvas-soft)] px-4 py-3 transition-colors duration-150 ease-out hover:border-[var(--r2a-ink-faint)] hover:bg-[var(--r2a-hover)]",
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
