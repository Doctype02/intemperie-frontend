import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Star, Phone, Mail, Clock, Check, Globe, Award, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/products?limit=12`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-white overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-sm font-semibold text-green-700 mb-3 tracking-wide uppercase">Especialistas en Cercas PVC</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.05]">
                  CALIDAD,<br />
                  ELEGANCIA Y<br />
                  <span className="text-green-600">PRIVACIDAD.</span>
                </h1>
                <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-lg leading-relaxed">
                  Fácil instalación. PVC reforzado de alta resistencia. Enviamos a Latinoamérica y el Caribe.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 font-bold h-12 px-8 text-sm rounded-xl">
                    <a href="https://wa.me/50762874042" target="_blank" rel="noopener noreferrer">Cotiza YA</a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-gray-300 hover:bg-gray-50 font-bold h-12 px-8 text-sm rounded-xl">
                    <Link href="/productos">Ver productos</Link>
                  </Button>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="relative h-64 sm:h-80 lg:h-[500px] rounded-2xl overflow-hidden bg-gray-100 shadow-2xl">
                  <Image
                    src="/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg"
                    alt="Cerca PVC Intemperie"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 hidden sm:block">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-bold text-gray-900">+15 años de experiencia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t pt-10">
              {[
                { value: "+15,000", label: "Proyectos Exitosos", icon: Award },
                { value: "+10", label: "Países enviados", icon: Globe },
                { value: "100%", label: "Satisfacción Garantizada", icon: Star },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <stat.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Welcome / About */}
        <section id="nosotros" className="bg-gray-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
                <Image
                  src="/products/cerca-pvc-vesta-601/vesta-1.jpg"
                  alt="Calidad Intemperie"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700 mb-3 tracking-wide uppercase">Bienvenido a Intemperie</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  SEGURIDAD Y ELEGANCIA<br />
                  PARA TODOS LOS ESPACIOS
                </h2>
                <p className="mt-5 text-base text-gray-500 leading-relaxed">
                  Somos especialistas en Cercas PVC y Mallas Electrosoldadas para todo tipo de cerramientos.
                  Cada producto está diseñado para resistir la intemperie por décadas.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "Garantía oficial en todos nuestros productos",
                    "Envíos a Latinoamérica y el Caribe",
                    "Asesoría técnica e instalación profesional",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-7 bg-green-600 hover:bg-green-700 font-bold rounded-xl">
                  <Link href="/productos">Explorar nuestros productos <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Cards */}
        <section id="soluciones" className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-green-700 mb-2 tracking-wide uppercase">Soluciones</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">PARA CADA NECESIDAD</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { name: "Gubernamental", icon: "🏛️", slug: "gubernamental", desc: "Seguridad duradera", color: "bg-blue-50 border-blue-100 hover:border-blue-300" },
                { name: "Agropecuario", icon: "🌾", slug: "agropecuario", desc: "Fincas y granjas", color: "bg-amber-50 border-amber-100 hover:border-amber-300" },
                { name: "Residencial", icon: "🏠", slug: "residencial", desc: "Privacidad y elegancia", color: "bg-green-50 border-green-100 hover:border-green-300" },
                { name: "Industrial", icon: "🏭", slug: "industrial", desc: "Naves y plantas", color: "bg-slate-50 border-slate-100 hover:border-slate-300" },
                { name: "Costeras", icon: "🌊", slug: "zonas-costeras", desc: "Resistencia salina", color: "bg-cyan-50 border-cyan-100 hover:border-cyan-300" },
              ].map((cat) => (
                <Link key={cat.slug} href={`/productos?category=${cat.slug}`}
                  className={`flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${cat.color}`}
                >
                  <span className="text-3xl mb-3">{cat.icon}</span>
                  <h3 className="text-sm font-extrabold text-gray-900">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-sm font-semibold text-green-700 mb-3 tracking-wide uppercase">Por qué elegirnos</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  CALIDAD QUE SE VE<br />
                  Y SE SIENTE.
                </h2>
                <p className="mt-5 text-base text-gray-500 leading-relaxed">
                  Trabajamos con PVC reforzado de la más alta calidad y mallas electrosoldadas de fábricas certificadas.
                  Cada producto está diseñado para resistir la intemperie por décadas.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Shield, title: "Garantía Oficial", desc: "En todos nuestros productos" },
                    { icon: Globe, title: "Envíos Internacionales", desc: "A Latinoamérica y el Caribe" },
                    { icon: Users, title: "Asesoría Técnica", desc: "Instalación profesional" },
                    { icon: Truck, title: "Despacho Rápido", desc: "A todo Panamá" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                      <item.icon className="h-6 w-6 text-green-600 mb-2" />
                      <h3 className="text-sm font-extrabold text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2 relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
                <Image
                  src="/products/cerca-pvc-atenea-305/porton.jpg"
                  alt="Calidad Intemperie"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Vision / Mission / Purpose */}
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-green-700 mb-2 tracking-wide uppercase">Nuestra esencia</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">VISIÓN, MISIÓN Y PROPÓSITO</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "Visión", subtitle: "Ser líderes en cerramientos", body: "Convertirnos en la empresa referente de Latinoamérica y el Caribe en soluciones de cercas PVC y mallas electrosoldadas, reconocida por su innovación, calidad y compromiso." },
                { title: "Misión", subtitle: "Proteger lo que más importa", body: "Diseñar, comercializar e instalar sistemas de cerramiento que combinan seguridad, estética y durabilidad, brindando asesoría profesional y un servicio cercano en cada proyecto." },
                { title: "Propósito", subtitle: "Transformar espacios al aire libre", body: "Crear entornos seguros, elegantes y duraderos para hogares, empresas y comunidades, aportando tranquilidad y valor a las personas que confían en nosotros." },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <span className="inline-block text-xs font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-full mb-4">{item.title}</span>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-3">{item.subtitle}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="productos" className="bg-gray-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-green-700 mb-2 tracking-wide uppercase">Catálogo</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">NUESTROS PRODUCTOS</h2>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Cargando productos...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {products.slice(0, 12).map((p: any) => (
                    <ProductCard key={p.id} {...p} />
                  ))}
                </div>
                <div className="mt-10 text-center">
                  <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 font-bold h-12 px-8 rounded-xl">
                    <Link href="/productos">Ver catálogo completo <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                  </Button>
                </div>
              </>
            )}
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
                { name: "Karen Zambrano", text: "Excelente servicio y la cerca se ve hermosa. Muy fácil de instalar." },
                { name: "Keila Arenas", text: "Calidad superior, justo lo que buscaba para mi propiedad." },
                { name: "Verónica Álvarez", text: "Asesoría profesional de principio a fin. ¡100% recomendados!" },
              ].map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
                  <div className="flex items-center gap-1 mb-3 text-amber-400">
                    {[...Array(5)].map((_, j) => (<Star key={j} className="h-4 w-4 fill-current" />))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-extrabold text-gray-900">{t.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Gallery */}
        <section id="proyectos" className="bg-gray-50 py-16 lg:py-20">
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

        {/* CTA */}
        <section id="cotizaciones" className="bg-green-700 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              ¿LISTO PARA CERCAR TU ESPACIO?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-green-100 max-w-2xl mx-auto">
              Cotiza tu proyecto en minutos. Te asesoramos con el modelo, dimensiones e instalación.
            </p>
            <Button asChild size="lg" className="mt-8 bg-white text-green-700 hover:bg-green-50 font-bold h-14 px-10 text-base rounded-xl shadow-lg">
              <a href="https://wa.me/50762874042" target="_blank" rel="noopener noreferrer">
                Escríbenos por WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-gray-900 text-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
              {[
                { icon: Phone, label: "Teléfono", value: "+507 6287-4042", href: "tel:+50762874042" },
                { icon: Mail, label: "Email", value: "ventas@intemperie.com", href: "mailto:ventas@intemperie.com" },
                { icon: Globe, label: "Ubicación", value: "Latinoamérica y Caribe", href: null },
                { icon: Clock, label: "Horario", value: "Lun–Sáb 8AM–6PM", href: null },
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
