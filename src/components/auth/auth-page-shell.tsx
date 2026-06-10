import Link from "next/link";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthPageShell({
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-[420px] flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#4F46E5]">
              <Sparkles className="size-4 text-white" aria-hidden />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[#121212]">
              Read2Action
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[24px] font-semibold leading-tight text-[#121212]">
              {title}
            </h1>
            <p className="text-[13px] leading-relaxed text-[#615d59]">
              {description}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-5 rounded-[12px] border border-[#E5E7EB] bg-white p-6",
            "shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
          )}
        >
          {children}
        </div>

        {footer ? (
          <div className="text-center text-[13px] text-[#615d59]">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}

export function AuthPageFooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-[#4F46E5] transition-colors hover:text-[#4338CA]"
    >
      {children}
    </Link>
  );
}
