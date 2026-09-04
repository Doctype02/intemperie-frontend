"use client";

import Link from "next/link";
import { Package2, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

/* Resumen de la cuenta. El portero de sesión es AccountShell (mira `status`,
 * no `isAuthenticated`): esta página no redirige por su cuenta. */

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <>
        <div className="h-40 animate-pulse rounded-xl bg-surface-2" aria-hidden="true" />
        <p role="status" className="sr-only">
          Cargando tu cuenta…
        </p>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl">Mi cuenta</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Tarjeta identidad */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-secondary">
            <User className="size-5 text-secondary-foreground" aria-hidden="true" />
          </span>
          <p className="mt-3 font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>

        <Link
          href="/cuenta/pedidos"
          className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand-green"
        >
          <span className="flex size-11 items-center justify-center rounded-lg bg-secondary">
            <Package2 className="size-5 text-secondary-foreground" aria-hidden="true" />
          </span>
          <p className="mt-3 font-semibold text-foreground">Mis pedidos</p>
          <p className="text-sm text-muted-foreground">Ver historial de pedidos</p>
        </Link>

        <Link
          href="/cuenta/direcciones"
          className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand-green"
        >
          <span className="flex size-11 items-center justify-center rounded-lg bg-secondary">
            <MapPin className="size-5 text-secondary-foreground" aria-hidden="true" />
          </span>
          <p className="mt-3 font-semibold text-foreground">Mis direcciones</p>
          <p className="text-sm text-muted-foreground">Gestionar direcciones de envío</p>
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="eyebrow text-muted-foreground">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/productos">Ver Productos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/calculadora">Calculadora de Cercas</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/carrito">Mi Carrito</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
