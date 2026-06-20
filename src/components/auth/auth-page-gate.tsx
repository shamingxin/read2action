"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function AuthPageGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/");
        return;
      }
      setIsReady(true);
    });
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--r2a-canvas-soft)] px-6 text-[13px] text-[var(--r2a-ink-muted)]">
        <div className="rounded-[var(--r2a-radius-lg)] border border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] px-5 py-3 shadow-[var(--r2a-shadow-soft)]">
          正在加载页面…
        </div>
      </div>
    );
  }

  return children;
}
