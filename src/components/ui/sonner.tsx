"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      offset={{ top: "28px" }}
      mobileOffset={{ top: "24px" }}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-[#4F46E5]" />
        ),
        info: (
          <InfoIcon className="size-4 text-[#6B7280]" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-[#B45309]" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-[#B91C1C]" />
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
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast !w-fit !max-w-[min(100vw-2rem,18rem)] justify-center !border !border-[#E5E7EB] !py-2 !px-3.5 !text-[13px] !leading-snug !shadow-sm !bg-white !text-[#363636]",
          success:
            "!border-[#E5E7EB] !bg-[#EEF2FF] !text-[#363636]",
          info: "!border-[#E5E7EB] !bg-white !text-[#363636]",
          warning: "!border-[#E5E7EB] !bg-[#FFFBEB] !text-[#78350F]",
          error: "!border-[#FECACA] !bg-[#FEF2F2] !text-[#7F1D1D]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
