import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Package, Truck, CreditCard, MessageCircle } from "lucide-react";

/* ── Benefits bar (above footer, like carbonestore) ─────────────────────── */
function BenefitsBar() {
  const items = [
    { icon: Package,       title: "Garantía 15 años",     desc: "En todos los productos PVC" },
    { icon: Truck,         title: "Envío gratis desde $50", desc: "A todo Panamá y provincias" },
    { icon: CreditCard,    title: "Pago seguro",           desc: "Visa, Mastercard, Yappy, Clave" },
    { icon: MessageCircle, title: "Asesoría por WhatsApp", desc: "Respuesta en minutos" },
  ];
  return (
    <div className="bg-gray-100 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-gray-200 lg:divide-y-0 lg:divide-x divide-x-0">
          {items.map((item) => (
            <div key={item.title} className="flex items-center gap-3 px-4 sm:px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <item.icon className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
const columns = [
  {
    title: "Productos",
    links: [
      { label: "Cercas PVC",            href: "/productos?category=residencial" },
      { label: "Mallas Electrosoldadas", href: "/productos?category=industrial" },
      { label: "Zonas Costeras",         href: "/productos?category=zonas-costeras" },
      { label: "Uso Agropecuario",       href: "/productos?category=agropecuario" },
      { label: "Catálogo completo",      href: "/productos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Quiénes somos",   href: "/nosotros" },
      { label: "Nuestros proyectos", href: "/nosotros#proyectos" },
      { label: "Calculadora",     href: "/calculadora" },
      { label: "Cotizar",         href: "/nosotros#cotizaciones" },
      { label: "Blog",            href: "/nosotros" },
    ],
  },
  {
    title: "Clientes",
    links: [
      { label: "Mi cuenta",         href: "/cuenta" },
      { label: "Mis pedidos",       href: "/cuenta/pedidos" },
      { label: "Mis direcciones",   href: "/cuenta/direcciones" },
      { label: "Carrito",           href: "/carrito" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "WhatsApp +507 6287-4042",         href: "https://wa.me/50762874042" },
      { label: "ventas@intemperie.com",            href: "mailto:ventas@intemperie.com" },
      { label: "Política de envíos",              href: "#" },
      { label: "Garantías y devoluciones",        href: "#" },
      { label: "Instaladores recomendados",       href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <>
      <BenefitsBar />

      <footer className="bg-gray-900 text-gray-400">
        {/* Main footer grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white font-black text-lg">
                  I
                </div>
                <div>
                  <p className="text-base font-black text-white leading-tight">INTEMPERIE</p>
                  <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase leading-none">
                    Cercas PVC &amp; Mallas
                  </p>
                </div>
              </Link>

              <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-xs">
                Líderes en Panamá en cercas de PVC y malla electrosoldada. Más de 15 años
                protegiendo hogares, industrias y proyectos en todo el país.
              </p>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-green-500 shrink-0" />
                  <a href="tel:+50762874042" className="hover:text-green-400 transition-colors">+507 6287-4042</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-green-500 shrink-0" />
                  <a href="mailto:ventas@intemperie.com" className="hover:text-green-400 transition-colors">
                    ventas@intemperie.com
                  </a>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>La Chorrera, Panamá Oeste, Panamá</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2.5">
                {[
                  { href: "https://facebook.com",  icon: Facebook,  label: "Facebook" },
                  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
                  { href: "https://youtube.com",   icon: Youtube,   label: "YouTube" },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-500 hover:bg-green-700 hover:text-white transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-gray-300">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-500 hover:text-green-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter row */}
          <div className="mt-10 border-t border-gray-800 pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-extrabold text-gray-300">¡No te pierdas ninguna novedad!</p>
                <p className="text-xs text-gray-500 mt-0.5">Suscríbete para recibir precios especiales y nuevos modelos</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 sm:w-60 h-9 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                />
                <button className="h-9 px-4 rounded-lg bg-green-600 text-xs font-bold text-white hover:bg-green-500 transition-colors whitespace-nowrap">
                  Suscribirse
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-600 order-2 sm:order-1">
              &copy; {new Date().getFullYear()} INTEMPERIE. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <span className="text-[10px] text-gray-600">Métodos de pago:</span>
              {["Visa", "Mastercard", "Yappy", "Clave"].map((m) => (
                <span
                  key={m}
                  className="rounded border border-gray-700 px-2 py-0.5 text-[10px] font-semibold text-gray-500"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
