import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  Award,
  Check,
  ChevronRight,
  Clock,
  Factory,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react"

import { FadeInImage } from "@/components/shared/fade-in-image"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

import {
  CERTIFICATIONS,
  ESSENCE,
  MODEL_SHOTS,
  PROJECTS,
  TEAM,
  TESTIMONIALS,
  monthLabel,
} from "./content"

/* «Nosotros» — sistema «Perímetro».
 *
 * Esta y `/instaladores` eran las dos últimas páginas con la paleta antigua:
 * `green-700`, `gray-50`, `gray-900`, `amber-400`… 278 clases de color escritas
 * a mano en un sitio donde el color vive en `globals.css`. Aquí ya no queda
 * ninguna: cada superficie, cada línea y cada texto sale de un token, así que
 * el día que se afine el verde de marca esta página se afina con él.
 *
 * Pero el problema de fondo no era el color, era el contenido. Una página
 * «nosotros» sólo tiene un trabajo —convencer a alguien que está a punto de
 * gastarse cuatro cifras de que hay una empresa detrás— y ésta lo hacía con
 * material que no aguanta una pregunta:
 *
 * · «Más de 15 años protegiendo hogares, industrias y proyectos en
 *   **Latinoamérica**», mientras la política de envíos habla de la República
 *   de Panamá y el JSON-LD del sitio declara `areaServed: PA`. Dos promesas de
 *   cobertura distintas en la misma web. Se queda la que la empresa cumple.
 *
 * · Ocho fotografías del catálogo bajo el rótulo «Nuestras instalaciones»,
 *   numeradas «Proyecto 1»…«Proyecto 8», sin ubicación y sin fecha. Como
 *   prueba de obra no valen; como catálogo, sí. Quedan dos, llamadas por el
 *   nombre del modelo y enlazadas a su ficha.
 *
 * · Tres testimonios de nombre de pila, ciudad y cinco estrellas cada uno.
 *   Ése es, literalmente, el formato del testimonio inventado.
 *
 * Ninguna de esas cosas se ha sustituido por otra inventada. Todo el contenido
 * verificable —equipo, certificaciones, obras y testimonios— vive ahora en
 * `content.ts` con sus listas a cero y con la ficha de lo que hay que pedirle
 * al cliente escrita al lado de cada una. Las secciones cuyo contenido no ha
 * llegado no se pintan; la que sí tiene sustituto honesto —obras— lo dice y
 * manda al catálogo. La página se lee entera y cierra igual con las cuatro
 * listas vacías.
 *
 * Cero hidratación: es HTML de servidor de arriba abajo, como la portada. El
 * único JavaScript de la ruta es el de la cabecera y el botón flotante.
 */

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Intemperie fabrica e instala cercas de PVC y malla electrosoldada en Panamá, desde La Chorrera. Quiénes somos, qué hacemos y cómo contactarnos.",
  alternates: { canonical: "/nosotros" },
}

/* ── Primitivas de maquetación ───────────────────────────────────────────
   Las mismas cuatro decisiones repetidas nueve veces se declaran una: el
   canalón lo pone `.shell`, el ritmo vertical lo pone esta función y la
   superficie alterna para que nueve bloques seguidos no se lean como una
   mancha única. */
