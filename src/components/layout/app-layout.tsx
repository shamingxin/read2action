import { AppLayoutShell } from "@/components/layout/app-layout-shell";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutShell>{children}</AppLayoutShell>;
}
