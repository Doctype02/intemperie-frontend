import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LegalPage, type LegalSection } from "@/components/shared/legal-page";
import { CONTACT } from "@/components/layout/nav-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Intemperie recopila, usa y protege sus datos personales.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    title: "1. Responsable del tratamiento",
    children: (
      <>
        <p><strong>Intemperie S.A.</strong>, con domicilio en La Chorrera, Panamá Oeste, República de Panamá, es responsable del tratamiento de los datos personales recopilados a través de este sitio web.</p>
        <p>Contacto: <a href={CONTACT.emailHref}>{CONTACT.email}</a></p>
      </>
    ),
  },
  {
    id: "datos",
    title: "2. Datos que recopilamos",
    children: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li><strong>Datos de contacto:</strong> nombre, correo electrónico, número de teléfono</li>
        <li><strong>Datos de cuenta:</strong> correo electrónico y contraseña cifrada (si crea una cuenta)</li>
        <li><strong>Datos de compra:</strong> dirección de entrega, método de pago (procesado por terceros seguros)</li>
        <li><strong>Datos de navegación:</strong> páginas visitadas, tiempo en sitio (datos anónimos agregados)</li>
      </ul>
    ),
  },
  {
    id: "finalidad",
    title: "3. Finalidad del tratamiento",
    children: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Procesar y gestionar sus pedidos de compra</li>
        <li>Comunicarnos con usted sobre su pedido o consultas</li>
        <li>Enviarle información sobre productos y promociones (solo con su consentimiento)</li>
        <li>Mejorar nuestro sitio web y servicios</li>
        <li>Cumplir con obligaciones legales y fiscales</li>
      </ul>
    ),
  },
  {
    id: "base-legal",
    title: "4. Base legal",
    children: (
      <>
        <p>El tratamiento de sus datos se realiza bajo las siguientes bases legales conforme a la Ley 81 de 2019 de Protección de Datos Personales de Panamá:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Ejecución de un contrato (procesamiento de compras)</li>
          <li>Consentimiento (comunicaciones de marketing)</li>
          <li>Obligación legal (retención de registros fiscales)</li>
        </ul>
      </>
    ),
  },
  {
    id: "conservacion",
    title: "5. Conservación de datos",
    children: (
      <p>Conservamos sus datos personales mientras mantenga una relación comercial con Intemperie y durante el período que exijan las obligaciones legales aplicables (mínimo 5 años para registros fiscales).</p>
    ),
  },
  {
    id: "derechos",
    title: "6. Sus derechos",
    children: (
      <>
        <p>De acuerdo con la legislación panameña vigente, usted tiene derecho a:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Acceder a sus datos personales</li>
          <li>Rectificar datos inexactos</li>
          <li>Solicitar la eliminación de sus datos</li>
          <li>Oponerse al tratamiento para fines de marketing</li>
          <li>Portar sus datos a otro proveedor</li>
        </ul>
        <p>Para ejercer estos derechos, escríbanos a <a href={CONTACT.emailHref}>{CONTACT.email}</a>.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "7. Cookies",
    children: (
      <p>Este sitio utiliza cookies técnicas necesarias para su funcionamiento (carrito de compras, sesión de usuario). No utilizamos cookies de rastreo de terceros para publicidad.</p>
    ),
  },
  {
    id: "seguridad",
    title: "8. Seguridad",
    children: (
      <p>Implementamos medidas técnicas y organizativas para proteger sus datos: cifrado HTTPS, contraseñas encriptadas con bcrypt, y acceso restringido a la información personal.</p>
    ),
  },
];

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <LegalPage
          eyebrow="Tus datos"
          title="Política de Privacidad"
          updated="Última actualización: mayo 2026"
          sections={SECTIONS}
          footer={
            <Link
              href="/terminos"
              className="inline-flex min-h-tap items-center gap-2 text-sm font-bold text-brand-green-deep transition-colors hover:text-brand-green"
            >
              Ver Términos y Condiciones →
            </Link>
          }
        />
      </main>
      <Footer />
    </>
  );
}
