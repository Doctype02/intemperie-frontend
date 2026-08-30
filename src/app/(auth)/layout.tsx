import Link from "next/link";
import { ArrowLeft, Lock, MessageCircle, PackageSearch, Ruler } from "lucide-react";

/* Chrome compartido de /login y /registro — sistema «Perímetro».
 *
 * El acceso no lleva la cabecera de tienda: son las dos únicas pantallas del
 * sitio con una sola tarea. Menos navegación, menos abandono. Lo que sí lleva
 * es la marca (para saber dónde se está escribiendo una contraseña) y una
 * salida evidente hacia la tienda.
 *
 * El panel azul de la derecha sólo aparece a partir de lg: en móvil ocuparía
 * el primer viewport entero y empujaría el formulario bajo el pliegue.
 */

const panelPoints = [
  {
    Icon: PackageSearch,
    title: "Tus pedidos, en un sitio",
    body: "Consulta el estado de cada pedido y repite los que ya hiciste.",
  },
  {
    Icon: Ruler,
    title: "Medidas guardadas",
    body: "Direcciones de obra y datos de contacto listos para el próximo pedido.",
  },
  {
    Icon: MessageCircle,
    title: "Seguimiento por WhatsApp",
    body: "Cerramos por WhatsApp: la cuenta guarda el hilo, no lo sustituye.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-sunk">
      <header className="border-b border-border bg-surface">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 rounded-sm text-[22px] leading-none font-black tracking-[-0.04em] text-foreground select-none"
          >
            INTEM<span className="text-brand-green-deep">PERIE</span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand-green-deep"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Volver a la tienda</span>
            <span className="sm:hidden">Tienda</span>
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex flex-1 items-center justify-center py-section-sm">
        <div className="shell grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <div className="mx-auto w-full max-w-md lg:mx-0">{children}</div>

          {/* Panel de marca — sólo escritorio */}
          <aside className="mesh-rule hidden overflow-hidden rounded-2xl bg-brand-navy p-8 lg:block xl:p-10">
            <p className="eyebrow text-brand-amber">Intemperie · La Chorrera</p>
            <p className="mt-3 font-heading text-2xl leading-tight font-bold text-on-dark">
              Cercas de PVC y malla electrosoldada, con quien las instala.
            </p>
            <ul className="mt-8 space-y-6">
              {panelPoints.map(({ Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-on-dark/10">
                    <Icon className="h-5 w-5 text-brand-mint" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-on-dark">{title}</span>
                    <span className="mt-0.5 block text-sm text-on-dark-soft">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-8 flex items-center gap-2 border-t border-on-dark/15 pt-6 text-xs text-on-dark-soft">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Conexión cifrada. Nunca pedimos tu contraseña por WhatsApp ni por
              teléfono.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
