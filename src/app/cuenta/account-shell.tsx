"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, MapPin, Package2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

/* Marco común de la zona de cliente: identidad, navegación y portero.
 *
 * El portero mira `status`, no `isAuthenticated`. Las páginas anteriores
 * redirigían a /login en cuanto `isAuthenticated` era falso, y ese es su valor
 * durante el primer render y mientras se revalida la cookie: al recargar
 * /cuenta/pedidos con sesión válida te echaba al login. El middleware ya
 * bloquea la ruta en el servidor; aquí sólo hay que esperar la respuesta.
 */

const links = [
  { href: "/cuenta", label: "Resumen", Icon: UserRound },
  { href: "/cuenta/pedidos", label: "Pedidos", Icon: Package2 },
  { href: "/cuenta/direcciones", label: "Direcciones", Icon: MapPin },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);

  if (status === "unauthenticated") {
    return (
      <div className="shell flex min-h-[50vh] items-center justify-center py-section">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Tu sesión se cerró
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vuelve a entrar para ver tus pedidos y tus direcciones.
          </p>
          <Button asChild size="block" className="mt-6">
            <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
              Iniciar sesión
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const loading = status === "unknown" || (status === "checking" && !user);

  return (
    <div className="shell py-section-sm">
      <header className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-green-soft font-heading text-base font-bold text-brand-green-deep"
        >
          {loading ? "·" : initials(user?.name ?? "")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-brand-green-deep">Mi cuenta</p>
          {loading ? (
            <span className="mt-1.5 block h-5 w-40 max-w-full rounded bg-surface-2" />
          ) : (
            <>
              <p className="truncate font-heading text-lg font-bold text-foreground">
                {user?.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void logout()}
          className="shrink-0"
        >
          <LogOut aria-hidden="true" />
          Cerrar sesión
        </Button>
      </header>

      <div className="mt-6 gap-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
        {/* Móvil: fila desplazable. Escritorio: columna fija. */}
        <nav
          aria-label="Secciones de mi cuenta"
          className="-mx-gutter scrollbar-hide overflow-x-auto px-gutter lg:mx-0 lg:overflow-visible lg:px-0"
        >
          <ul className="flex gap-2 lg:flex-col">
            {links.map(({ href, label, Icon }) => {
              const active =
                href === "/cuenta" ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-11 items-center gap-2.5 rounded-lg px-3.5 text-sm font-semibold transition-colors lg:w-full ${
                      active
                        ? "bg-brand-green-soft text-brand-green-deep"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
