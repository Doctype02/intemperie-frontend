import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm, RegisterFormFallback } from "./register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Crea tu cuenta de Intemperie para hacer pedidos de cercas de PVC y malla electrosoldada y seguir su estado.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <p className="eyebrow text-brand-green-deep">Cuenta nueva</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">
        Crea tu cuenta
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tarda menos de un minuto. Sirve para seguir tus pedidos y guardar tus
        direcciones de entrega.
      </p>

      <div className="mt-7">
        <Suspense fallback={<RegisterFormFallback />}>
          <RegisterForm />
        </Suspense>
      </div>
    </section>
  );
}
