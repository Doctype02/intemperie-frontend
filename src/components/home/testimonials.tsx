import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "María Rodríguez",
    location: "Panamá Oeste",
    rating: 5,
    text: "Excelente servicio. Instalaron la cerca de PVC en mi casa en solo 3 días. Quedó hermosa y ha resistido muy bien la lluvia.",
  },
  {
    name: "Carlos Mendoza",
    location: "Ciudad de Panamá",
    rating: 5,
    text: "Contraté la malla electrosoldada para mi bodega. Precio justo y trabajo garantizado. Los recomiendo ampliamente.",
  },
  {
    name: "Ana Lucía Pérez",
    location: "Chorrera",
    rating: 5,
    text: "Pensé que sería mucho más caro. La calculadora en línea me ayudó a planificar el presupuesto y el resultado superó mis expectativas.",
  },
  {
    name: "Roberto Castillo",
    location: "Colón",
    rating: 4,
    text: "Muy profesionales desde la cotización hasta la instalación. Mi finca quedó perfectamente cercada con material de primera calidad.",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            La satisfacción de nuestros clientes es nuestra mejor garantía.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-5 space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${
                        j < t.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
