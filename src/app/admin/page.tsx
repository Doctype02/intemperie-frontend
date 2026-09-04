import { Suspense } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  DollarSign,
  FileText,
  Package,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shared/order-status";
import {
  AdminStatsUnauthorizedError,
  PENDING_ACTION,
  STATUS_LABELS,
  awaitsAction,
  formatAge,
  formatMoney,
  getAdminStats,
  type AdminStats,
  type AdminStatsOrder,
} from "./_data/stats";

/* Tablero del panel — sistema «Perímetro».
 *
 * DE CLIENTE A SERVIDOR
 * Antes esto era un componente de cliente que pedía `/admin/stats` en un
 * `useEffect`: montar, hidratar, y sólo entonces empezar el viaje al backend.
 * El esqueleto duraba lo que durase esa ida y vuelta desde el teléfono del
 * usuario, en cada visita, siempre.
 *
 * Ahora la lectura ocurre en el servidor (ver `_data/stats.ts`), donde la cookie
 * httpOnly de sesión sí es legible y donde el salto hasta la API es por la red
 * interna. La ida y vuelta pasa a ocurrir EN PARALELO con la entrega del
 * documento en vez de después de ella, y las cifras llegan ya escritas en el
 * HTML. No se ha tocado ni un permiso: `middleware.ts` sigue siendo quien
 * verifica la firma, la caducidad y el rol antes de que esta página exista.
 *
 * EL ARMAZÓN NO ESPERA
 * La cabecera y los accesos directos no dependen de la API, así que salen de
 * inmediato; sólo las cifras cuelgan de un `<Suspense>` y llegan en streaming.
 * Es el mismo reparto que el listado de la tienda.
 *
 * QUÉ SE CUENTA Y POR QUÉ EN ESE ORDEN
 * Esto es una pantalla de trabajo, no un informe. Quien la abre a las siete de
 * la mañana necesita saber qué le toca hacer, y eso va primero: los pedidos
 * recientes que esperan una acción, con la acción escrita al lado. Los totales
 * acumulados van después, porque son contexto, no tarea.
 *
 * Todo lo que se pinta sale de los seis campos que la API devuelve de verdad.
 * No hay gráficas de evolución ni comparativas con el mes pasado: harían falta
 * series temporales que `/admin/stats` no da, y una cifra inventada en una
 * pantalla de administración es peor que una pantalla vacía.
 */

export const metadata = {
  title: "Tablero · Panel",
};

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <p className="eyebrow text-muted-foreground">Panel de administración</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">Tablero</h1>
      </header>

      {/* En `xl` los accesos pasan a una columna lateral pegajosa: el ancho que
          en una pantalla grande se iba en aire ahora es densidad. Por debajo,
          el apilado de siempre: cola → totales → accesos. */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <Suspense fallback={<TableroSkeleton />}>
          <TableroDatos />
        </Suspense>
        <div className="xl:sticky xl:top-8">
          <AccesosDirectos />
        </div>
      </div>
    </div>
  );
}

/* ── La parte que espera a la API ────────────────────────────────────────── */

async function TableroDatos() {
  let stats: AdminStats;

  try {
    stats = await getAdminStats();
  } catch (error) {
    /* Un fallo aquí no se traga con un `?? 0`: un tablero que enseña ceros
       cuando no ha podido leer nada se lee como «no hay pedidos», que es lo
       contrario de la verdad. Se dice qué pasó y se deja el resto en pie. */
    return (
      <Aviso
        titulo={
          error instanceof AdminStatsUnauthorizedError
            ? "La sesión no autorizó la lectura de las cifras"
            : "No se pudieron leer las cifras"
        }
        detalle={
          error instanceof AdminStatsUnauthorizedError
            ? "Vuelve a cargar la página. Si sigue igual, cierra sesión y entra de nuevo."
            : "La API no respondió. Los accesos directos de abajo siguen funcionando."
        }
      />
    );
  }

  const pendientes = stats.recentOrders.filter(awaitsAction);

  /* Recuento por estado sobre la misma muestra de pedidos recientes: nada que
     la API no dé ya. El orden de aparición es el de llegada de los pedidos. */
  const porEstado = Array.from(
    stats.recentOrders.reduce(
      (acc, order) => acc.set(order.status, (acc.get(order.status) ?? 0) + 1),
      new Map<string, number>()
    )
  );

  return (
    <div className="space-y-4">
      <ColaDeTrabajo
        pendientes={pendientes}
        muestra={stats.recentOrders.length}
        porEstado={porEstado}
      />
      <Totales stats={stats} />
    </div>
  );
}

/* ── Lo accionable ───────────────────────────────────────────────────────── */

/** El ámbar del sistema está reservado a lo que urge de verdad; aquí urge. */
function EstadoBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "PENDING" ? "accent" : "outline"} size="sm">
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

