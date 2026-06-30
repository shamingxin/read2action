import Link from "next/link";

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
    <main className="flex min-h-screen w-full items-center justify-center bg-[var(--r2a-canvas-soft)] px-6 py-16">
      <div className="flex w-full max-w-[420px] flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[var(--r2a-radius-sm)] bg-[var(--r2a-ink)] font-heading text-[15px] font-semibold leading-none text-[var(--r2a-canvas-soft)]">
              读
            </div>
            <span className="text-[14px] font-semibold leading-tight text-[var(--r2a-ink)]">
              Memo
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[28px] font-semibold leading-tight text-[var(--r2a-ink)] sm:text-[32px]">
              {title}
            </h1>
            <p className="text-[13px] leading-relaxed text-[var(--r2a-ink-muted)]">
              {description}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-5 rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] p-6",
            "shadow-[var(--r2a-shadow-soft)]",
          )}
        >
          {children}
        </div>

        {footer ? (
          <div className="text-center text-[13px] text-[var(--r2a-ink-muted)]">
            {footer}
          </div>
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
      className="font-medium text-[#1e4d80] transition-colors duration-150 ease-out hover:text-[#163d68]"
    >
      {children}
    </Link>
  );
}
