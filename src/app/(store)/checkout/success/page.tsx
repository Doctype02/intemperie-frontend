"use client";

import Link from "next/link";
import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, HelpCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp";
import { CONTACT } from "@/components/layout/nav-data";

/* Pantalla de cierre del pedido — sistema «Perímetro».
 *
 * Aquí se acaba de gastar dinero, así que la pantalla sólo puede decir lo que
 * el sistema respalda. Se han quitado dos frases que no respaldaba nadie:
 * «recibirás un correo de confirmación» (no hay envío de correo detrás de este
 * flujo) e «instalación», que contradice al precio del catálogo —es de
 * material—. Lo que queda es lo que sí ocurre: el pedido queda registrado con
 * su referencia y alguien llama.
 *
 * El foco salta al titular al entrar: quien navega con lector de pantalla
 * necesita oír «pago confirmado» al llegar, no descubrirlo tabulando.
 */
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("ref");
  const method = searchParams.get("method");
  const isPaidByCard = method === "tilopay";

  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, []);

  const whatsappSteps = [
    {
      title: "Tu pedido llegó a nuestro equipo",
      desc: "Un asesor lo revisa y te contesta por el mismo chat de WhatsApp.",
    },
    {
      title: "Coordinación del pago",
      desc: "Aceptamos transferencia bancaria, Yappy, Clave, Visa y Mastercard.",
    },
    {
      title: "Coordinación de la entrega",
      desc: "Te contactamos para acordar dónde y cuándo recibes el material.",
    },
  ];

  const tilopaySteps = [
    {
      title: "Pago confirmado",
      desc: "Tilopay aprobó el cobro y tu pedido quedó registrado.",
    },
    {
      title: "Revisión del pedido",
      desc: "Confirmamos existencias y te avisamos si algo cambia.",
    },
    {
      title: "Coordinación de la entrega",
      desc: "Te contactamos para acordar dónde y cuándo recibes el material.",
    },
  ];

  const steps = isPaidByCard ? tilopaySteps : whatsappSteps;

  const waMessage = orderRef
    ? `Hola Intemperie, acabo de ${isPaidByCard ? "pagar" : "enviar"} mi pedido (Ref: ${orderRef}) y quiero confirmar los detalles.`
    : "Hola Intemperie, acabo de hacer un pedido y quiero confirmar los detalles.";

  return (
    <div className="shell max-w-xl py-section">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <CheckCircle className="h-10 w-10 text-secondary-foreground" aria-hidden="true" />
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-2xl font-bold text-foreground sm:text-3xl"
        >
          {isPaidByCard ? "¡Pago confirmado!" : "¡Pedido enviado!"}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          {isPaidByCard
            ? "Tu pago fue procesado con éxito. Nos ponemos en contacto para coordinar la entrega."
            : "Tu pedido llegó a nuestro equipo por WhatsApp. Te contactamos para confirmarlo."}
        </p>

        {orderRef ? (
          <p className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-lg border border-brand-green/40 bg-secondary px-4 py-2.5">
            <span className="text-xs font-semibold text-secondary-foreground">
              Número de pedido:
            </span>
            <span className="text-sm font-bold tracking-widest text-secondary-foreground tabular">
              {orderRef}
            </span>
          </p>
        ) : (
          /* Sin referencia en la URL no se inventa una: se dice y se ofrece por
             dónde recuperarla, que es lo único útil en ese momento. */
          <p className="mx-auto mt-4 flex max-w-sm items-start gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-3 text-left text-sm text-muted-foreground">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Esta pantalla no trae el número de pedido. Lo encuentras en{" "}
              <Link
                href="/cuenta/pedidos"
                className="font-semibold text-primary underline decoration-primary/40 decoration-2 underline-offset-4 hover:decoration-primary"
              >
                Mis pedidos
              </Link>{" "}
              o te lo damos por WhatsApp.
            </span>
          </p>
        )}
      </div>

      <section
        aria-labelledby="next-steps-title"
        className="mb-4 overflow-hidden rounded-xl border border-border bg-surface"
      >
        <h2
          id="next-steps-title"
          className="eyebrow border-b border-hairline bg-surface-2 px-5 py-4 text-muted-foreground"
        >
          ¿Qué sigue?
        </h2>
        <ol className="divide-y divide-hairline">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4 px-5 py-4">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground tabular"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* El teléfono y el correo son enlaces: en el móvil, donde se paga, un
          número que no se puede tocar obliga a copiarlo a mano. */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Phone className="h-5 w-5 text-secondary-foreground" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">¿Tienes dudas? Llámanos o escríbenos:</p>
          <p className="text-sm font-semibold text-foreground">
            <a
              href={CONTACT.phoneHref}
              className="underline decoration-border-strong decoration-2 underline-offset-4 hover:decoration-primary"
            >
              <span className="tabular">{CONTACT.phoneDisplay}</span>
            </a>
            <span className="text-muted-foreground"> · </span>
            <a
              href={CONTACT.emailHref}
              className="break-all underline decoration-border-strong decoration-2 underline-offset-4 hover:decoration-primary"
            >
              {CONTACT.email}
            </a>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="whatsapp" size="block" className="flex-1" asChild>
          <a href={whatsappHref(waMessage)} target="_blank" rel="noopener noreferrer">
            <IconWhatsApp />
            Hablar con un asesor
          </a>
        </Button>
        <Button variant="outline" size="block" className="flex-1" asChild>
          <Link href="/productos">
            Seguir comprando <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main id="main-content" className="flex-1">
      <Suspense
        fallback={
          <div className="shell max-w-xl py-section">
            <div className="h-96 animate-pulse rounded-xl bg-surface-2" aria-hidden="true" />
            <p className="sr-only" role="status">Cargando la confirmación de tu pedido…</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </main>
  );
}
