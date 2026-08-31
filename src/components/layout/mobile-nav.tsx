"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Search, X, ChevronDown, ChevronRight, Phone, Mail, Clock,
  User, Building2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"
import { useAuthStore } from "@/lib/store/auth-store"
import {
  CONTACT, WA_MESSAGE, NAV_LINKS, COLECCIONES, accountLinks, loginHref,
  MALLAS, PVC_RESIDENCIAL, PVC_INDUSTRIAL, PVC_COSTERAS,
  type NavProduct,
} from "./nav-data"

/* Navegación móvil — sistema «Perímetro».
 *
 * La mayor parte del tráfico entra por aquí, así que este panel no es un menú
 * de respaldo: es la navegación principal. Tres decisiones:
 *
 * 1. WhatsApp primero. Antes de cualquier enlace, a ancho completo. Quien abre
 *    el menú en un móvil suele querer preguntar, no navegar un catálogo.
 * 2. Plegables nativos (`details`/`summary`). El navegador ya sabe hacer esto:
 *    expone el estado a los lectores de pantalla, funciona sin JavaScript y no
 *    cuesta ni un `useState` ni un re-render por pulsación.
 * 3. Nada se pinta cerrado. `return null` mantiene el árbol fuera de memoria en
 *    los teléfonos de gama baja que son la mitad de las visitas.
 */

function ProductLink({ p, onClose }: { p: NavProduct; onClose: () => void }) {
  return (
    <Link
      href={`/productos/${p.slug}`}
      onClick={onClose}
      className="flex min-h-tap items-center justify-between gap-3 rounded-md px-3 text-base text-foreground transition-colors active:bg-brand-green-soft"
    >
      <span className="font-medium">{p.name}</span>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        Alto {p.spec}
      </span>
    </Link>
  )
}

function Section({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-hairline">
      <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between px-gutter py-3 font-heading text-base font-bold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="px-2 pb-3">{children}</div>
    </details>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow px-3 pt-3 pb-1 text-muted-foreground">{children}</p>
  )
}

export interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const [search, setSearch] = useState("")
  const closeRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  /* Bloqueo de desplazamiento del fondo y cierre con Escape. Ambos viven aquí
     y no en la cabecera: quien abre el panel es quien debe limpiarlo. */
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    if (!q) return
    router.push(`/productos?search=${encodeURIComponent(q)}`)
    setSearch("")
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-background lg:hidden"
    >
      {/* Cabecera del panel: se queda fija para que salir sea siempre posible. */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-hairline bg-surface px-gutter">
        <span className="font-heading text-xl font-bold tracking-tight text-foreground">
          INTEM<span className="text-primary">PERIE</span>
        </span>
        <Button
          ref={closeRef}
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X className="size-5" />
        </Button>
      </div>

      <div className="border-b border-hairline bg-surface-2 px-gutter py-4">
        {/* La acción comercial va antes que el catálogo, no después. */}
        <Button variant="whatsapp" size="block" asChild>
          <a
            href={whatsappHref(WA_MESSAGE.quote)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            <IconWhatsApp />
            Cotizar por WhatsApp
          </a>
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {CONTACT.hours} · Te respondemos con precio por metro lineal
        </p>

        <form onSubmit={submitSearch} className="mt-4">
          <label htmlFor="mobile-search" className="sr-only">
            Buscar productos
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="mobile-search"
              type="search"
              className="h-11 w-full rounded-lg border border-border-strong bg-surface pr-3 pl-10 text-base text-foreground transition-colors placeholder:text-muted-foreground"
              placeholder="Buscar modelo o medida…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      <nav aria-label="Catálogo">
        <Section title="Cercas de PVC" defaultOpen>
          <GroupLabel>Residencial</GroupLabel>
          {PVC_RESIDENCIAL.map((p) => <ProductLink key={p.slug} p={p} onClose={onClose} />)}
          <GroupLabel>Industrial</GroupLabel>
          {PVC_INDUSTRIAL.map((p) => <ProductLink key={p.slug} p={p} onClose={onClose} />)}
          <GroupLabel>Zonas costeras</GroupLabel>
          {PVC_COSTERAS.map((p) => <ProductLink key={p.slug} p={p} onClose={onClose} />)}
          <Link
            href="/productos"
            onClick={onClose}
            className="mt-2 flex min-h-tap items-center gap-1.5 rounded-md px-3 font-heading text-base font-bold text-primary"
          >
            Ver todo el catálogo
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </Section>

        <Section title="Malla electrosoldada">
          {MALLAS.map((p) => <ProductLink key={p.slug} p={p} onClose={onClose} />)}
        </Section>

        <Section title="Colecciones">
          {COLECCIONES.map((c) => (
            <Link
              key={c.slug}
              href={`/productos?collection=${c.slug}`}
              onClick={onClose}
              className="flex min-h-tap flex-col justify-center rounded-md px-3 py-1.5 transition-colors active:bg-brand-green-soft"
            >
              <span className="text-base font-medium text-foreground">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.who}</span>
            </Link>
          ))}
        </Section>
      </nav>

      <nav aria-label="Servicios" className="border-b border-hairline">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex min-h-tap items-center justify-between border-b border-hairline px-gutter font-heading text-base font-bold text-foreground last:border-b-0 active:bg-surface-2"
          >
            {item.label}
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      {/* B2B: el ámbar de alia2, un solo acento en toda la pantalla. */}
      <Link
        href="/instaladores"
        onClick={onClose}
        className="flex min-h-tap items-center gap-2.5 border-b border-hairline bg-brand-amber-soft px-gutter py-3 text-accent-foreground"
      >
        <Building2 className="size-4 shrink-0" aria-hidden="true" />
        <span className="font-heading text-base font-bold">
          Programa para empresas y contratistas
        </span>
      </Link>

      <div className="px-gutter py-4">
        {isAuthenticated ? (
          <>
            <p className="truncate pb-2 text-sm text-muted-foreground">
              Sesión de <span className="font-semibold text-foreground">{user?.name}</span>
            </p>
            <div className="grid gap-2">
              {/* Lista compartida con el menu de escritorio. Estaban escritas por
                  separado y ya habian divergido: el escritorio ofrecia el panel de
                  administracion y el movil no, asi que desde el telefono no habia
                  forma de llegar. */}
              {accountLinks(user?.role).map((item) => (
                <Button key={item.href} variant="outline" size="block" asChild>
                  <Link href={item.href} onClick={onClose}>{item.label}</Link>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="block"
                className="text-destructive"
                onClick={() => { logout(); onClose() }}
              >
                Cerrar sesión
              </Button>
            </div>
          </>
        ) : (
          <div className="grid gap-2">
            <Button variant="outline" size="block" asChild>
              <Link href={loginHref(pathname)} onClick={onClose}>
                <User className="size-4" />
                Iniciar sesión
              </Link>
            </Button>
            <Button variant="ghost" size="block" asChild>
              <Link href="/registro" onClick={onClose}>Crear una cuenta</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Contacto al fondo: quien llega hasta aquí no encontró lo que buscaba. */}
      <div className="mt-auto grid gap-3 border-t border-hairline bg-brand-navy-deep px-gutter py-5 text-sm text-on-dark-soft">
        <a href={CONTACT.phoneHref} className="flex items-center gap-2.5 rounded-sm">
          <Phone className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
          <span className="tabular-nums">{CONTACT.phoneDisplay}</span>
        </a>
        <a href={CONTACT.emailHref} className="flex items-center gap-2.5 rounded-sm break-all">
          <Mail className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
          {CONTACT.email}
        </a>
        <p className="flex items-center gap-2.5">
          <Clock className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
          {CONTACT.hours}
        </p>
      </div>
    </div>
  )
}
