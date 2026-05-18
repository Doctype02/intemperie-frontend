import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso del sitio web y de compra de productos Intemperie.",
};

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 bg-white">
        <div className="bg-gray-950 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-3">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Términos y Condiciones</h1>
            <p className="mt-3 text-gray-400 text-sm">Última actualización: mayo 2026</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">1. Aceptación</h2>
              <p>Al acceder y usar el sitio web de Intemperie (intemperie.com.pa) y realizar compras, usted acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo, le pedimos no utilizar nuestros servicios.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">2. Productos y precios</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Los precios están expresados en dólares americanos (USD) e incluyen ITBMS (7%) salvo indicación contraria.</li>
                <li>Nos reservamos el derecho de modificar precios sin previo aviso. El precio válido es el vigente al momento de confirmar el pedido.</li>
                <li>Las imágenes de productos son referenciales. Los colores reales pueden variar según la pantalla del usuario.</li>
                <li>El stock mostrado en el sitio es una estimación y puede variar. En caso de no disponibilidad, le contactaremos de inmediato.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">3. Proceso de compra</h2>
              <p>La compra se formaliza cuando usted completa el proceso de pago y recibe una confirmación por correo electrónico. Nos reservamos el derecho de rechazar pedidos en casos de error en el precio o disponibilidad.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">4. Garantías</h2>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-3">
                <p className="font-bold text-green-800">Garantía de 15 años en todos los productos de cerca PVC Intemperie</p>
              </div>
              <p>La garantía cubre defectos de fabricación, decoloración prematura y deformación estructural bajo uso normal. No cubre daños causados por instalación incorrecta, accidentes, uso inadecuado o fuerza mayor.</p>
              <p className="mt-2">Para hacer efectiva la garantía, presente su comprobante de compra y fotografías del defecto a <a href="mailto:ventas@intemperie.com" className="text-green-700 font-semibold">ventas@intemperie.com</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">5. Propiedad intelectual</h2>
              <p>Todo el contenido de este sitio (imágenes, textos, logotipos, diseños) es propiedad de Intemperie S.A. o sus licenciantes. Se prohíbe su reproducción sin autorización escrita.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">6. Limitación de responsabilidad</h2>
              <p>Intemperie no será responsable de daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o de este sitio web, en la medida permitida por la ley panameña.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">7. Ley aplicable</h2>
              <p>Estos términos se rigen por las leyes de la República de Panamá. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de Panamá.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">8. Contacto</h2>
              <p>Para cualquier consulta sobre estos términos:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Email: <a href="mailto:ventas@intemperie.com" className="text-green-700 font-semibold">ventas@intemperie.com</a></li>
                <li>WhatsApp: <a href="https://wa.me/50762874042" className="text-green-700 font-semibold">+507 6287-4042</a></li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link href="/privacidad" className="inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors">
              ← Política de privacidad
            </Link>
            <Link href="/devoluciones" className="inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors sm:ml-auto">
              Política de devoluciones →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
