import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LegalPage, type LegalSection } from "@/components/shared/legal-page";
import { Button } from "@/components/ui/button";
import { whatsappHref } from "@/components/ui/icon-whatsapp";
import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data";
import { Truck, Clock, MapPin, Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de envíos",
  description: "Información sobre tiempos de entrega, cobertura geográfica y condiciones de envío de Intemperie Panamá.",
};

/* Los cuatro hechos de siempre, ahora con tokens. La cifra manda, el icono acompaña. */
const KEY_FACTS = [
  { Icon: Truck, title: "Envío gratis", sub: "En pedidos +$50" },
  { Icon: Clock, title: "1–3 días hábiles", sub: "Ciudad de Panamá" },
  /* TODO contenido: revisar «6 provincias» vs cobertura real — decisión del dueño */
  { Icon: MapPin, title: "Todo Panamá", sub: "6 provincias" },
  { Icon: Package, title: "Empaque seguro", sub: "Garantizado" },
] as const;

function KeyFacts() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
    id: "cobertura",
    title: "1. Cobertura de envío",
    children: (
      <>
        <p>Intemperie realiza envíos a todo el territorio de la República de Panamá, incluyendo las provincias de Panamá, Panamá Oeste, Colón, Coclé, Herrera, Los Santos, Veraguas, Chiriquí, Bocas del Toro y las comarcas indígenas.</p>
        <p>Para pedidos en zonas de difícil acceso, el equipo de ventas coordinará una solución personalizada. Contáctenos por WhatsApp al <a href={whatsappHref(WA_MESSAGE.general)}>{CONTACT.phoneDisplay}</a>.</p>
      </>
    ),
  },
  {
    id: "costos",
    title: "2. Costos de envío",
    children: (
      <>
        <div className="rounded-xl border border-brand-green/35 bg-brand-green-soft p-4">
          <p className="font-bold text-brand-green-deep">Envío GRATIS en pedidos mayores a $50.00</p>
        </div>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Ciudad de Panamá y área metropolitana: <strong>$8.00</strong> (pedidos menores a $50)</li>
          <li>Interior del país: <strong>$15.00 – $25.00</strong> según distancia y peso</li>
          <li>Productos de gran volumen (lotes de cerca, mallas): cotización especial</li>
        </ul>
      </>
    ),
  },
  {
    id: "tiempos",
    title: "3. Tiempos de entrega",
    children: (
      <>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Ciudad de Panamá y Panamá Oeste:</strong> 1 a 2 días hábiles</li>
          <li><strong>Provincias centrales (Coclé, Herrera, Los Santos, Veraguas):</strong> 2 a 4 días hábiles</li>
          <li><strong>Chiriquí, Bocas del Toro, Colón:</strong> 3 a 5 días hábiles</li>
        </ul>
        <p className="text-xs">Los tiempos se cuentan desde la confirmación y pago del pedido. No incluyen días no hábiles ni feriados nacionales.</p>
      </>
    ),
  },
  {
    id: "proceso",
    title: "4. Proceso de entrega",
    children: (
      <>
        <p>Una vez confirmado el pago, recibirá una notificación con el número de seguimiento. Un asesor coordinará la entrega o retiro en nuestro almacén en La Chorrera, Panamá Oeste.</p>
        <p>Para pedidos mayores a 100m de cerca o lotes industriales, coordinamos transporte especializado sin costo adicional desde nuestras instalaciones.</p>
      </>
    ),
  },
  {
    id: "retiro",
    title: "5. Retiro en almacén",
    children: (
      <>
        <p>También puede retirar su pedido en nuestra bodega:</p>
        <div className="rounded-xl bg-surface-2 p-4">
          <p className="font-semibold text-foreground">Intemperie S.A.</p>
          <p>La Chorrera, Panamá Oeste, Panamá</p>
          <p className="mt-1.5 font-medium text-brand-green-deep">Horario: Lunes a Sábado, 8:00 am – 6:00 pm</p>
        </div>
      </>
    ),
  },
  {
    id: "contacto",
    title: "6. Contacto",
    children: (
      <>
        <p>Para consultas sobre un envío en curso, contáctenos:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>WhatsApp: <a href={whatsappHref(WA_MESSAGE.general)}>{CONTACT.phoneDisplay}</a></li>
          <li>Email: <a href={CONTACT.emailHref}>{CONTACT.email}</a></li>
        </ul>
      </>
    ),
  },
];

export default function EnviosPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <LegalPage
          eyebrow="Información de envío"
          title="Política de Envíos"
          updated="Última actualización: mayo 2026"
          intro={<KeyFacts />}
          sections={SECTIONS}
          footer={
            <>
              <Button asChild>
                <Link href="/productos">Ver productos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/devoluciones">Política de devoluciones →</Link>
              </Button>
            </>
          }
        />
      </main>
      <Footer />
    </>
  );
}
