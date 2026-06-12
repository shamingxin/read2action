"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";

const AUTH_ROUTES = new Set(["/login", "/signup"]);

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (isAuthRoute) {
    return (
      <div className="min-h-screen w-full bg-[var(--r2a-canvas-soft)] text-[var(--r2a-ink)]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[var(--r2a-canvas-soft)] text-[var(--r2a-ink)]">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