function ColaDeTrabajo({
  pendientes,
  muestra,
  porEstado,
}: {
  pendientes: AdminStatsOrder[];
  muestra: number;
  porEstado: Array<[string, number]>;
}) {
  return (
    <section
      aria-labelledby="cola-titulo"
      className="overflow-hidden rounded-xl border border-hairline bg-card shadow-xs"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-hairline px-4 py-3">
        <ClipboardList className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <h2 id="cola-titulo" className="font-heading text-lg font-bold text-foreground">
          Esperando acción
        </h2>
        {pendientes.length > 0 && (
          <span className="tabular rounded-md bg-secondary px-2 py-0.5 text-sm font-bold text-secondary-foreground">
            {pendientes.length}
          </span>
        )}
      </div>

      {pendientes.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          Ninguno de los <span className="tabular">{muestra}</span> pedidos más recientes
          espera una acción. Nada que despachar por aquí.
        </p>
      ) : (
        <ul className="divide-y divide-hairline">
          {/* Dos líneas fijas por fila en lugar de una que se parte sola: con
              `flex-wrap` el orden de corte dependía del ancho del texto de cada
              estado, y a 360px la fila salía distinta en cada pedido. */}
          {pendientes.map((order) => (
            <li key={order.id} className="flex min-h-tap flex-col justify-center gap-1 px-4 py-3">
              <div className="flex items-center gap-2">
                {/* El identificador corto es lo que se busca luego en Pedidos:
                    tabular para que las ocho cifras se alineen entre filas. */}
                <span className="tabular font-mono text-xs text-muted-foreground">
                  #{order.id.slice(0, 8)}
                </span>
                <EstadoBadge status={order.status} />
                <span className="tabular ml-auto text-sm font-semibold text-foreground">
                  {formatMoney(order.total)}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                {/* La acción, escrita. El estado dice dónde está el pedido;
                    esto dice qué se hace con él, que es la pregunta real. */}
                <span className="text-sm font-medium text-foreground">
                  {PENDING_ACTION[order.status]}
                </span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {formatAge(order.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* La muestra reciente contada por estado, como chips-enlace al listado.
          Van encima del pie porque la nota de «sobre los N más recientes»
          también los describe — decirla dos veces sería ruido. */}
      {porEstado.length > 0 && (
        <div className="border-t border-hairline px-4 py-3">
          <ul className="flex flex-wrap gap-2" aria-label="Pedidos recientes por estado">
            {porEstado.map(([status, n]) => (
              <li key={status}>
                <Link
                  href="/admin/pedidos"
                  className="flex min-h-tap items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary"
                >
                  <OrderStatusBadge status={status} /> <span className="tabular">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* La API devuelve una muestra de pedidos recientes, no la cola entera.
          Decirlo es la diferencia entre un dato y una cifra inventada: quien
          lee «3» debe saber que son 3 de los últimos N, no 3 en total. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-surface-2 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Sobre los <span className="tabular">{muestra}</span> pedidos más recientes que
          devuelve la API, no sobre el total.
        </p>
        <Link
          href="/admin/pedidos"
          /* El realce al pasar el cursor es subrayado, no un verde más oscuro:
             `brand-green-deep` se aclara en modo oscuro por debajo del fondo de
             esta banda y el enlace se apagaba justo al señalarlo. */
          className="inline-flex min-h-tap items-center gap-1.5 rounded-lg px-1 font-heading text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Ver todos los pedidos
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/* ── El contexto ─────────────────────────────────────────────────────────── */

function Totales({ stats }: { stats: AdminStats }) {
  const celdas = [
    { label: "Pedidos", value: String(stats.totalOrders), icon: ShoppingBag },
    { label: "Ingresos", value: formatMoney(stats.totalRevenue), icon: DollarSign },
    { label: "Productos", value: String(stats.productsCount), icon: Package },
    { label: "Usuarios", value: String(stats.usersCount), icon: Users },
  ];

  /* Confirmados sobre totales: no es una métrica nueva, es la razón entre dos
     campos que la API ya devuelve. Por eso se dan los dos números al lado de la
     barra —la barra es el resumen, no la fuente. */
  const share =
    stats.totalOrders > 0
      ? Math.min(100, Math.round((stats.confirmedOrders / stats.totalOrders) * 100))
      : 0;

  return (
    <section
      aria-labelledby="totales-titulo"
      className="overflow-hidden rounded-xl border border-hairline bg-card shadow-xs"
    >
      <h2 id="totales-titulo" className="sr-only">
        Totales
      </h2>

      {/* Los iconos van en tinta apagada, sin pastilla de color: cuatro chips de
          colores distintos sugerían una codificación que no significaba nada.

          Las divisiones son `gap-px` sobre el color de línea, no `divide-x`:
          en una retícula, `divide-x` reparte el borde por orden del DOM y en
          dos columnas se lo pone también a la primera celda de la segunda fila.
          Con el hueco pintado, las reglas salen correctas en 2 y en 4 columnas. */}
      <dl className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
        {celdas.map((celda) => (
          <div key={celda.label} className="bg-card px-4 py-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <celda.icon className="size-3.5 shrink-0" aria-hidden="true" />
              {celda.label}
            </dt>
            <dd className="tabular mt-1 font-heading text-2xl font-bold text-foreground">
              {celda.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-hairline px-4 py-3">
        <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Confirmados</span>
          <span className="tabular">
            {stats.confirmedOrders} de {stats.totalOrders}
          </span>
          <span className="tabular ml-auto">{share}%</span>
        </p>
        <div
          aria-hidden="true"
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunk"
        >
          <div className="h-full rounded-full bg-chart-1" style={{ width: `${share}%` }} />
        </div>
      </div>
    </section>
  );
}

/* ── Lo que se hace a diario ─────────────────────────────────────────────── */

const accesos = [
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    hint: "Confirmar, preparar y enviar",
    icon: ShoppingBag,
  },
  {
    href: "/admin/productos/nuevo",
    label: "Nuevo producto",
    hint: "Dar de alta una ficha",
    icon: Plus,
  },
  {
    href: "/admin/productos",
    label: "Productos",
    hint: "Precios, fotos y existencias",
    icon: Package,
  },
  {
    href: "/admin/contenido",
    label: "Contenido",
    hint: "Textos de la tienda",
    icon: FileText,
  },
];

/**
 * Los cuatro destinos del día a día. No repiten la barra lateral por capricho:
 * en el teléfono la barra está escondida detrás del botón del cajón, así que
 * sin esto cada tarea empieza con dos toques y una lista de siete secciones.
 */
function AccesosDirectos() {
  return (
    <section aria-labelledby="accesos-titulo">
      <h2 id="accesos-titulo" className="eyebrow mb-3 text-muted-foreground">
        Ir a
      </h2>
      {/* Apilado: dos columnas desde `sm`. En la columna lateral de `xl`,
          de nuevo una sola, que es lo que cabe en 20rem. */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {accesos.map((acceso) => (
          <li key={acceso.href}>
            <Link
              href={acceso.href}
              className="group flex min-h-tap items-center gap-3 rounded-xl border border-hairline bg-card px-4 py-3 shadow-xs transition-colors hover:border-primary hover:bg-surface-2"
            >
              <acceso.icon
                className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block font-heading text-sm font-semibold text-foreground">
                  {acceso.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {acceso.hint}
                </span>
              </span>
              <ArrowRight
                className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Estados de espera y de fallo ────────────────────────────────────────── */

function Aviso({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div
      role="status"
      className="flex gap-3 rounded-xl border border-brand-amber bg-brand-amber-soft px-4 py-3"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
      <div>
        <p className="font-heading text-sm font-bold text-accent-foreground">{titulo}</p>
        <p className="mt-0.5 text-xs text-accent-foreground">{detalle}</p>
      </div>
    </div>
  );
}

/**
 * Hueco mientras responde `/admin/stats`.
 *
 * Reproduce las dos tarjetas reales con sus alturas y sus divisiones, no cuatro
 * rectángulos genéricos: un esqueleto que no promete la pantalla que llega es
 * un salto de maquetación anunciado. El pulso va una sola vez en el contenedor
 * —es opacidad, la resuelve el compositor— y `prefers-reduced-motion` lo
 * neutraliza desde `globals.css`.
 */
function TableroSkeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        Cargando las cifras del panel…
      </p>

      <div aria-hidden="true" className="animate-pulse space-y-4">
        <div className="overflow-hidden rounded-xl border border-hairline bg-card shadow-xs">
          <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
            <div className="size-4 rounded-sm bg-muted" />
            <div className="h-5 w-40 rounded-sm bg-muted" />
          </div>
          <div className="divide-y divide-hairline">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex min-h-tap flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-16 rounded-sm bg-muted" />
                  <div className="h-5 w-20 rounded-sm bg-muted" />
                  <div className="ml-auto h-4 w-16 rounded-sm bg-muted" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-36 rounded-sm bg-muted" />
                  <div className="ml-auto h-3 w-12 rounded-sm bg-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-hairline bg-surface-2 px-4 py-3">
            <div className="h-4 w-56 rounded-sm bg-muted" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-hairline bg-card shadow-xs">
          <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-card px-4 py-4">
                <div className="h-3 w-20 rounded-sm bg-muted" />
                <div className="mt-2 h-7 w-24 rounded-sm bg-muted" />
              </div>
            ))}
          </div>
          <div className="border-t border-hairline px-4 py-3">
            <div className="h-3 w-40 rounded-sm bg-muted" />
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </>
  );
}
