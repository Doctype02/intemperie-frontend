import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Truck, Clock, MapPin, Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de envíos",
  description: "Información sobre tiempos de entrega, cobertura geográfica y condiciones de envío de Intemperie Panamá.",
};

export default function EnviosPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 bg-white">
        <div className="bg-gray-950 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-3">Información de envío</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Política de Envíos</h1>
            <p className="mt-3 text-gray-400 text-sm">Última actualización: mayo 2026</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
          {/* Key facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              { Icon: Truck,   title: "Envío gratis",    sub: "En pedidos +$50" },
              { Icon: Clock,   title: "1–3 días hábiles", sub: "Ciudad de Panamá" },
              { Icon: MapPin,  title: "Todo Panamá",      sub: "6 provincias" },
              { Icon: Package, title: "Empaque seguro",   sub: "Garantizado" },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <item.Icon className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">1. Cobertura de envío</h2>
              <p>Intemperie realiza envíos a todo el territorio de la República de Panamá, incluyendo las provincias de Panamá, Panamá Oeste, Colón, Coclé, Herrera, Los Santos, Veraguas, Chiriquí, Bocas del Toro y las comarcas indígenas.</p>
              <p className="mt-2">Para pedidos en zonas de difícil acceso, el equipo de ventas coordinará una solución personalizada. Contáctenos por WhatsApp al <a href="https://wa.me/50762874042" className="text-green-700 font-semibold">+507 6287-4042</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">2. Costos de envío</h2>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-3">
                <p className="font-bold text-green-800">Envío GRATIS en pedidos mayores a $50.00</p>
              </div>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Ciudad de Panamá y área metropolitana: <strong>$8.00</strong> (pedidos menores a $50)</li>
                <li>Interior del país: <strong>$15.00 – $25.00</strong> según distancia y peso</li>
                <li>Productos de gran volumen (lotes de cerca, mallas): cotización especial</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">3. Tiempos de entrega</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Ciudad de Panamá y Panamá Oeste:</strong> 1 a 2 días hábiles</li>
                <li><strong>Provincias centrales (Coclé, Herrera, Los Santos, Veraguas):</strong> 2 a 4 días hábiles</li>
                <li><strong>Chiriquí, Bocas del Toro, Colón:</strong> 3 a 5 días hábiles</li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">Los tiempos se cuentan desde la confirmación y pago del pedido. No incluyen días no hábiles ni feriados nacionales.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">4. Proceso de entrega</h2>
              <p>Una vez confirmado el pago, recibirá una notificación con el número de seguimiento. Un asesor coordinará la entrega o retiro en nuestro almacén en La Chorrera, Panamá Oeste.</p>
              <p className="mt-2">Para pedidos mayores a 100m de cerca o lotes industriales, coordinamos transporte especializado sin costo adicional desde nuestras instalaciones.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">5. Retiro en almacén</h2>
              <p>También puede retirar su pedido en nuestra bodega:</p>
              <div className="bg-gray-50 rounded-xl p-4 mt-2">
                <p className="font-semibold text-gray-900">Intemperie S.A.</p>
                <p>La Chorrera, Panamá Oeste, Panamá</p>
                <p className="mt-1.5 text-green-700 font-medium">Horario: Lunes a Sábado, 8:00 am – 6:00 pm</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">6. Contacto</h2>
              <p>Para consultas sobre un envío en curso, contáctenos:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>WhatsApp: <a href="https://wa.me/50762874042" className="text-green-700 font-semibold">+507 6287-4042</a></li>
                <li>Email: <a href="mailto:ventas@intemperie.com" className="text-green-700 font-semibold">ventas@intemperie.com</a></li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link href="/productos" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-800 transition-colors">
              Ver productos
            </Link>
            <Link href="/devoluciones" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Política de devoluciones →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
