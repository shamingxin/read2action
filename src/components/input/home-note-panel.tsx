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
    <div className="flex min-h-full w-full flex-1 flex-col bg-[#F4F5F9]">
      <div className={cn(r2aPageShell1020, "flex-1")}>
        <div className={cn(r2aHomeInnerColumn, "flex-1")}>
          <header className="flex flex-col gap-4">
            <h1 className="text-[28px] font-semibold leading-normal text-[#121212]">
              今日事，我来帮。
            </h1>
            <p className="max-w-[384px] text-[15px] font-normal leading-normal text-[#363636]">
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
                  "text-[15px] leading-relaxed text-[#121212]",
                  "placeholder:text-[14px] placeholder:font-normal placeholder:text-[#939393]",
                  "shadow-none focus:shadow-none focus-visible:shadow-none",
                  "outline-none outline-0 ring-0 ring-offset-0",
                  "focus:outline-none focus:outline-0 focus:ring-0 focus:ring-offset-0",
                  "focus-visible:outline-none focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                )}
              />
            </div>

            <div className="flex min-h-[68px] shrink-0 items-center justify-between border-t border-[#E5E7EB] px-4 py-2">
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
                      "cursor-not-allowed opacity-[0.38] saturate-75 hover:bg-[#4F46E5] hover:opacity-[0.38]",
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
              <span className="text-[12px] font-normal leading-none text-[#939393]">
                你将获得
              </span>
              <div className="h-px w-1 rounded-sm bg-[#E5E7EB]" aria-hidden />
            </div>

            <ul className="grid grid-cols-2 gap-4 pt-3 lg:grid-cols-4">
              {featureItems.map(({ title, description }) => (
                <li
                  key={title}
                  className={cn(
                    "flex flex-col gap-2 bg-white px-4 py-3",
                    r2aCardRadius,
                    r2aCardBorder,
                    r2aCardShadow,
                  )}
                >
                  <span className="text-[14px] font-semibold leading-tight text-[#121212]">
                    {title}
                  </span>
                  <span className="text-[12px] font-normal leading-tight text-[#939393]">
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
