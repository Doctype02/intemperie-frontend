import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Intemperie recopila, usa y protege sus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 bg-white">
        <div className="bg-gray-950 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-3">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Política de Privacidad</h1>
            <p className="mt-3 text-gray-400 text-sm">Última actualización: mayo 2026</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">1. Responsable del tratamiento</h2>
              <p><strong>Intemperie S.A.</strong>, con domicilio en La Chorrera, Panamá Oeste, República de Panamá, es responsable del tratamiento de los datos personales recopilados a través de este sitio web.</p>
              <p className="mt-2">Contacto: <a href="mailto:ventas@intemperie.com" className="text-green-700 font-semibold">ventas@intemperie.com</a></p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">2. Datos que recopilamos</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Datos de contacto:</strong> nombre, correo electrónico, número de teléfono</li>
                <li><strong>Datos de cuenta:</strong> correo electrónico y contraseña cifrada (si crea una cuenta)</li>
                <li><strong>Datos de compra:</strong> dirección de entrega, método de pago (procesado por terceros seguros)</li>
                <li><strong>Datos de navegación:</strong> páginas visitadas, tiempo en sitio (datos anónimos agregados)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">3. Finalidad del tratamiento</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Procesar y gestionar sus pedidos de compra</li>
                <li>Comunicarnos con usted sobre su pedido o consultas</li>
                <li>Enviarle información sobre productos y promociones (solo con su consentimiento)</li>
                <li>Mejorar nuestro sitio web y servicios</li>
                <li>Cumplir con obligaciones legales y fiscales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">4. Base legal</h2>
              <p>El tratamiento de sus datos se realiza bajo las siguientes bases legales conforme a la Ley 81 de 2019 de Protección de Datos Personales de Panamá:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Ejecución de un contrato (procesamiento de compras)</li>
                <li>Consentimiento (comunicaciones de marketing)</li>
                <li>Obligación legal (retención de registros fiscales)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">5. Conservación de datos</h2>
              <p>Conservamos sus datos personales mientras mantenga una relación comercial con Intemperie y durante el período que exijan las obligaciones legales aplicables (mínimo 5 años para registros fiscales).</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">6. Sus derechos</h2>
              <p>De acuerdo con la legislación panameña vigente, usted tiene derecho a:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Acceder a sus datos personales</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Oponerse al tratamiento para fines de marketing</li>
                <li>Portar sus datos a otro proveedor</li>
              </ul>
              <p className="mt-2">Para ejercer estos derechos, escríbanos a <a href="mailto:ventas@intemperie.com" className="text-green-700 font-semibold">ventas@intemperie.com</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">7. Cookies</h2>
              <p>Este sitio utiliza cookies técnicas necesarias para su funcionamiento (carrito de compras, sesión de usuario). No utilizamos cookies de rastreo de terceros para publicidad.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">8. Seguridad</h2>
              <p>Implementamos medidas técnicas y organizativas para proteger sus datos: cifrado HTTPS, contraseñas encriptadas con bcrypt, y acceso restringido a la información personal.</p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <Link href="/terminos" className="inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors">
              Ver Términos y Condiciones →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
