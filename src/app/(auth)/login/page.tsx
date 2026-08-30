import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm, LoginFormFallback } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Accede a tu cuenta de Intemperie para consultar tus pedidos de cercas de PVC y malla electrosoldada.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <p className="eyebrow text-brand-green-deep">Acceso de clientes</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">
        Entra a tu cuenta
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Para ver tus pedidos y tus direcciones de entrega.
      </p>

      <div className="mt-7">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