function Section({
  children,
  surface = "base",
  id,
  defer = true,
}: {
  children: React.ReactNode
  surface?: "base" | "raised" | "sunk" | "navy"
  id?: string
  defer?: boolean
}) {
  const bg = {
    base: "bg-background",
    raised: "bg-surface",
    sunk: "bg-surface-sunk",
    navy: "bg-brand-navy-deep text-on-dark",
  }[surface]

  return (
    <section
      id={id}
      className={`border-b border-border ${bg} ${defer ? "defer-paint" : ""}`}
    >
      <div className="shell py-10 sm:py-12 lg:py-14">{children}</div>
    </section>
  )
}

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string
  title: string
  sub?: string
}) {
  return (
    <div className="mb-6 max-w-prose">
      <p className="eyebrow text-brand-green-deep">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
        {title}
      </h2>
      {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
    </div>
  )
}

/* ── Página ──────────────────────────────────────────────────────────────── */
export default function NosotrosPage() {
  const [firstShot, secondShot] = MODEL_SHOTS

  return (
    <>
      <Header />

      {/* El enlace «Saltar al contenido» de la cabecera apunta aquí. Antes esta
          página no tenía el ancla: el salto no llevaba a ningún sitio. */}
      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* ── 1. Quiénes somos ─────────────────────────────────────────────
            Sin `defer-paint`: está en el primer viewport y aplazar su pintado
            retrasaría el LCP. */}
        <section className="border-b border-border bg-brand-navy-deep text-on-dark">
          <div className="shell grid gap-8 py-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:py-16">
            <div className="min-w-0">
              <p className="eyebrow text-brand-green">
                Intemperie · {CONTACT.city}
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance lg:text-5xl">
                Fabricamos e instalamos cercas en Panamá
              </h1>

              <p className="mt-4 max-w-prose text-base text-on-dark-soft">
                Cercas de PVC y malla electrosoldada para casas, naves, fincas e
                instituciones. Vendemos el material con el precio por metro
                lineal delante y lo montamos nosotros o un instalador de la red.
              </p>

              <p className="mt-3 max-w-prose text-sm text-on-dark-soft">
                Trabajamos desde {CONTACT.city}, con cobertura en las diez
                provincias. No enviamos fuera del país: lo que se promete aquí
                es lo mismo que dice la{" "}
                <Link
                  href="/envios"
                  className="rounded-sm font-semibold text-on-dark underline underline-offset-4 transition-colors hover:text-brand-green"
                >
                  política de envíos
                </Link>
                .
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={whatsappHref(WA_MESSAGE.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center gap-2 rounded-lg bg-whatsapp px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-whatsapp-deep"
                >
                  <IconWhatsApp />
                  Hablar con nosotros
                </a>
                <Link
                  href="/productos"
                  className="flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
                >
                  Ver el catálogo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Una sola imagen en el primer viewport, con relación de aspecto
                fija en los dos anchos: no hay salto de maquetación. */}
            {firstShot && (
              <figure className="min-w-0">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-2 lg:aspect-[4/3]">
                  <Image
                    src={firstShot.src}
                    alt={firstShot.alt}
                    fill
                    preload
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="mt-2 text-xs text-on-dark-soft">
                  Modelo de catálogo{" "}
                  <Link
                    href={firstShot.href}
                    className="rounded-sm font-semibold text-on-dark underline underline-offset-4 transition-colors hover:text-brand-green"
                  >
                    {firstShot.model}
                  </Link>
                  . No es una fotografía de obra entregada.
                </figcaption>
              </figure>
            )}
          </div>
        </section>

        {/* ── 2. Los cuatro datos comprobables ─────────────────────────────
            Cuatro y no seis, y ninguno es «100% satisfacción»: los cuatro se
            pueden comprobar sin salir del sitio, y tres de ellos llevan a la
            página donde se comprueban. */}
        <section className="border-b border-border bg-surface">
          <div className="shell">
            <ul className="grid grid-cols-2 lg:grid-cols-4">
              {[
                {
                  Icon: Factory,
                  title: "Fabricación propia",
                  sub: `Taller en ${CONTACT.city}`,
                  href: "/productos",
                },
                {
                  Icon: MapPin,
                  title: "Las diez provincias",
                  sub: "Cobertura y costes publicados",
                  href: "/envios",
                },
                {
                  Icon: ShieldCheck,
                  title: "Garantía por modelo",
                  sub: "El plazo, en cada ficha",
                  href: "/productos",
                },
                {
                  Icon: Wrench,
                  title: "Instalación",
                  sub: "Equipo propio y red de instaladores",
                  href: "/instaladores",
                },
              ].map((item, i) => (
                <li
                  key={item.title}
                  className={`border-border ${i % 2 === 0 ? "sm:border-r" : ""} ${
                    i < 2 ? "border-b lg:border-b-0" : ""
                  } lg:border-r lg:last:border-r-0`}
                >
                  <Link
                    href={item.href}
                    className="flex h-full items-start gap-2.5 px-1 py-4 transition-colors hover:bg-surface-2 sm:px-4"
                  >
                    <item.Icon
                      className="mt-0.5 size-5 shrink-0 text-brand-green"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm leading-tight font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                        {item.sub}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 3. Qué hacemos ─────────────────────────────────────────────── */}
        <Section surface="base">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <SectionHead
                eyebrow="Qué hacemos"
                title="Dos materiales, un perímetro"
              />
              <p className="max-w-prose text-base text-foreground">
                Trabajamos dos sistemas y sólo dos, porque son los que sabemos
                fabricar y montar: cerca de PVC reforzado, para quien quiere que
                el cerramiento se vea bien y no lo pinte nunca más, y malla
                electrosoldada, para quien necesita cerrar mucho metro con el
                menor coste por metro.
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  {
                    title: "Le decimos el precio antes de ir a verlo",
                    body: "El precio por metro lineal está publicado en cada ficha y en la calculadora. La visita sirve para medir, no para revelar el precio.",
                  },
                  {
                    title: "Asesoría de altura y modelo",
                    body: "Qué altura pide un lindero, qué calibre aguanta un potrero y qué modelo resiste el salitre: eso se resuelve antes de cotizar.",
                  },
                  {
                    title: "Montaje o material suelto",
                    body: "Puede comprar sólo el material y montarlo usted, o encargarnos la instalación completa.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 size-5 shrink-0 text-brand-green"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/calculadora"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
              >
                Calcular mi presupuesto
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            {secondShot && (
              <figure className="min-w-0">
                {/* Bajo el pliegue y perezosa: cuando el visitante llega
                    aquí la foto puede tardar. `FadeInImage` la funde sobre el
                    tono del recuadro en vez de encajarla de golpe. */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-2">
                  <FadeInImage
                    src={secondShot.src}
                    alt={secondShot.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  Modelo de catálogo{" "}
                  <Link
                    href={secondShot.href}
                    className="rounded-sm font-semibold text-brand-green-deep underline underline-offset-4 transition-colors hover:text-brand-green"
                  >
                    {secondShot.model}
                  </Link>
                  . Fotografía de producto, no de obra entregada.
                </figcaption>
              </figure>
            )}
          </div>
        </Section>

        {/* ── 4. Visión, misión y propósito ──────────────────────────────── */}
        <Section surface="sunk">
          <SectionHead
            eyebrow="Nuestra esencia"
            title="Visión, misión y propósito"
            sub="Lo que la empresa se propone. Son palabras nuestras, no cifras: las cifras están arriba y llevan a la página donde se comprueban."
          />
          <ul className="grid gap-4 sm:grid-cols-3">
            {ESSENCE.map((pillar) => (
              <li
                key={pillar.label}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <p className="eyebrow text-brand-green-deep">{pillar.label}</p>
                <h3 className="mt-2 text-lg font-bold text-balance text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pillar.body}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 5. Equipo ────────────────────────────────────────────────────
            No se pinta mientras no haya nadie cargado. Ver `content.ts`. */}
        {TEAM.length > 0 && (
          <Section surface="base">
            <SectionHead
              eyebrow="Quién le atiende"
              title="El equipo"
              sub="Las personas que cotizan, fabrican y montan."
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((member) => (
                <li
                  key={member.name}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  {member.photo ? (
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-surface-2">
                      <FadeInImage
                        src={member.photo.src}
                        alt={member.photo.alt}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-cover object-center"
                      />
                    </div>
                  ) : (
                    <p
                      className="mb-4 flex size-12 items-center justify-center rounded-lg bg-brand-green-soft font-heading text-lg font-bold text-brand-green-deep"
                      aria-hidden="true"
                    >
                      {member.name.charAt(0)}
                    </p>
                  )}
                  <p className="text-base font-bold text-foreground">
                    {member.name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {member.role}
                  </p>
                  {member.since && (
                    <p className="mt-1 text-xs text-muted-foreground tabular">
                      En Intemperie desde {member.since}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── 6. Certificaciones ──────────────────────────────────────────
            Tampoco se pinta vacía: «fábricas certificadas» sin decir por quién
            no es una certificación. Ver `content.ts`. */}
        {CERTIFICATIONS.length > 0 && (
          <Section surface="raised">
            <SectionHead
              eyebrow="Respaldo"
              title="Certificaciones"
              sub="Quién emite cada certificado y a qué aplica."
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CERTIFICATIONS.map((cert) => (
                <li
                  key={cert.name}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <Award
                    className="size-5 text-brand-green"
                    aria-hidden="true"
                  />
                  <h3 className="mt-3 text-base font-bold text-foreground">
                    {cert.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cert.issuer}
                    {cert.year && <span className="tabular"> · {cert.year}</span>}
                  </p>
                  {cert.scope && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cert.scope}
                    </p>
                  )}
                  {cert.href && (
                    <a
                      href={cert.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-brand-green-deep transition-colors hover:text-brand-green"
                    >
                      Ver el documento
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── 7. Obras entregadas ─────────────────────────────────────────
            Ésta sí se pinta vacía, porque tiene un sustituto honesto: decir en
            qué estado está la documentación y mandar al sitio donde sí hay
            fotografías con nombre —el catálogo—. Es la diferencia entre una
            sección vacía y una sección que informa. */}
        <Section surface="sunk" id="obras">
          <SectionHead
            eyebrow="Obras entregadas"
            title={
              PROJECTS.length > 0
                ? "Dónde y cuándo"
                : "Estamos documentando las obras"
            }
            sub={
              PROJECTS.length > 0
                ? "Cada obra con su ubicación, el mes de entrega y el modelo instalado."
                : undefined
            }
          />

          {PROJECTS.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((project) => (
                <li key={`${project.location}-${project.deliveredOn}`}>
                  <figure className="h-full overflow-hidden rounded-xl border border-border bg-surface">
                    <div className="relative aspect-[4/3] bg-surface-2">
                      <FadeInImage
                        src={project.image.src}
                        alt={project.image.alt}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover object-center"
                      />
                    </div>
                    <figcaption className="p-4">
                      <p className="text-sm font-semibold text-foreground">
                        {project.location}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground tabular">
                        Entregada en {monthLabel(project.deliveredOn)}
                        {project.meters != null && ` · ${project.meters} m lineales`}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.modelHref ? (
                          <Link
                            href={project.modelHref}
                            className="rounded-sm font-semibold text-brand-green-deep underline underline-offset-4 transition-colors hover:text-brand-green"
                          >
                            {project.model}
                          </Link>
                        ) : (
                          project.model
                        )}
                      </p>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : (
            <div className="max-w-prose rounded-xl border border-border bg-surface p-5 sm:p-6">
              <p className="text-sm text-foreground">
                Aquí había ocho fotografías rotuladas «Proyecto 1», «Proyecto
                2»… sin decir dónde estaban ni de cuándo eran. Una obra sin
                ubicación y sin fecha no prueba nada, así que se han retirado.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Estamos reuniendo las obras entregadas con su corregimiento, su
                mes de entrega, los metros instalados y el permiso del
                propietario. Hasta que estén, las fotografías de cada modelo —y
                su precio por metro— están en el catálogo.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/productos"
                  className="flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
                >
                  Ver los modelos
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a
                  href={whatsappHref(WA_MESSAGE.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center gap-2 rounded-lg border border-border-strong px-5 font-heading font-semibold text-foreground transition-colors hover:bg-surface-2"
                >
                  <IconWhatsApp />
                  Pedir referencias de obra
                </a>
              </div>
            </div>
          )}
        </Section>

        {/* ── 8. Testimonios ──────────────────────────────────────────────
            No se pinta vacía. Ver `content.ts`. */}
        {TESTIMONIALS.length > 0 && (
          <Section surface="base">
            <SectionHead
              eyebrow="Clientes"
              title="Lo que dicen de nosotros"
              sub="Firmados con nombre y apellido, con la obra y la fecha al lado."
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map((item) => (
                <li key={item.author} className="h-full">
                  <figure className="flex h-full flex-col rounded-xl border border-border bg-surface p-5">
                    <blockquote className="flex-1 text-sm text-foreground">
                      «{item.quote}»
                    </blockquote>
                    <figcaption className="mt-4 border-t border-border pt-4">
                      <p className="text-sm font-semibold text-foreground">
                        {item.author}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground tabular">
                        {item.location} · {monthLabel(item.date)}
                        {item.model && ` · ${item.model}`}
                      </p>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── 9. Programa de instaladores ─────────────────────────────────── */}
        <Section surface="raised" id="instaladores">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
            <div className="min-w-0">
              <SectionHead
                eyebrow="Programa de instaladores"
                title="¿Monta cercas para vivir?"
                sub="Precio de instalador, capacitación técnica y trabajo referido en su zona. El programa está abierto; el directorio público todavía se está verificando."
              />
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/instaladores/registro"
                  className="flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
                >
                  Registrar mi empresa
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/instaladores"
                  className="flex h-12 items-center gap-2 rounded-lg border border-border-strong px-5 font-heading font-semibold text-foreground transition-colors hover:bg-surface-2"
                >
                  Ver el programa
                </Link>
              </div>
            </div>

            <ul className="grid gap-3 rounded-xl border border-border bg-surface-sunk p-5 sm:grid-cols-2">
              {[
                "Precio de instalador en todo el catálogo",
                "Trabajo referido en su zona de cobertura",
                "Capacitación técnica de montaje",
                "Soporte directo con el taller",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-brand-green"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ── 10. Cierre ─────────────────────────────────────────────────── */}
        <section className="defer-paint bg-brand-navy-deep text-on-dark">
          <div className="picket-rule" aria-hidden="true" />
          <div className="shell py-10 sm:py-12 lg:py-14">
            <div className="max-w-prose">
              <p className="eyebrow text-brand-green">Hablemos</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                Díganos qué quiere cercar
              </h2>
              <p className="mt-2 text-sm text-on-dark-soft">
                Le decimos el modelo, la altura y lo que cuesta el metro. Sin
                dejar el correo y sin esperar a nadie.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={whatsappHref(WA_MESSAGE.quote)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center gap-2 rounded-lg bg-whatsapp px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-whatsapp-deep"
              >
                <IconWhatsApp />
                Escribir por WhatsApp
              </a>
              <a
                href={CONTACT.phoneHref}
                className="flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
              >
                <Phone className="size-4" aria-hidden="true" />
                {CONTACT.phoneDisplay}
              </a>
            </div>

            <dl className="mt-8 grid gap-4 border-t border-on-dark/15 pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 size-5 shrink-0 text-brand-green"
                  aria-hidden="true"
                />
                <div>
                  <dt className="eyebrow text-on-dark-soft">Taller</dt>
                  <dd className="mt-0.5 text-sm font-semibold">
                    {CONTACT.city}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock
                  className="mt-0.5 size-5 shrink-0 text-brand-green"
                  aria-hidden="true"
                />
                <div>
                  <dt className="eyebrow text-on-dark-soft">Horario</dt>
                  <dd className="mt-0.5 text-sm font-semibold">
                    {CONTACT.hours}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail
                  className="mt-0.5 size-5 shrink-0 text-brand-green"
                  aria-hidden="true"
                />
                <div>
                  <dt className="eyebrow text-on-dark-soft">Correo</dt>
                  <dd className="mt-0.5 text-sm font-semibold">
                    <a
                      href={CONTACT.emailHref}
                      className="rounded-sm underline underline-offset-4 transition-colors hover:text-brand-green"
                    >
                      {CONTACT.email}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
