import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* Botón — sistema «Perímetro».
 *
 * Tres reglas que gobiernan todas las variantes:
 *
 * 1. Objetivo táctil. Nada por debajo de 40px de alto y el tamaño por defecto
 *    es 44px: un contratista con guantes en una obra, no un ratón.
 * 2. Sólo transition-colors. Nunca transition-all: animar sombra o transform
 *    en listas de 15 productos obliga a repintar y estos servidores tienen
 *    2 vCPU. El feedback de pulsación es 1px de desplazamiento, no una escala.
 * 3. Todo color sale de un token. Ningún literal.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center",
    "rounded-lg border border-transparent bg-clip-padding",
    "font-heading font-semibold whitespace-nowrap tracking-tight",
    "transition-colors duration-150 outline-none select-none",
    "active:not-aria-[haspopup]:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.15em]",
  ],
  {
    variants: {
      variant: {
        /* Verde = acción. El botón de comprar, cotizar y avanzar. */
        default:
          "bg-primary text-primary-foreground hover:bg-brand-green-deep",
        /* Azul = estructura y autoridad. B2B, institucional, alia2. */
        navy:
          "bg-brand-navy text-on-dark hover:bg-brand-navy-deep",
        /* Ámbar = urgencia. Uno por pantalla, o deja de significar nada. */
        accent:
          "bg-brand-amber-deep text-on-dark hover:bg-brand-amber",
        /* WhatsApp = su canal comercial real. Merece su propia variante. */
        whatsapp:
          "bg-whatsapp text-on-dark hover:bg-whatsapp-deep",
        outline:
          "border-border-strong bg-surface text-foreground hover:border-primary hover:bg-brand-green-soft hover:text-brand-green-deep aria-expanded:border-primary aria-expanded:bg-brand-green-soft",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-brand-green-soft/70",
        ghost:
          "text-foreground hover:bg-muted aria-expanded:bg-muted",
        /* Sobre fotografía y secciones oscuras. */
        onDark:
          "border-on-dark/45 bg-on-dark/10 text-on-dark hover:bg-on-dark/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link:
          "h-auto rounded-sm p-0 text-primary underline decoration-primary/35 decoration-2 underline-offset-4 hover:decoration-primary",
      },
      size: {
        xs: "h-8 gap-1 rounded-md px-2.5 text-xs",
        sm: "h-9 gap-1.5 px-3 text-sm",
        default: "h-11 gap-2 px-4 text-base",
        lg: "h-13 gap-2 px-6 text-lg",
        /* Ancho completo en móvil: el patrón de una acción por pantalla. */
        block: "h-13 w-full gap-2 px-6 text-lg",
        icon: "size-11",
        "icon-xs": "size-8 rounded-md",
        "icon-sm": "size-9",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends Omit<ButtonPrimitive.Props, "children">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  children?: React.ReactNode
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string
      children?: React.ReactNode
    }>
    return React.cloneElement(child, {
      className: cn(
        buttonVariants({ variant, size, className }),
        child.props.className
      ),
      ...props,
    } as Record<string, unknown>)
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      children={children as React.ReactNode}
      {...props}
    />
  )
}

export { Button, buttonVariants }
