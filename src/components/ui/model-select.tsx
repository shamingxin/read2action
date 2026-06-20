"use client";

import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MODEL_OPTIONS } from "@/lib/model-options";
import { cn } from "@/lib/utils";

const triggerClass = cn(
  "inline-flex h-10 min-w-[128px] max-w-[168px] items-center justify-between gap-2 rounded-[var(--r2a-radius-button)]",
  "border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-3.5 text-left text-[13px] font-medium text-[var(--r2a-ink)]",
  "shadow-[var(--r2a-shadow-soft)] transition-colors duration-150 ease-out",
  "hover:bg-[var(--r2a-hover)]",
  "outline-none focus:outline-none focus-visible:outline-none",
  "data-popup-open:bg-[var(--r2a-hover)]",
);

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  "aria-label"?: string;
  className?: string;
};

export function ModelSelect({
  value,
  onValueChange,
  id,
  "aria-label": ariaLabel,
  className,
}: Props) {
  const label =
    MODEL_OPTIONS.find((o) => o.value === value)?.label ?? value;

  if (MODEL_OPTIONS.length === 1) {
    return (
      <span
        id={id}
        aria-label={ariaLabel ?? "整理方式"}
        className={cn(triggerClass, "cursor-default", className)}
      >
        <span className="min-w-0 truncate">{MODEL_OPTIONS[0].label}</span>
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        id={id}
        aria-label={ariaLabel ?? "整理方式"}
        className={cn(triggerClass, className)}
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown
          className="size-[18px] shrink-0 text-[var(--r2a-ink-muted)]"
          strokeWidth={1.5}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[148px]">
        {MODEL_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onValueChange(opt.value)}
            className={cn(opt.value === value && "bg-[var(--r2a-hover)] text-[var(--r2a-ink)]")}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
