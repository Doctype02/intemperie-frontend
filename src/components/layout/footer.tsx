"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Globe } from "lucide-react";

const footerLinks = {
  Productos: [
    { label: "Cercas PVC", href: "/categorias/residencial" },
    { label: "Mallas Electrosoldadas", href: "/categorias/industrial" },
    { label: "Catálogo completo", href: "/productos" },
    { label: "Calculadora", href: "/calculadora" },
  ],
  Empresa: [
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
    { label: "FAQ", href: "/faq" },
  ],
  Ayuda: [
    { label: "Mi cuenta", href: "/cuenta" },
    { label: "Mis pedidos", href: "/cuenta/pedidos" },
    { label: "Cotizar", href: "/calculadora" },
  ],
};

const socials = [
  { label: "Facebook", href: "https://www.facebook.com/tiendasintemperiepanama/" },
  { label: "Instagram", href: "https://www.instagram.com/tiendasintemperie/" },
  { label: "YouTube", href: "https://www.youtube.com/@tiendasintemperie1886" },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white font-extrabold text-lg">I</div>
              <div>
                <p className="text-lg font-extrabold text-white leading-tight">INTEMPERIE</p>
                <p className="text-[10px] text-gray-500 tracking-wider">SEGURIDAD Y ELEGANCIA AL AIRE LIBRE</p>
              </div>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
              Especialistas en cercas PVC y mallas electrosoldadas. Más de 15 años protegiendo hogares, industrias y proyectos en Panamá.
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-green-500" />+507 6287-4042</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-green-500" />ventas@tiendasintemperie.com</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-green-500" />Panamá Oeste, La Chorrera</div>
            </div>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-500 hover:bg-green-700 hover:text-white transition-all duration-200">
                  <Globe className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-300">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-green-400 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} INTEMPERIE. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Pago seguro:</span>
            {["Visa", "Mastercard", "Yappy", "Clave"].map((m) => (
              <span key={m} className="rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1 text-[10px] font-medium text-gray-500">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
