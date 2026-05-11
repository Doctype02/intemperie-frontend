import Link from "next/link";
import { Calculator, Truck, Shield, Phone } from "lucide-react";

const banners = [
  {
    title: "Cercas PVC",
    subtitle: "Desde $18.50/m",
    href: "/categorias/residencial",
    color: "from-green-600 to-green-700",
    textColor: "text-white",
    subColor: "text-green-100",
    size: "",
  },
  {
    title: "Mallas Electrosoldadas",
    subtitle: "Desde $8.50/m",
    href: "/categorias/industrial",
    color: "from-gray-700 to-gray-800",
    textColor: "text-white",
    subColor: "text-gray-300",
    size: "",
  },
  {
    title: "Calcula tu proyecto",
    subtitle: "Precio estimado al instante",
    href: "/calculadora",
    icon: Calculator,
    color: "from-orange-500 to-orange-600",
    textColor: "text-white",
    subColor: "text-orange-100",
    size: "",
  },
  {
    title: "Envíos a todo Panamá",
    subtitle: "Contacta por WhatsApp",
    href: "https://wa.me/50762874042",
    icon: Phone,
    color: "from-blue-600 to-blue-700",
    textColor: "text-white",
    subColor: "text-blue-100",
    size: "",
  },
];

export function BannerGrid() {
  return (
    <section className="bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {banners.map((banner) => (
            <Link
              key={banner.title}
              href={banner.href}
              target={banner.href.startsWith("http") ? "_blank" : undefined}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${banner.color} ${banner.size} p-3 md:p-5 transition-transform hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="relative z-10">
                <h3 className={`font-bold text-sm md:text-lg ${banner.textColor}`}>
                  {banner.title}
                </h3>
                <p className={`mt-1 text-xs md:text-sm ${banner.subColor}`}>
                  {banner.subtitle}
                </p>
              </div>
              {banner.icon && (
                <banner.icon className="absolute -bottom-4 -right-4 h-24 w-24 opacity-20 text-white" />
              )}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
