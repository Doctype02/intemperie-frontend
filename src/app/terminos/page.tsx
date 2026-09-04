import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LegalPage, type LegalSection } from "@/components/shared/legal-page";
import { whatsappHref } from "@/components/ui/icon-whatsapp";
import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso del sitio web y de compra de productos Intemperie.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "aceptacion",
    title: "1. Aceptación",
    children: (
      <p>Al acceder y usar el sitio web de Intemperie (intemperie.com.pa) y realizar compras, usted acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo, le pedimos no utilizar nuestros servicios.</p>
    ),
  },
  {
    id: "productos-precios",
    title: "2. Productos y precios",
    children: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Los precios están expresados en dólares americanos (USD) e incluyen ITBMS (7%) salvo indicación contraria.</li>
        <li>Nos reservamos el derecho de modificar precios sin previo aviso. El precio válido es el vigente al momento de confirmar el pedido.</li>
        <li>Las imágenes de productos son referenciales. Los colores reales pueden variar según la pantalla del usuario.</li>
        <li>El stock mostrado en el sitio es una estimación y puede variar. En caso de no disponibilidad, le contactaremos de inmediato.</li>
      </ul>
    ),
  },
  {
    id: "compra",
    title: "3. Proceso de compra",
    children: (
      <p>La compra se formaliza cuando usted completa el proceso de pago y recibe una confirmación por correo electrónico. Nos reservamos el derecho de rechazar pedidos en casos de error en el precio o disponibilidad.</p>
    ),
  },
  {
    id: "garantias",
    title: "4. Garantías",
    children: (
      <>
        <div className="rounded-xl border border-brand-green/35 bg-brand-green-soft p-4">
          <p className="font-bold text-brand-green-deep">Garantía de 15 años en todos los productos de cerca PVC Intemperie</p>
        </div>
        <p>La garantía cubre defectos de fabricación, decoloración prematura y deformación estructural bajo uso normal. No cubre daños causados por instalación incorrecta, accidentes, uso inadecuado o fuerza mayor.</p>
        <p>Para hacer efectiva la garantía, presente su comprobante de compra y fotografías del defecto a <a href={CONTACT.emailHref}>{CONTACT.email}</a>.</p>
      </>
    ),
  },
  {
    id: "propiedad",
    title: "5. Propiedad intelectual",
    children: (
      <p>Todo el contenido de este sitio (imágenes, textos, logotipos, diseños) es propiedad de Intemperie S.A. o sus licenciantes. Se prohíbe su reproducción sin autorización escrita.</p>
    ),
  },
  {
    id: "responsabilidad",
    title: "6. Limitación de responsabilidad",
    children: (
      <p>Intemperie no será responsable de daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o de este sitio web, en la medida permitida por la ley panameña.</p>
    ),
  },
  {
    id: "ley",
    title: "7. Ley aplicable",
    children: (
      <p>Estos términos se rigen por las leyes de la República de Panamá. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de Panamá.</p>
    ),
  },
  {
    id: "contacto",
    title: "8. Contacto",
    children: (
      <>
        <p>Para cualquier consulta sobre estos términos:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Email: <a href={CONTACT.emailHref}>{CONTACT.email}</a></li>
          <li>WhatsApp: <a href={whatsappHref(WA_MESSAGE.general)}>{CONTACT.phoneDisplay}</a></li>
        </ul>
      </>
    ),
  },
];

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <LegalPage
          eyebrow="Condiciones de uso"
          title="Términos y Condiciones"
          updated="Última actualización: mayo 2026"
          sections={SECTIONS}
          footer={
            <>
              <Link
                href="/privacidad"
                className="inline-flex min-h-tap items-center gap-2 text-sm font-bold text-brand-green-deep transition-colors hover:text-brand-green"
              >
                ← Política de privacidad
              </Link>
              <Link
                href="/devoluciones"
                className="inline-flex min-h-tap items-center gap-2 text-sm font-bold text-brand-green-deep transition-colors hover:text-brand-green sm:ml-auto"
              >
                Política de devoluciones →
              </Link>
            </>
          }
        />
      </main>
      <Footer />
    </>
  );
}
