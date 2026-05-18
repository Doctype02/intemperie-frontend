import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  CheckCircle2, Star, Truck, BadgePercent, Headphones,
  MapPin, Phone, Mail, ArrowRight, ChevronRight,
  ShieldCheck, Wrench, Users, Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Red de Instaladores Certificados",
  description:
    "Encuentra un instalador certificado de cercas PVC e Intemperie cerca de ti, o únete a nuestra red de profesionales.",
};

/* ── Data ─────────────────────────────────────────────────────────────────── */
const instaladorBeneficios = [
  {
    Icon: BadgePercent,
    title: "Descuentos exclusivos",
    desc: "Accede a precios de instalador en todos los productos Intemperie. Ahorra en cada proyecto.",
  },
  {
    Icon: Truck,
    title: "Envío express prioritario",
    desc: "Tus pedidos tienen prioridad en despacho. Entregas coordinadas según tu calendario de obra.",
  },
  {
    Icon: Award,
    title: "Certificación oficial",
    desc: "Recibe el sello Intemperie Certificado. Te listamos en nuestro directorio y te referimos clientes.",
  },
  {
    Icon: Headphones,
    title: "Soporte técnico directo",
    desc: "Línea de WhatsApp exclusiva para instaladores. Asesoría en medidas, materiales y técnicas.",
  },
];

const pasos = [
  {
    num: "01",
    title: "Envía tu solicitud",
    desc: "Completa el formulario con tu experiencia, zona de cobertura y portafolio de proyectos.",
  },
  {
    num: "02",
    title: "Revisamos tu perfil",
    desc: "Nuestro equipo evalúa tu trayectoria. El proceso toma entre 3 y 5 días hábiles.",
  },
  {
    num: "03",
    title: "Capacitación técnica",
    desc: "Participas en una sesión de capacitación sobre instalación correcta de cercas PVC.",
  },
  {
    num: "04",
    title: "¡Ya eres certificado!",
    desc: "Apareces en el directorio, recibes tu kit de bienvenida y acceso a precios especiales.",
  },
];

const requisitos = [
  "Mínimo 2 años de experiencia en instalación de cercas o estructuras similares",
  "Contar con herramientas y equipo propio",
  "Disponibilidad para zona de cobertura declarada",
  "Presentar mínimo 3 referencias de proyectos anteriores",
  "Completar la capacitación técnica de Intemperie (presencial u online)",
];

const instaladores: {
  nombre: string;
  zona: string;
  telefono: string;
  especialidad: string;
  rating: number;
  proyectos: number;
}[] = [
  {
    nombre: "Construcciones Ríos",
    zona: "La Chorrera, Panamá Oeste",
    telefono: "+507 6123-4567",
    especialidad: "Cercas PVC Residencial",
    rating: 5,
    proyectos: 47,
  },
  {
    nombre: "Instalaciones Herrera & Asociados",
    zona: "Ciudad de Panamá",
    telefono: "+507 6234-5678",
    especialidad: "Cercas PVC Industrial",
    rating: 5,
    proyectos: 83,
  },
  {
    nombre: "TechFence Panamá",
    zona: "San Miguelito, Arraiján",
    telefono: "+507 6345-6789",
    especialidad: "Mallas Electrosoldadas",
    rating: 4,
    proyectos: 31,
  },
  {
    nombre: "Obras y Cercas del Pacífico",
    zona: "Coronado, Chame, Antón",
    telefono: "+507 6456-7890",
    especialidad: "Zonas Costeras & Anti-salitre",
    rating: 5,
    proyectos: 62,
  },
  {
    nombre: "Estructuras Moreno",
    zona: "Santiago, Veraguas",
    telefono: "+507 6567-8901",
    especialidad: "Cercas PVC Gubernamental",
    rating: 4,
    proyectos: 28,
  },
  {
    nombre: "Cercas del Interior",
    zona: "David, Chiriquí",
    telefono: "+507 6678-9012",
    especialidad: "Cercas PVC Residencial e Industrial",
    rating: 5,
    proyectos: 54,
  },
];

