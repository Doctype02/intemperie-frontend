import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* Distintivo — sistema «Perímetro».
 *
 * Rectangular con esquinas suaves, no píldora: una etiqueta de producto de
 * fábrica, no un chip de red social. Versalitas espaciadas, como la etiqueta
 * DISPONIBLE de la referencia aprobada del precotizador.
 *
 * Cada variante tiene un trabajo. `spec` es la importante: alto, panel,
 * calibre, metros lineales. En una obra el dato manda sobre el adorno.
 */
const badgeVariants = cva(
  [
    "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5",
    "overflow-hidden rounded-md border border-transparent",
    "font-heading font-bold whitespace-nowrap uppercase tracking-[0.08em]",
    "transition-colors duration-150",
    "[&>svg]:pointer-events-none [&>svg]:size-3.5!",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        /* Disponibilidad: verde suave con tinta verde profunda — 8.4:1. */
        secondary: "bg-secondary text-secondary-foreground",
        /* Ficha técnica: la cifra en primer plano, el fondo casi ausente. */
        spec:
          "border-hairline bg-surface-2 font-semibold text-foreground normal-case tracking-normal tabular-nums",
        navy: "bg-brand-navy text-on-dark",
        /* Reservado a lo que de verdad urge: oferta, últimas unidades. */
        accent: "bg-brand-amber-soft text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border-border-strong text-foreground",
        ghost: "text-muted-foreground",
        onDark: "border-on-dark/35 bg-on-dark/15 text-on-dark",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-5 px-1.5 text-[0.625rem]",
        default: "h-6 px-2 text-2xs",
        lg: "h-7 px-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
