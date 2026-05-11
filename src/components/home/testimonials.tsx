import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Gilberto Diaz",
    rating: 5,
    text: "Excelente calidad de materiales. Las cercas de PVC se ven increíbles y no he tenido que hacerles nada en 2 años.",
    date: "Marzo 2025",
  },
  {
    name: "Alejandro Zurita",
    rating: 5,
    text: "Soluciones en cercas de PVC con excelente control de calidad, buena atención y asesoría personalizada.",
    date: "Octubre 2024",
  },
  {
    name: "Alberto Barrios",
    rating: 5,
    text: "Excelente servicio y calidad de producto. Personal altamente profesional. 100% fiable.",
    date: "Marzo 2024",
  },
  {
    name: "Roberth Castillo",
    rating: 5,
    text: "Especialistas en cercas de PVC. La instalación fue rápida y el resultado superó nuestras expectativas.",
    date: "Marzo 2024",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Nuestros clientes confían en nosotros</h2>
          <div className="mt-3 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-500">4.8 · 17 reseñas en Google</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-gray-200 p-6 hover:border-green-200 transition-colors">
              <div className="mb-3 flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 border-t pt-3">
                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
