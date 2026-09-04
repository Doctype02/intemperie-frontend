import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LegalPage, type LegalSection } from "@/components/shared/legal-page";
import { Button } from "@/components/ui/button";
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp";
import { CONTACT } from "@/components/layout/nav-data";
import { RefreshCw, AlertCircle, CheckCircle2, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de devoluciones",
  description: "Condiciones y proceso para devoluciones y cambios de productos Intemperie.",
};

/* Mensaje del CTA actual («Hola, quiero solicitar una devolución»), ahora por
 * whatsappHref: un solo sitio decide número y formato del enlace. */
const WA_DEVOLUCION = "Hola, quiero solicitar una devolución";

/* Los tres hechos de siempre; el arcoíris verde/azul/morado del legado se
 * sustituye por la celda neutra del sistema con icono en verde de acción. */
const KEY_FACTS = [
  { Icon: RefreshCw, title: "30 días", sub: "Para solicitar devolución" },
  { Icon: CheckCircle2, title: "Sin preguntas", sub: "Defectos de fabricación" },
  { Icon: Phone, title: "Asesoría directa", sub: "WhatsApp +507 6287-4042" },
] as const;

function KeyFacts() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {KEY_FACTS.map((item) => (
        <div key={item.title} className="rounded-xl border border-border bg-surface-2 p-4 text-center">
          <div className="mb-2 flex justify-center">
            <item.Icon className="size-6 text-brand-green" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-foreground">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}

const SECTIONS: LegalSection[] = [
  {
    id: "plazo",
    title: "1. Plazo para devoluciones",
    children: (
      <p>Aceptamos devoluciones dentro de los <strong>30 días calendario</strong> desde la fecha de entrega del producto, siempre que se cumplan las condiciones descritas en esta política.</p>
    ),
  },
  {
    id: "condiciones",
    title: "2. Condiciones para devolución",
    children: (
      <>
        <div className="rounded-xl border border-brand-green/35 bg-brand-green-soft p-4">
          <p className="mb-2 font-bold text-brand-green-deep">✓ Aceptamos devoluciones cuando:</p>
          <ul className="list-disc space-y-1 pl-5 text-brand-green-deep">
            <li>El producto presenta defectos de fabricación</li>
            <li>El producto recibido no corresponde al pedido</li>
            <li>El producto llegó dañado durante el transporte</li>
            <li>El producto no fue instalado y está en su empaque original</li>
          </ul>
        </div>
        <div className="rounded-xl border border-destructive/35 bg-destructive/8 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <p className="mb-2 font-bold text-destructive">✗ No aceptamos devoluciones cuando:</p>
              <ul className="list-disc space-y-1 pl-5 text-destructive">
                <li>El producto ya fue instalado (salvo defecto de fabricación)</li>
                <li>Han transcurrido más de 30 días desde la entrega</li>
                <li>El producto fue modificado o alterado</li>
                <li>El daño es consecuencia de mal uso o instalación incorrecta</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "proceso",
    title: "3. Proceso de devolución",
    children: (
      <ol className="list-decimal space-y-2 pl-5">
        <li>Contáctenos por WhatsApp (<a href={whatsappHref(WA_DEVOLUCION)}>{CONTACT.phoneDisplay}</a>) o email (<a href={CONTACT.emailHref}>{CONTACT.email}</a>) indicando el motivo de la devolución y su número de pedido.</li>
        <li>Envíe fotografías del producto y el defecto reportado.</li>
        <li>Nuestro equipo evaluará su solicitud en un máximo de 2 días hábiles.</li>
        <li>Si la devolución es aprobada, coordinaremos la recolección del producto o le daremos instrucciones para enviarlo.</li>
        <li>Una vez recibido e inspeccionado, procesaremos el reembolso o el cambio en un plazo de 5 días hábiles.</li>
      </ol>
    ),
  },
  {
    id: "reembolso",
    title: "4. Métodos de reembolso",
    children: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Reembolso al método de pago original (3–7 días hábiles según el banco)</li>
        <li>Crédito en cuenta de Intemperie para futuras compras</li>
        <li>Cambio por un producto equivalente o de mayor valor (abonando la diferencia)</li>
      </ul>
    ),
  },
  {
    id: "costos",
    title: "5. Costos de devolución",
    children: (
      <>
        <p>Los costos de transporte para la devolución son cubiertos por <strong>Intemperie</strong> cuando el motivo es un defecto de fabricación o error en el envío.</p>
        <p>Para devoluciones por cambio de opinión (producto sin defectos), el costo de envío de vuelta al almacén corre por cuenta del cliente.</p>
      </>
    ),
  },
];

export default function DevolucionesPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <LegalPage
          eyebrow="Garantía de compra"
          title="Política de Devoluciones"
          updated="Última actualización: mayo 2026"
          intro={<KeyFacts />}
          sections={SECTIONS}
          footer={
            <>
              <Button asChild variant="whatsapp">
                <a href={whatsappHref(WA_DEVOLUCION)} target="_blank" rel="noopener noreferrer">
                  <IconWhatsApp /> Iniciar devolución por WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/envios">Política de envíos</Link>
              </Button>
            </>
          }
        />
      </main>
      <Footer />
    </>
  );
}
