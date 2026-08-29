import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-lg border border-input bg-surface px-3 py-2.5",
        "text-[1rem] leading-relaxed text-foreground",
        "transition-colors duration-150 outline-none",
        "placeholder:text-muted-foreground/80",
        "hover:border-foreground/35",
        "focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
