"use client"

import { useState } from "react"
import { Menu } from "lucide-react"

import { MobileNav } from "./mobile-nav"

/* Disparador del panel móvil — isla mínima.
 *
 * Todo el estado del menú móvil (abierto/cerrado, bloqueo de scroll, Escape)
 * vive aquí y en `MobileNav`, no en la cabecera. `MobileNav` devuelve `null`
 * mientras está cerrado, así que en el primer pintado no hay ni un nodo del
 * panel en el árbol: son unas decenas de enlaces que en los teléfonos de gama
 * baja —la mitad del tráfico— sí se notan.
 */
export function MobileNavTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Abrir menú"
        className="-ml-2 flex size-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <MobileNav open={open} onClose={() => setOpen(false)} />
    </>
  )
}
