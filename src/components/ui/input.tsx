import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/* Campo — sistema «Perímetro».
 *
 * 44px de alto y 16px de cuerpo en móvil: por debajo de 16px, Safari en iOS
 * hace zoom al enfocar y descoloca la página entera. El borde usa
 * --border-strong (3:1 contra el papel), no el gris decorativo: un campo que
 * no se distingue del fondo no es un campo.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-input bg-surface px-3 py-2",
        "text-[1rem] text-foreground tabular-nums",
        "transition-colors duration-150 outline-none",
        "placeholder:text-muted-foreground/80",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-heading file:text-sm file:font-semibold file:text-primary",
        "hover:border-foreground/35",
        "focus-visible:border-ring",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
