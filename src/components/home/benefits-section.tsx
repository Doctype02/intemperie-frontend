import { Shield, Sparkles, Wrench, Clock } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Máxima resistencia",
    desc: "PVC reforzado y acero galvanizado que resisten impactos, viento y condiciones extremas sin deformarse.",
  },
  {
    icon: Sparkles,
    title: "Cero mantenimiento",
    desc: "Solo agua y jabón. No se oxidan, no se pudren y mantienen su color por más de 15 años sin pintar.",
  },
  {
    icon: Wrench,
    title: "Instalación profesional",
    desc: "Equipo técnico certificado con más de 14 años de experiencia. Rápida, limpia y con garantía.",
  },
  {
    icon: Clock,
    title: "Durabilidad garantizada",
    desc: "Garantía de 10 a 15 años según el producto. Protección UV que evita el amarillamiento.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">¿Por qué elegir Intemperie?</h2>
          <p className="mt-3 text-gray-500">Beneficios que nos diferencian del resto</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl bg-white p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
                <b.icon className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{b.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
