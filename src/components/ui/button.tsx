import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--r2a-radius-button)] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,border-color,transform,opacity] duration-150 ease-out active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-[var(--r2a-error)] aria-invalid:ring-2 aria-invalid:ring-[var(--r2a-error)]/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--r2a-ink)] text-[var(--r2a-canvas-soft)] shadow-none hover:bg-[var(--r2a-ink-secondary)]",
        outline:
          "border-[var(--r2a-hairline)] bg-[var(--r2a-surface)] text-[var(--r2a-ink-secondary)] hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)] aria-expanded:bg-[var(--r2a-hover)]",
        secondary:
          "border-[var(--r2a-hairline)] bg-[var(--r2a-hover)] text-[var(--r2a-ink)] hover:bg-[var(--r2a-hairline-soft)] aria-expanded:bg-[var(--r2a-hover)]",
        ghost:
          "bg-transparent text-[var(--r2a-ink-secondary)] hover:bg-[var(--r2a-hover)] hover:text-[var(--r2a-ink)] aria-expanded:bg-[var(--r2a-hover)] aria-expanded:text-[var(--r2a-ink)]",
        destructive:
          "bg-[var(--r2a-error-bg)] text-[var(--r2a-error)] hover:bg-[var(--r2a-error-bg)] focus-visible:border-[var(--r2a-error)]",
        link: "text-[var(--r2a-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        action:
          "h-11 gap-2 px-5 text-[14px] font-semibold has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        "action-outline":
          "h-11 gap-2 px-5 text-[14px] font-medium has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        xs: "h-6 gap-1 rounded-[var(--r2a-radius-md)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[var(--r2a-radius-md)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8 rounded-[var(--r2a-radius-md)]",
        "icon-xs":
          "size-6 rounded-[var(--r2a-radius-md)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[var(--r2a-radius-md)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9 rounded-[var(--r2a-radius-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
