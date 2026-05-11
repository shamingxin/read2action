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
  "inline-flex h-11 min-w-[128px] max-w-[168px] items-center justify-between gap-2 rounded-[12px]",
  "border border-[#E5E7EB] bg-white px-3.5 text-left text-[13px] font-medium text-[#121212]",
  "shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors",
  "hover:border-[#D1D5DB] hover:bg-[#FAFAFC]",
  "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/15",
  "data-popup-open:border-[#D1D5DB] data-popup-open:bg-[#FAFAFC]",
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        id={id}
        aria-label={ariaLabel ?? "模型"}
        className={cn(triggerClass, className)}
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown
          className="size-[18px] shrink-0 text-[#939393]"
          strokeWidth={1.5}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[148px]">
        {MODEL_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onValueChange(opt.value)}
            className={cn(opt.value === value && "bg-[#F4F5F9]")}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
