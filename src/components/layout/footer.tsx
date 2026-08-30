import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

import { COLECCIONES, CONTACT, MALLAS, WA_MESSAGE } from "./nav-data"

/* Pie — sistema «Perímetro».
 *
 * Qué se ha ido y por qué:
 *
 * · **La banda de ventajas.** Repetía las mismas cuatro promesas que ya está
 *   dando la portada cuatro pantallas más arriba, y una de ellas —«instalación
 *   incluida»— contradice al precio, que es de material. El pie no es sitio
 *   para volver a vender: es sitio para que quien ha bajado hasta aquí
 *   encuentre el teléfono.
 *
 * · **Los tres iconos sociales.** Eran `<span>` sin enlace con el título
 *   «(próximamente)». Un icono de Facebook que no lleva a Facebook gasta un
 *   clic y una pizca de confianza cada vez. Cuando existan los perfiles,
 *   vuelven.
 *
 * · **El boletín.** Era una isla de cliente con dos `useState` cuyo envío
 *   abría el gestor de correo del visitante con un `mailto:` prerredactado
 *   para que él mismo pidiera que lo suscribieran. No hay lista de correo
 *   detrás. Se sustituye por los dos canales que sí existen y que sí atiende
 *   alguien: WhatsApp y teléfono. De paso, el pie deja de hidratar nada.
 *
 * Qué se ha corregido:
 *
 * · **El contraste.** Todo el texto usaba `text-muted-foreground` sobre azul
 *   marino: en modo claro eso es #59656f sobre #03162e, unos 2.4:1, por debajo
 *   del mínimo de 4.5:1 y prácticamente ilegible a pleno sol —que es donde
 *   trabaja este cliente—. Ahora usa `on-dark-soft`, que es el token del
 *   sistema para texto secundario sobre superficie oscura.
 *
 * · **El origen de los enlaces.** Las listas de producto estaban escritas a
 *   mano y ya no coincidían con la cabecera. Salen de `nav-data`, igual que la
 *   navegación: un cambio de modelo se hace en un sitio.
 */

const columns: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Cercado por uso",
    links: COLECCIONES.map((c) => ({
      label: c.name,
      href: `/productos?category=${c.slug}`,
    })),
  },
  {
    title: "Malla electrosoldada",
    links: [
      ...MALLAS.map((m) => ({
        label: `${m.name} · ${m.spec}`,
        href: `/productos/${m.slug}`,
      })),
      { label: "Todo el catálogo", href: "/productos" },
    ],
  },
  {
    title: "Comprar",
    links: [
      { label: "Calculadora de metros", href: "/calculadora" },
      { label: "Política de envíos", href: "/envios" },
      { label: "Devoluciones", href: "/devoluciones" },
      { label: "Mi cuenta", href: "/cuenta" },
      { label: "Mis pedidos", href: "/cuenta/pedidos" },
    ],
  },
  {
    title: "Intemperie",
    links: [
      { label: "Quiénes somos", href: "/nosotros" },
      { label: "Instaladores", href: "/instaladores" },
      { label: "Inspecciones", href: "/inspecciones" },
      { label: "Términos y condiciones", href: "/terminos" },
      { label: "Privacidad", href: "/privacidad" },
    ],
  },
]

/* Los seis métodos que el proceso de pago acepta de verdad: pasarela Tilopay
   (Visa, Mastercard, Clave), Yappy, transferencia y efectivo contra entrega. */
const PAYMENTS = ["Visa", "Mastercard", "Clave", "Yappy", "Transferencia", "Efectivo"]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-navy-deep text-on-dark-soft">
      <div className="picket-rule" aria-hidden="true" />

      <div className="shell py-10 lg:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-10">
          {/* Columna de marca y contacto */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center rounded-sm">
              <span className="font-heading text-xl leading-none font-bold tracking-[-0.04em] text-on-dark select-none">
                INTEM<span className="text-brand-green">PERIE</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-dark-soft">
              Fabricación, venta e instalación de cercas de PVC y malla
              electrosoldada, con cobertura en todo Panamá.
            </p>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={CONTACT.phoneHref}
                  className="flex items-center gap-2.5 text-on-dark transition-colors hover:text-brand-green"
                >
                  <Phone className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
                  <span className="font-semibold tabular-nums">{CONTACT.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref(WA_MESSAGE.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition-colors hover:text-brand-green"
                >
                  <IconWhatsApp className="size-4 shrink-0 text-brand-green" />
                  Escribir por WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.emailHref}
                  className="flex items-center gap-2.5 transition-colors hover:text-brand-green"
                >
                  <Mail className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-green" aria-hidden="true" />
                <span>{CONTACT.city}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-green" aria-hidden="true" />
                <span>{CONTACT.hours}</span>
              </li>
            </ul>
          </div>

          {/* Columnas de enlaces */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow text-on-dark">{col.title}</h2>
              <ul className="mt-3.5 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm leading-snug text-on-dark-soft transition-colors hover:text-brand-green"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col gap-4 border-t border-on-dark/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="order-2 text-xs text-on-dark-soft sm:order-1">
            © {year} Intemperie. Cercas de PVC y malla electrosoldada, Panamá.
          </p>
          <div className="order-1 flex flex-wrap items-center gap-1.5 sm:order-2">
            <span className="mr-1 text-2xs text-on-dark-soft">Formas de pago</span>
            {PAYMENTS.map((method) => (
              <span
                key={method}
                className="rounded-sm border border-on-dark/20 px-2 py-1 text-2xs font-semibold text-on-dark-soft"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
