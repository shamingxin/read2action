"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";

const AUTH_ROUTES = new Set(["/login", "/signup"]);

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (isAuthRoute) {
    return (
      <div className="min-h-screen w-full bg-[#f6f5f4] text-[#171717]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F7F7FB] text-[#171717]">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
