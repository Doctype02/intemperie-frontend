"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileText,
  FolderTree,
  Layers,
  ClipboardList,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* Barra lateral del panel — sistema «Perímetro».
 *
 * Superficie oscura de marca (`brand-navy-deep`), la misma que el pie de la
 * tienda: en el triángulo del sistema el azul es la estructura, y una barra de
 * navegación permanente es exactamente eso. Antes era un gris suelto de la
 * paleta por defecto de Tailwind: un color que no existe en el sistema y que en
 * modo oscuro quedaba flotando sobre el fondo sin relación con él.
 *
 * EL ESTADO ACTIVO NO PUEDE SER SÓLO COLOR
 * Antes el único indicio de «estás aquí» era un relleno verde. Eso deja fuera a
 * quien navega con lector de pantalla (no hay color que leer) y a quien no
 * distingue el verde del gris de fondo. Ahora se dice de cuatro maneras a la
 * vez, y cada una funciona sin las otras:
 *
 *   1. `aria-current="page"` — el dato semántico, lo único que oye un lector.
 *   2. Una pleca verde a la izquierda — forma, no color: se ve en escala de
 *      grises y con cualquier tipo de daltonismo.
 *   3. El texto sube a blanco pleno y a semibold — contraste y peso.
 *   4. El fondo se aclara.
 *
 * OBJETIVOS TÁCTILES
 * El panel se abre desde el teléfono más de lo que parece. Cada enlace mide
 * 44px de alto (`min-h-tap`), no los 36px de antes: son siete destinos
 * apilados y equivocarse de fila cuesta una navegación de vuelta.
 */

const navItems = [
  { href: "/admin", label: "Tablero", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  /* La ficha de inspección vivía escondida dentro de `/inspecciones`, tras una
     banda ámbar y un botón de «Ver la hoja interna», en la misma pantalla que
     la solicitud del cliente. Ahora es una sección del panel como cualquier
     otra, y va junto a Pedidos porque es trabajo de campo —lo que se levanta
     en un terreno— y no catálogo. */
  { href: "/admin/inspecciones", label: "Inspecciones", icon: ClipboardList },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { href: "/admin/colecciones", label: "Colecciones", icon: Layers },
  { href: "/admin/contenido", label: "Contenido", icon: FileText },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  /* Un único árbitro de «esto es escritorio», en lugar de leer `innerWidth` en
     cada clic. Arranca en `true` a propósito: en el primer render del servidor
     no hay viewport, y equivocarse hacia «escritorio» sólo deja la barra tal
     como estaba; equivocarse hacia «móvil» la volvería `inert` —es decir,
     inservible— en un escritorio hasta que corriera el efecto. */
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const closeMobile = () => { if (!isDesktop) onClose(); };

  return (
    <aside
      id="admin-sidebar"
      /* Cerrada y en móvil, la barra sigue estando en el DOM a la izquierda de
         la pantalla: sin `inert`, el tabulador entra en ella y el foco
         desaparece de la vista sin que nada lo indique. */
      inert={!isDesktop && !open ? true : undefined}
      className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col bg-brand-navy-deep text-on-dark-soft transition-transform duration-200 ease-out-brand lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-on-dark/15 px-4">
        <Link href="/admin" className="flex min-h-tap items-center gap-2 rounded-lg px-1" onClick={closeMobile}>
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded bg-primary font-heading text-sm font-bold text-primary-foreground"
          >
            I
          </span>
          <span className="font-heading text-lg font-semibold text-on-dark">Intemperie</span>
        </Link>
        <span className="eyebrow ml-auto rounded-sm border border-on-dark/25 px-1.5 py-0.5 text-on-dark-soft">
          Admin
        </span>
      </div>

      <nav aria-label="Secciones del panel" className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex min-h-tap items-center gap-3 rounded-lg py-2 pr-3 pl-4 text-sm transition-colors ${
                    isActive
                      ? "bg-on-dark/12 font-semibold text-on-dark"
                      : "text-on-dark-soft hover:bg-on-dark/8 hover:text-on-dark"
                  }`}
                  onClick={closeMobile}
                >
                  {/* La pleca: el «estás aquí» que sobrevive a la escala de grises. */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-primary"
                    />
                  )}
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-on-dark/15 p-3">
        <div className="mb-3 rounded-lg bg-on-dark/8 p-3">
          <p className="eyebrow text-on-dark-soft">Sesión</p>
          <p className="mt-1 truncate text-sm font-medium text-on-dark">{user?.name}</p>
          <p className="truncate text-xs text-on-dark-soft">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="onDark"
            size="sm"
            className="min-h-tap flex-1"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="mr-1 size-4" aria-hidden="true" />
            Ver tienda
          </Button>
          <Button
            variant="onDark"
            size="sm"
            className="min-h-tap px-3"
            aria-label="Cerrar sesión"
            onClick={handleLogout}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
