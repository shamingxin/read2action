"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ position, ...props }: ToasterProps) => {
  const safePosition = position === "top-center" || position == null
    ? "bottom-center"
    : position

  return (
    <Sonner
      theme="light"
      position={safePosition}
      offset={{ top: "112px", bottom: "28px" }}
      mobileOffset={{ top: "24px", bottom: "20px" }}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-[var(--r2a-success)]" />
        ),
        info: (
          <InfoIcon className="size-4 text-[var(--r2a-ink-muted)]" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-[var(--r2a-warning)]" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-[var(--r2a-error)]" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--r2a-radius-xl)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast !w-fit !max-w-[min(100vw-2rem,18rem)] justify-center !border !border-[var(--r2a-hairline)] !bg-[var(--r2a-surface)] !px-3.5 !py-2 !text-[13px] !leading-snug !text-[var(--r2a-ink-secondary)] !shadow-[var(--r2a-shadow-soft)]",
          success:
            "!border-[var(--r2a-hairline)] !bg-[var(--r2a-success-bg)] !text-[var(--r2a-ink-secondary)]",
          info:
            "!border-[var(--r2a-hairline)] !bg-[var(--r2a-surface)] !text-[var(--r2a-ink-secondary)]",
          warning:
            "!border-[var(--r2a-hairline)] !bg-[var(--r2a-warning-bg)] !text-[var(--r2a-ink)]",
          error:
            "!border-[var(--r2a-hairline)] !bg-[var(--r2a-error-bg)] !text-[var(--r2a-error)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
