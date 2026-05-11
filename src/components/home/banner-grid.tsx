import Link from "next/link";

const banners = [
  { title: "Cercas PVC", subtitle: "Desde $18.50 el metro", href: "/categorias/residencial", bg: "bg-green-700", icon: "🏡" },
  { title: "Malla Electrosoldada", subtitle: "Desde $8.50 el metro", href: "/categorias/industrial", bg: "bg-gray-800", icon: "🏭" },
  { title: "Calcula tu proyecto", subtitle: "Precio estimado al instante", href: "/calculadora", bg: "bg-amber-600", icon: "🧮" },
  { title: "Cotiza por WhatsApp", subtitle: "Respuesta inmediata", href: "https://wa.me/50762874042", bg: "bg-blue-700", icon: "💬" },
];

export function BannerGrid() {
  return (
    <section className="bg-gray-50 py-5">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {banners.map((b, i) => (
            <Link
              key={i}
              href={b.href}
              target={b.href.startsWith("http") ? "_blank" : undefined}
              className={`${b.bg} rounded-lg p-4 text-white hover:opacity-90 transition-opacity`}
            >
              <span className="text-2xl">{b.icon}</span>
              <h3 className="mt-2 text-sm font-bold md:text-base">{b.title}</h3>
              <p className="mt-0.5 text-[11px] md:text-xs opacity-80">{b.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
