import { cn } from "@/lib/utils"

/* Esqueleto — pulso de opacidad, no barrido de gradiente.
   Un keyframe animando `background-position` sobre un degradado obliga a
   repintar en cada frame; la opacidad la resuelve el compositor.
   Con prefers-reduced-motion la animación queda neutralizada en globals.css. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
