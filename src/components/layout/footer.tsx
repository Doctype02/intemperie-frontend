"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Globe, ExternalLink } from "lucide-react";

const paymentMethods = ["Visa", "Mastercard", "Yappy", "Clave"];

const footerLinks = {
  Productos: [
    { label: "Cercas PVC", href: "/categorias/residencial" },
    { label: "Mallas Electrosoldadas", href: "/categorias/industrial" },
    { label: "Todas las colecciones", href: "/productos" },
    { label: "Calculadora", href: "/calculadora" },
  ],
  Empresa: [
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ],
  Ayuda: [
    { label: "Mi cuenta", href: "/cuenta" },
    { label: "Mis pedidos", href: "/cuenta/pedidos" },
    { label: "Envíos", href: "/envios" },
    { label: "Cotizar", href: "/calculadora" },
  ],
};

const socialLinks = [
  { icon: Globe, href: "https://www.facebook.com/tiendasintemperiepanama/", label: "Facebook" },
  { icon: Globe, href: "https://www.instagram.com/tiendasintemperie/", label: "Instagram" },
  { icon: Globe, href: "https://www.youtube.com/@tiendasintemperie1886", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white font-bold text-lg">
                I
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">INTEMPERIE</p>
                <p className="text-xs text-gray-500">Seguridad y Elegancia Al Aire Libre</p>
              </div>
            </Link>
            <p className="mb-4 text-sm text-gray-400 max-w-sm">
              Especialistas en Cercas PVC y Mallas Electrosoldadas para todo tipo de cerramientos.
              Más de 15 años protegiendo hogares, industrias y proyectos en Panamá.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span>+507 6287-4042</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span>ventas@tiendasintemperie.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span>Panamá Oeste, La Chorrera, Barrio Colón</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-green-700 hover:text-white transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 font-semibold text-white text-sm uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} INTEMPERIE. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Pago seguro:</span>
            <div className="flex gap-2">
              {paymentMethods.map((m) => (
                <div
                  key={m}
                  className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-400"
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
