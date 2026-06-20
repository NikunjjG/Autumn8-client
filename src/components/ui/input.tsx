import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "ghost";
  isError?: boolean;
  isActive?: boolean;
}

function Input({ className, type, variant = "default", isError, isActive, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        variant === "ghost"
          ? cn(
              "w-full input-ghost px-4 py-2.5 placeholder:text-slate-400 text-sm rounded-md",
              isActive && "input-ghost-active",
              isError && "input-ghost-error"
            )
          : "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