/* ── Components ───────────────────────────────────────────────────────────── */
function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= n ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function InstaladoresPage() {
  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 mb-5">
                <Wrench className="h-3.5 w-3.5 text-green-300" aria-hidden="true" />
                <span className="text-xs font-bold text-green-200 uppercase tracking-widest">
                  Red oficial Intemperie
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Red de Instaladores<br className="hidden sm:block" /> Certificados
              </h1>
              <p className="mt-4 text-base sm:text-lg text-green-100/80 leading-relaxed max-w-xl">
                Profesionales verificados por Intemperie. Instalación garantizada
                en toda la República de Panamá.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="#directorio"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-900 px-6 py-3 text-sm font-extrabold hover:bg-gray-50 transition-colors shadow-lg"
                >
                  Ver directorio <ChevronRight className="h-4 w-4" />
                </a>
                <a
                  href="/instaladores/registro"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-transparent border-2 border-white/40 text-white px-6 py-3 text-sm font-extrabold hover:bg-white/10 transition-colors"
                >
                  Registrar mi empresa <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Stat pills */}
              <div className="mt-10 flex flex-wrap gap-4">
                {[
                  { value: "6+",    label: "Provincias cubiertas" },
                  { value: "100%",  label: "Instalaciones verificadas" },
                  { value: "15 años", label: "Garantía en productos" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5 rounded-xl bg-white/10 border border-white/15 px-4 py-2.5">
                    <span className="text-lg font-extrabold text-white">{s.value}</span>
                    <span className="text-xs text-green-200 leading-tight max-w-[80px]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Disclaimer ───────────────────────────────────────────────────── */}
        <div className="bg-amber-50 border-y border-amber-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Aviso importante:</strong> Intemperie Panamá verifica la identidad y experiencia de
              los instaladores listados, pero no es responsable por los servicios prestados por empresas
              o personas externas. Te recomendamos solicitar cotización por escrito antes de contratar.
            </p>
          </div>
        </div>

        {/* ── Directorio ───────────────────────────────────────────────────── */}
        <section id="directorio" className="bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Directorio</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Instaladores certificados
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-xl">
                Todos los profesionales listados han sido verificados y capacitados directamente por Intemperie.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {instaladores.map((inst) => (
                <div
                  key={inst.nombre}
                  className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 hover:border-green-300 hover:shadow-lg transition-all duration-200"
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Certificado
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white font-extrabold text-lg mb-4 select-none">
                    {inst.nombre.charAt(0)}
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 pr-20 leading-snug">
                    {inst.nombre}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full px-2.5 py-0.5 w-fit">
                    {inst.especialidad}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <Stars n={inst.rating} />
                    <span className="text-xs text-gray-400">{inst.proyectos} proyectos</span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{inst.zona}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
                      <a href={`tel:${inst.telefono.replace(/\s|-/g, "")}`} className="hover:text-green-700 transition-colors">
                        {inst.telefono}
                      </a>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${inst.telefono.replace(/\D/g, "")}?text=Hola%2C%20los%20encontré%20en%20el%20directorio%20de%20Intemperie%20y%20quiero%20cotizar%20una%20instalación`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-green-200 py-2.5 text-sm font-bold text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-150"
                  >
                    Contactar por WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Beneficios para instaladores ──────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">
                Beneficios exclusivos
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                ¿Por qué unirte a nuestra red?
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
                Los instaladores certificados de Intemperie tienen acceso a herramientas y ventajas
                que no encontrarás en ningún otro proveedor.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {instaladorBeneficios.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:border-green-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 mb-4">
                    <b.Icon className="h-6 w-6 text-green-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900">{b.title}</h3>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed flex-1">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ─────────────────────────────────────────────────── */}
        <section className="bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">
                Proceso de certificación
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Cómo convertirte en instalador certificado
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
              {/* Connector line — desktop only */}
              <div className="absolute top-6 left-[12.5%] right-[12.5%] h-px bg-green-100 hidden lg:block" aria-hidden="true" />

              {pasos.map((paso) => (
                <div key={paso.num} className="relative flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white font-extrabold text-sm mb-4 relative z-10 shadow-md">
                    {paso.num}
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900">{paso.title}</h3>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed max-w-[180px]">{paso.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Requisitos ───────────────────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">
                  Requisitos
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
                  Lo que necesitas para aplicar
                </h2>
                <ul className="space-y-3">
                  {requisitos.map((req) => (
                    <li key={req} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-sm text-gray-600 leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a
                    href="/instaladores/registro"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-green-800 transition-colors shadow-sm"
                  >
                    Completar formulario de registro <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="relative h-64 sm:h-80 lg:h-full min-h-[280px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/products/cerca-pvc-atenea-305/porton.jpg"
                  alt="Instalación profesional de cercas PVC"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-white font-extrabold text-lg leading-tight">Instalación profesional garantizada</p>
                  <p className="text-green-200 text-sm mt-1">Certificado por Intemperie Panamá</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Aplicar ──────────────────────────────────────────────────── */}
        <section id="aplicar" className="bg-green-700 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <Users className="mx-auto h-12 w-12 text-green-300 mb-4" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              ¿Quieres ser Instalador Certificado de Intemperie?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-green-100/80 leading-relaxed max-w-xl mx-auto">
              Únete a nuestra red de profesionales certificados. Más clientes, mejores precios
              y el respaldo de la marca líder en cercas PVC en Panamá.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/instaladores/registro"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-900 px-7 py-3.5 text-sm font-extrabold hover:bg-gray-50 transition-colors shadow-lg"
              >
                Registrar mi empresa <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="mailto:ventas@intemperie.com?subject=Solicitud%20de%20instalador%20certificado"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-transparent border-2 border-white/40 text-white px-7 py-3.5 text-sm font-extrabold hover:bg-white/10 transition-colors"
              >
                <Mail className="h-4 w-4" /> Enviar correo
              </a>
            </div>

            <p className="mt-5 text-xs text-green-200/70">
              Respondemos en menos de 24 horas hábiles
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">FAQ</p>
              <h2 className="text-2xl font-extrabold text-gray-900">Preguntas frecuentes</h2>
            </div>
            <div className="space-y-5">
              {[
                {
                  q: "¿La certificación tiene algún costo?",
                  a: "No. El proceso de certificación es completamente gratuito para instaladores calificados. Solo requiere tu tiempo para la capacitación técnica.",
                },
                {
                  q: "¿Cuánto tarda el proceso de certificación?",
                  a: "Desde que envías tu solicitud hasta recibir la certificación, el proceso toma entre 7 y 14 días hábiles, dependiendo de la agenda de capacitaciones.",
                },
                {
                  q: "¿Puedo instalar marcas distintas a Intemperie?",
                  a: "Sí. La certificación solo aplica para instalaciones de productos Intemperie. Puedes trabajar con otras marcas sin restricción.",
                },
                {
                  q: "¿Cómo me envían los leads de clientes?",
                  a: "Cuando un cliente en tu zona busca un instalador, lo ponemos en contacto directo contigo por WhatsApp. Tú decides si aceptas el proyecto.",
                },
                {
                  q: "¿Hay requisito de volumen mínimo de compra?",
                  a: "No exigimos volumen mínimo, pero los descuentos de instalador aplican a partir de $200 en productos por pedido.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-gray-200 p-5">
                  <p className="text-sm font-extrabold text-gray-900">{q}</p>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
