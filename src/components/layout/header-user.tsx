"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, User } from "lucide-react"

import { useAuthStore } from "@/lib/store/auth-store"
import { useWishlist } from "@/lib/hooks/use-wishlist"

/* Islas de sesión y favoritos — sistema «Perímetro».
 *
 * Son las dos únicas piezas de la cabecera que dependen de estado del cliente
 * (token en la store, favoritos en localStorage). Antes vivían dentro de una
 * cabecera `"use client"` de 700 líneas: para pintar un contador de favoritos,
 * el navegador hidrataba el logo, el buscador, el menú de escritorio completo
 * con sus cuatro submenús y el panel móvil entero.
 *
 * Aquí son dos botones. El resto de la cabecera es HTML de servidor que no se
 * hidrata nunca.
 */

const iconButton =
  "relative flex size-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"

export function HeaderAccount() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Link href="/login" className={iconButton} aria-label="Iniciar sesión">
        <User className="size-5" aria-hidden="true" />
      </Link>
    )
  }

  const items = [
    { label: "Mi cuenta", href: "/cuenta" },
    { label: "Mis pedidos", href: "/cuenta/pedidos" },
    ...(user?.role === "ADMIN" ? [{ label: "Panel de administración", href: "/admin" }] : []),
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Mi cuenta"
        className={iconButton}
      >
        <User className="size-5" aria-hidden="true" />
        <span className="absolute right-1.5 bottom-1.5 size-2 rounded-full bg-primary ring-2 ring-surface" />
      </button>

      {open && (
        <>
          {/* Capa de cierre: un div, no un listener global de documento. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
            <div className="border-b border-hairline px-3 py-2">
              <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-tap items-center rounded-lg px-3 text-sm text-foreground transition-colors hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => { setOpen(false); logout() }}
              className="flex min-h-tap w-full items-center rounded-lg px-3 text-left text-sm text-destructive transition-colors hover:bg-muted"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function HeaderWishlist() {
  const { count } = useWishlist()

  return (
    <Link
      href="/favoritos"
      className={iconButton}
      aria-label={count > 0 ? `Favoritos (${count})` : "Favoritos"}
    >
      <Heart className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] leading-none font-bold text-destructive-foreground tabular-nums">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  )
}
