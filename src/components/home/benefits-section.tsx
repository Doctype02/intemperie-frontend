import { Shield, Clock, Wrench, ThumbsUp } from "lucide-react";

const benefits = [
  {
    title: "Garantía de 10 Años",
    description: "Todos nuestros productos de PVC cuentan con garantía de 10 años contra defectos de fabricación, respaldada por los mejores proveedores.",
    icon: Shield,
  },
  {
    title: "Entrega Rápida",
    description: "Entregamos en toda la República de Panamá. La mayoría de los pedidos se instalan en menos de 5 días hábiles.",
    icon: Clock,
  },
  {
    title: "Instalación Profesional",
    description: "Nuestro equipo certificado maneja la instalación completa, asegurando que tu cerca quede perfecta y nivelada.",
    icon: Wrench,
  },
  {
    title: "Asesoría Personalizada",
    description: "Te ayudamos a elegir el mejor producto para tu espacio. Visita sin costo ni compromiso para cotizar tu proyecto.",
    icon: ThumbsUp,
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 bg-green-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Más de 10 años de experiencia instalando cercas de calidad en Panamá.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <benefit.icon className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
