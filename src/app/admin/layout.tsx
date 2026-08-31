"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Menu, X } from "lucide-react";

/* Armazón del panel — sistema «Perímetro».
 *
 * La comprobación de sesión y de rol NO se toca: sigue siendo exactamente la
 * de antes (el store confirma contra el backend, y `middleware.ts` ya ha
 * validado la cookie httpOnly antes de que esta ruta llegue a renderizarse).
 * Lo único que cambia aquí es el color —gris literal por tokens— y el botón
 * del cajón móvil, que ahora se anuncia.
 *
 * `{children}` es un componente de servidor (ver `admin/page.tsx`): React ya lo
 * ha resuelto y lo trae en la carga inicial, así que cuando la comprobación
 * termina no hay una segunda espera, sólo se descubre lo que ya venía hecho.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  /* Escape cierra el cajón: es un diálogo de facto sobre el contenido y en
     móvil el único modo de cerrarlo era acertar en el velo. */
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center px-gutter">
        <p role="status" className="text-sm text-muted-foreground">
          Verificando acceso…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-sunk">
      {/* Cajón en móvil. El botón queda fuera de la barra para que siga
          alcanzable con la barra abierta (que es cuando hay que cerrarla). */}
      <button
        type="button"
        aria-expanded={sidebarOpen}
        aria-controls="admin-sidebar"
        aria-label={sidebarOpen ? "Cerrar el menú del panel" : "Abrir el menú del panel"}
        className="fixed top-3 left-3 z-50 flex size-tap items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-md lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>

      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-brand-navy-deep/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen px-gutter py-6 pt-16 lg:ml-64 lg:py-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
