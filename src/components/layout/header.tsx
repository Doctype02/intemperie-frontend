import Link from "next/link"
import { Search } from "lucide-react"

import { CommercialBand } from "./commercial-band"
import { MobileNavTrigger } from "./mobile-nav-trigger"
import { PrimaryNav } from "./primary-nav"
import { HeaderAccount, HeaderWishlist } from "./header-user"
import { CartSheet } from "@/components/cart/cart-sheet"

/* Cabecera — sistema «Perímetro».
 *
 * Era un componente de cliente de 703 líneas con siete `useState`, tres
 * `useEffect`, un listener de scroll y el panel móvil completo montado en el
 * árbol aunque estuviera cerrado. Se hidrataba en todas las páginas de la
 * tienda, y medido con Playwright a 4× de estrangulamiento de CPU costaba la
 * mayor parte del bloqueo del hilo principal de la portada.
 *
 * Ahora es HTML de servidor con cuatro islas: menú móvil, sesión, favoritos y
 * carrito. Lo demás no se hidrata porque no lo necesita.
 *
 * El buscador es un `<form method="get" action="/productos">`. La página de
 * catálogo ya lee `searchParams.search`, así que el navegador puede hacer la
 * búsqueda él solo: no hace falta `useState`, ni `useRouter`, ni que el
 * buscador sea un componente de cliente. Funciona antes de que cargue el
 * JavaScript, que en una conexión móvil panameña son varios segundos.
 *
 * La sombra al hacer scroll también desaparece: costaba un listener y un
 * re-render por cruce de umbral para dibujar 1 px. La cabecera lleva su borde
 * inferior siempre.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:rounded-lg focus:bg-brand-green-deep focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-on-dark"
      >
        Saltar al contenido principal
      </a>

      <CommercialBand />

      <div className="border-b border-border bg-surface shadow-xs">
        <div className="shell flex h-14 items-center gap-2 lg:h-16 lg:gap-3">
          <MobileNavTrigger />

          <Link
            href="/"
            aria-label="Intemperie — inicio"
            className="flex shrink-0 items-center rounded-sm"
          >
            <span className="font-heading text-xl leading-none font-bold tracking-[-0.04em] text-foreground select-none lg:text-2xl">
              INTEM<span className="text-brand-green-deep">PERIE</span>
            </span>
          </Link>

          {/* Escritorio: buscador de verdad, sin JavaScript. */}
          <form
            action="/productos"
            method="get"
            role="search"
            className="mx-4 hidden flex-1 sm:flex lg:mx-8"
          >
            <label htmlFor="site-search" className="sr-only">
              Buscar en el catálogo
            </label>
            <div className="relative w-full">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="site-search"
                type="search"
                name="search"
                enterKeyHint="search"
                className="h-10 w-full rounded-full border border-transparent bg-surface-2 pr-4 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-surface"
                placeholder="Buscar cerca de PVC, malla, altura…"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center">
            {/* Móvil: el buscador completo vive en el panel de menú y en la
                portada. Aquí sólo el atajo al catálogo, que es un enlace. */}
            <Link
              href="/productos"
              aria-label="Buscar en el catálogo"
              className="flex size-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted sm:hidden"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>
            <HeaderAccount />
            <HeaderWishlist />
            <CartSheet />
          </div>
        </div>
      </div>

      <PrimaryNav />
    </header>
  )
}
