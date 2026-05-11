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

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-green-600 text-white font-extrabold text-base">I</div>
              <div>
                <p className="text-lg font-extrabold text-white leading-none">INTEMPERIE</p>
                <p className="text-[10px] text-gray-500">SEGURIDAD Y ELEGANCIA</p>
              </div>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs mb-5">Cercas PVC y mallas electrosoldadas. Más de 15 años protegiendo hogares, industrias y proyectos en Panamá.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-green-500" />+507 6287-4042</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-green-500" />ventas@tiendasintemperie.com</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-green-500" />Panamá Oeste, La Chorrera</div>
            </div>
            <div className="mt-4 flex gap-2">
              {["Facebook", "Instagram", "YouTube"].map((s) => (
                <a key={s} href="#" className="flex h-8 w-8 items-center justify-center rounded bg-gray-800 text-gray-500 hover:bg-green-700 hover:text-white transition-colors"><Globe className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-300">{title}</h3>
              <ul className="space-y-2">{links.map((link) => (
                <li key={link.label}><Link href={link.href} className="text-sm text-gray-500 hover:text-green-400 transition-colors">{link.label}</Link></li>
              ))}</ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-6 md:flex-row">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} INTEMPERIE. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600">Pago seguro:</span>
            {["Visa","Mastercard","Yappy","Clave"].map(m => <span key={m} className="rounded border border-gray-800 px-2 py-0.5 text-[10px] text-gray-500">{m}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
