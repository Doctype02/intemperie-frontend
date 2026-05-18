import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Star, Phone, Mail, Clock, Check, Globe, Award, Users, Truck, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NosotrosPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-green-800 to-green-950 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28 text-center text-white">
            <p className="text-sm font-semibold text-green-300 mb-3 tracking-wide uppercase">Intemperie</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Seguridad y Elegancia<br />al Aire Libre
            </h1>
            <p className="mt-4 text-base sm:text-lg text-green-100 max-w-2xl mx-auto">
              Especialistas en Cercas PVC y Mallas Electrosoldadas. Más de 15 años protegiendo hogares, industrias y proyectos en Latinoamérica.
            </p>
          </div>
        </section>

        {/* Welcome */}
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
                <Image src="/products/cerca-pvc-vesta-601/vesta-1.jpg" alt="Calidad Intemperie" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700 mb-3 tracking-wide uppercase">Bienvenido a Intemperie</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  SEGURIDAD Y ELEGANCIA<br />PARA TODOS LOS ESPACIOS
                </h2>
                <p className="mt-5 text-base text-gray-500 leading-relaxed">
                  Somos especialistas en Cercas PVC y Mallas Electrosoldadas para todo tipo de cerramientos. Trabajamos con PVC reforzado de la más alta calidad y mallas electrosoldadas de fábricas certificadas.
                </p>
                <div className="mt-6 space-y-3">
                  {["Garantía oficial en todos nuestros productos", "Envíos a Latinoamérica y el Caribe", "Asesoría técnica e instalación profesional"].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision / Mission / Purpose */}
        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-green-700 mb-2 tracking-wide uppercase">Nuestra esencia</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">VISIÓN, MISIÓN Y PROPÓSITO</h2>
              <p className="mt-3 text-sm text-gray-500 max-w-xl mx-auto">Los principios que guían cada cerca que fabricamos y cada proyecto que entregamos.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "Visión", subtitle: "Ser líderes en cerramientos", body: "Convertirnos en la empresa referente de Latinoamérica y el Caribe en soluciones de cercas PVC y mallas electrosoldadas, reconocida por su innovación, calidad y compromiso con cada cliente." },
                { title: "Misión", subtitle: "Proteger lo que más importa", body: "Diseñar, comercializar e instalar sistemas de cerramiento que combinan seguridad, estética y durabilidad, brindando asesoría profesional y un servicio cercano en cada proyecto." },
                { title: "Propósito", subtitle: "Transformar espacios al aire libre", body: "Crear entornos seguros, elegantes y duraderos para hogares, empresas y comunidades, aportando tranquilidad y valor a las personas que confían en nosotros." },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <span className="inline-block text-xs font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-full mb-4">{item.title}</span>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-3">{item.subtitle}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-sm font-semibold text-green-700 mb-3 tracking-wide uppercase">Por qué elegirnos</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  CALIDAD QUE SE VE<br />Y SE SIENTE.
                </h2>
                <p className="mt-5 text-base text-gray-500 leading-relaxed">
                  Trabajamos con PVC reforzado de la más alta calidad y mallas electrosoldadas de fábricas certificadas. Cada producto está diseñado para resistir la intemperie por décadas.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Shield, title: "Garantía Oficial", desc: "En todos nuestros productos" },
                    { icon: Globe, title: "Envíos Internacionales", desc: "A Latinoamérica y el Caribe" },
                    { icon: Users, title: "Asesoría Técnica", desc: "Instalación profesional" },
                    { icon: Truck, title: "Despacho Rápido", desc: "A todo Panamá" },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <item.icon className="h-6 w-6 text-green-600 mb-2" />
                      <h3 className="text-sm font-extrabold text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2 relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
                <Image src="/products/cerca-pvc-atenea-305/porton.jpg" alt="Calidad" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Projects Gallery */}
        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-green-700 mb-2 tracking-wide uppercase">Proyectos realizados</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">NUESTRAS INSTALACIONES</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                "/products/cerca-pvc-afrodita-401/porton.jpg",
                "/products/cerca-pvc-afrodita-401/porton-2.jpg",
                "/products/cerca-pvc-atenea-305/porton.jpg",
                "/products/cerca-pvc-atenea-305/porton-2.jpg",
                "/products/cerca-pvc-poseidon-502/1-pagina-principal.jpg",
                "/products/cerca-pvc-poseidon-502/10.jpg",
                "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
                "/products/cerca-pvc-vesta-601/vesta-1.jpg",
              ].map((src, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <Image src={src} alt={`Proyecto ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-green-700 mb-2 tracking-wide uppercase">Lo que dicen nuestros clientes</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">TESTIMONIOS</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { name: "Karen Zambrano",  initials: "KZ", color: "bg-green-100 text-green-700",  text: "Excelente servicio y la cerca se ve hermosa. Muy fácil de instalar.", location: "Ciudad de Panamá" },
                { name: "Keila Arenas",    initials: "KA", color: "bg-blue-100 text-blue-700",    text: "Calidad superior, justo lo que buscaba para mi propiedad.", location: "Chiriquí" },
                { name: "Verónica Álvarez",initials: "VA", color: "bg-purple-100 text-purple-700",text: "Asesoría profesional de principio a fin. ¡100% recomendados!", location: "Colón" },
              ].map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 flex flex-col">
                  <Quote className="h-7 w-7 text-green-200 mb-3" />
                  <p className="text-sm text-gray-600 leading-relaxed italic flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-0.5 mt-3 text-amber-400">
                    {[...Array(5)].map((_, j) => (<Star key={j} className="h-3.5 w-3.5 fill-current" />))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${t.color}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-900 leading-tight">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instaladores */}
        <section id="instaladores" className="bg-gray-50 border-y border-gray-100 py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Programa de instaladores</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                  ¿Eres instalador de cercas?
                </h2>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  Únete a la red oficial de instaladores certificados de Intemperie. Accede a precios exclusivos,
                  capacitación técnica, leads de clientes en tu zona y el respaldo de la marca líder en cercas PVC en Panamá.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {[
                    "Descuento de instalador en todos los productos",
                    "Clientes referidos en tu zona de cobertura",
                    "Certificado digital y badge verificado Intemperie",
                    "Soporte técnico directo con nuestro equipo",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/instaladores/registro"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-green-800 transition-colors shadow-sm"
                  >
                    Registrar mi empresa <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/instaladores"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Ver directorio de instaladores
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block rounded-2xl bg-green-700 p-8 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-green-300 mb-4">Beneficios del programa</p>
                <div className="space-y-4">
                  {[
                    { icon: Award, label: "Certificación oficial", desc: "Badge verificado en tu perfil" },
                    { icon: Users, label: "Red de clientes", desc: "Leads en tu zona geográfica" },
                    { icon: Truck, label: "Envío prioritario", desc: "Despacho express en tus pedidos" },
                    { icon: Shield, label: "Soporte técnico", desc: "Asesoría directa del equipo" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <Icon className="h-4.5 w-4.5 text-green-200" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white">{label}</p>
                        <p className="text-xs text-green-200/80 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-700 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              ¿LISTO PARA CERCAR TU ESPACIO?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-green-100 max-w-2xl mx-auto">
              Cotiza tu proyecto en minutos. Te asesoramos con el modelo, dimensiones e instalación.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-white text-green-700 hover:bg-green-50 font-bold h-14 px-10 rounded-xl shadow-lg">
                <a href="https://wa.me/50762874042" target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp <ArrowRight className="ml-2 h-5 w-5" /></a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-bold h-14 px-10 rounded-xl">
                <Link href="/productos">Ver tienda online</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gray-900 text-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
              {[
                { icon: Phone, label: "Teléfono", value: "+507 6287-4042", href: "tel:+50762874042" },
                { icon: Mail, label: "Email", value: "ventas@intemperie.com", href: "mailto:ventas@intemperie.com" },
                { icon: Globe, label: "Ubicación", value: "Latinoamérica y Caribe" },
                { icon: Clock, label: "Horario", value: "Lun–Sáb 8AM–6PM" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center sm:items-start gap-1.5">
                  <item.icon className="h-5 w-5 text-green-400 mb-1" />
                  <p className="text-xs text-gray-400">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-semibold text-white hover:text-green-300 transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                  )}
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
