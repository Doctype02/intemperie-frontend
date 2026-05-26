import { Suspense } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Package, Truck, CreditCard, MessageCircle } from "lucide-react";
import { FooterNewsletter } from "./footer-newsletter";

/* ── Inline SVG social icons ─────────────────────────────────────────────── */
function IconFacebook() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

/* ── Benefits bar ─────────────────────────────────────────────────────────── */
const benefitItems = [
  {
    Icon: Package,
    title: "Garantía 15 años",
    desc: "En todos los productos PVC",
  },
  {
    Icon: Truck,
    title: "Envío gratis desde $50",
    desc: "A todo Panamá y provincias",
  },
  {
    Icon: CreditCard,
    title: "Pago seguro",
    desc: "Visa, Mastercard, Yappy, Clave",
  },
  {
    Icon: MessageCircle,
    title: "Asesoría por WhatsApp",
    desc: "Respuesta en minutos",
  },
];

function BenefitsBar() {
  return (
    <div className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-gray-100 lg:divide-y-0 lg:divide-x divide-x-0">
          {benefitItems.map((item) => (
            <div key={item.title} className="flex items-center gap-3 px-4 sm:px-6 py-5 sm:py-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
                <item.Icon className="h-5 w-5 text-green-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900 leading-tight">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Footer link columns data ─────────────────────────────────────────────── */
const colIntemperie = [
  { label: "Contacto",                href: "https://wa.me/50762874042" },
  { label: "Quiénes somos",           href: "/nosotros" },
  { label: "Política de envíos",      href: "/envios" },
  { label: "Política de devoluciones",href: "/devoluciones" },
  { label: "Política de privacidad",  href: "/privacidad" },
  { label: "Términos y condiciones",  href: "/terminos" },
  { label: "Trabaja con nosotros",    href: "mailto:ventas@intemperie.com?subject=Quiero%20trabajar%20con%20Intemperie" },
];
const colClientes = [
  { label: "Mi cuenta",                 href: "/cuenta" },
  { label: "Mis pedidos",               href: "/cuenta/pedidos" },
  { label: "Instaladores recomendados", href: "/instaladores" },
  { label: "Ventas mayoristas",         href: "https://wa.me/50762874042?text=Hola%2C%20me%20interesan%20precios%20mayoristas" },
  { label: "Atención al cliente",       href: "https://wa.me/50762874042" },
];
const colProductos = [
  { label: "Cercas PVC",             href: "/productos" },
  { label: "Mallas Electrosoldadas", href: "/productos?category=industrial" },
  { label: "Cercas Residenciales",   href: "/productos?category=residencial" },
  { label: "Cercas Industriales",    href: "/productos?category=industrial" },
  { label: "Zonas Costeras",         href: "/productos?category=zonas-costeras" },
  { label: "Catálogo completo",      href: "/productos" },
  { label: "Calculadora",            href: "/calculadora" },
];
const colAyuda = [
  { label: "WhatsApp +507 6287-4042",  href: "https://wa.me/50762874042" },
  { label: "ventas@intemperie.com",    href: "mailto:ventas@intemperie.com" },
  { label: "Instalación profesional",  href: "/instaladores" },
  { label: "Garantía de productos",    href: "/terminos" },
  { label: "Cotizar proyecto",         href: "/calculadora" },
];

const footerColumns = [
  { title: "Intemperie", links: colIntemperie },
  { title: "Clientes",   links: colClientes },
  { title: "Productos",  links: colProductos },
  { title: "Ayuda",      links: colAyuda },
];

/* ── Footer ──────────────────────────────────────────────────────────────── */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <BenefitsBar />

      <footer className="bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-8">

          {/* Main grid: brand col (2 wide) + 4 link columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">

            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex items-center mb-5">
                <span className="text-[20px] font-black tracking-[-0.04em] text-white leading-none select-none">
                  INTEM<span className="text-green-500">PERIE</span>
                </span>
              </Link>

              <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
                Líderes en Panamá en cercas de PVC y malla electrosoldada. Más de 15 años
                protegiendo hogares, industrias y proyectos en todo el país.
              </p>

              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-green-500 shrink-0" aria-hidden="true" />
                  <a href="tel:+50762874042" className="hover:text-green-400 transition-colors">
                    +507 6287-4042
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-green-500 shrink-0" aria-hidden="true" />
                  <a href="mailto:ventas@intemperie.com" className="hover:text-green-400 transition-colors">
                    ventas@intemperie.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>La Chorrera, Panamá Oeste, Panamá</span>
                </li>
              </ul>

              {/* Social icons — links disabled until real URLs are confirmed */}
              <div className="mt-6 flex gap-2.5">
                {[
                  { Icon: IconFacebook,  label: "Facebook" },
                  { Icon: IconInstagram, label: "Instagram" },
                  { Icon: IconYoutube,   label: "YouTube" },
                ].map(({ Icon, label }) => (
                  <span
                    key={label}
                    aria-label={label}
                    title={`${label} (próximamente)`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-600 cursor-default"
                  >
                    <Icon />
                  </span>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-gray-300">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("http") || link.href.startsWith("mailto") ? (
                        <a
                          href={link.href}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-sm text-gray-500 hover:text-green-400 transition-colors leading-relaxed"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-gray-500 hover:text-green-400 transition-colors leading-relaxed"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter row */}
          <Suspense fallback={<div className="border-t border-gray-800 pt-8 mt-10 h-24" />}>
            <FooterNewsletter />
          </Suspense>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-600 order-2 sm:order-1">
              &copy; {year} INTEMPERIE. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap items-center gap-2 order-1 sm:order-2">
              <span className="text-[10px] text-gray-600 mr-1">Métodos de pago:</span>
              {["Visa", "Mastercard", "Yappy", "Clave"].map((method) => (
                <span
                  key={method}
                  className="rounded border border-gray-700 bg-gray-800 px-2.5 py-1 text-[10px] font-semibold text-gray-400"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
