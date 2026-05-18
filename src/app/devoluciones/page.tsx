import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RefreshCw, AlertCircle, CheckCircle2, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de devoluciones",
  description: "Condiciones y proceso para devoluciones y cambios de productos Intemperie.",
};

export default function DevolucionesPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 bg-white">
        <div className="bg-gray-950 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-3">Atención al cliente</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Política de Devoluciones</h1>
            <p className="mt-3 text-gray-400 text-sm">Última actualización: mayo 2026</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
          {/* Key highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              { Icon: RefreshCw,    title: "30 días",          sub: "Para solicitar devolución", color: "text-green-600 bg-green-50" },
              { Icon: CheckCircle2, title: "Sin preguntas",    sub: "Defectos de fabricación",    color: "text-blue-600 bg-blue-50" },
              { Icon: Phone,        title: "Asesoría directa", sub: "WhatsApp +507 6287-4042",    color: "text-purple-600 bg-purple-50" },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl p-5 ${item.color.split(" ")[1]} text-center`}>
                <div className="flex justify-center mb-2">
                  <item.Icon className={`h-6 w-6 ${item.color.split(" ")[0]}`} />
                </div>
                <p className={`text-base font-black ${item.color.split(" ")[0]}`}>{item.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">1. Plazo para devoluciones</h2>
              <p>Aceptamos devoluciones dentro de los <strong>30 días calendario</strong> desde la fecha de entrega del producto, siempre que se cumplan las condiciones descritas en esta política.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">2. Condiciones para devolución</h2>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="font-bold text-green-800 mb-2">✓ Aceptamos devoluciones cuando:</p>
                  <ul className="list-disc pl-5 space-y-1 text-green-800">
                    <li>El producto presenta defectos de fabricación</li>
                    <li>El producto recibido no corresponde al pedido</li>
                    <li>El producto llegó dañado durante el transporte</li>
                    <li>El producto no fue instalado y está en su empaque original</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-red-800 mb-2">✗ No aceptamos devoluciones cuando:</p>
                      <ul className="list-disc pl-5 space-y-1 text-red-800">
                        <li>El producto ya fue instalado (salvo defecto de fabricación)</li>
                        <li>Han transcurrido más de 30 días desde la entrega</li>
                        <li>El producto fue modificado o alterado</li>
                        <li>El daño es consecuencia de mal uso o instalación incorrecta</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">3. Proceso de devolución</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Contáctenos por WhatsApp (<a href="https://wa.me/50762874042" className="text-green-700 font-semibold">+507 6287-4042</a>) o email (<a href="mailto:ventas@intemperie.com" className="text-green-700 font-semibold">ventas@intemperie.com</a>) indicando el motivo de la devolución y su número de pedido.</li>
                <li>Envíe fotografías del producto y el defecto reportado.</li>
                <li>Nuestro equipo evaluará su solicitud en un máximo de 2 días hábiles.</li>
                <li>Si la devolución es aprobada, coordinaremos la recolección del producto o le daremos instrucciones para enviarlo.</li>
                <li>Una vez recibido e inspeccionado, procesaremos el reembolso o el cambio en un plazo de 5 días hábiles.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">4. Métodos de reembolso</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Reembolso al método de pago original (3–7 días hábiles según el banco)</li>
                <li>Crédito en cuenta de Intemperie para futuras compras</li>
                <li>Cambio por un producto equivalente o de mayor valor (abonando la diferencia)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">5. Costos de devolución</h2>
              <p>Los costos de transporte para la devolución son cubiertos por <strong>Intemperie</strong> cuando el motivo es un defecto de fabricación o error en el envío.</p>
              <p className="mt-2">Para devoluciones por cambio de opinión (producto sin defectos), el costo de envío de vuelta al almacén corre por cuenta del cliente.</p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/50762874042?text=Hola%2C%20quiero%20solicitar%20una%20devoluci%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-800 transition-colors"
            >
              Iniciar devolución por WhatsApp
            </a>
            <Link href="/envios" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Política de envíos
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
