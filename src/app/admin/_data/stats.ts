import { cookies } from "next/headers";
import { serverApiBase } from "@/app/(store)/_data/api-base";

/* Cifras del panel, leídas desde el servidor.
 *
 * POR QUÉ SE PUEDE HACER EN SERVIDOR
 * La sesión vive en una cookie httpOnly (`accessToken`). «httpOnly» significa
 * que no la ve el JavaScript del navegador; el servidor sí, y de hecho ya la
 * lee: `middleware.ts` la verifica con `jwtVerify` y exige rol ADMIN antes de
 * dejar entrar a `/admin/*`. Por tanto, cuando este módulo se ejecuta, el token
 * ya ha sido validado en firma, caducidad y rol en el mismo request. Aquí sólo
 * se reenvía a la API tal cual, sin decidir nada sobre permisos: quien autoriza
 * sigue siendo el middleware y, detrás, el backend.
 *
 * Se manda por las dos vías que `lib/api.ts` usa en el navegador —cabecera
 * `Authorization` y cookie— porque el backend acepta ambas y así el contrato es
 * idéntico se pida desde donde se pida. Del tarro de cookies se reenvía SÓLO
 * `accessToken`: el resto (carrito, preferencias) no tiene nada que hacer en
 * una llamada de administración.
 *
 * POR QUÉ `no-store` Y NO EL PATRÓN DEL CATÁLOGO
 * El catálogo se cachea con TTL y etiquetas porque es público e igual para
 * todos. Esto es una respuesta autenticada de un panel de trabajo: guardarla en
 * la caché compartida de rutas sería servir cifras de una sesión en otra. Y un
 * número de pedidos con diez minutos de retraso en la pantalla desde la que se
 * despachan pedidos no es una optimización, es un error.
 *
 * Leer `cookies()` marca además la ruta como dinámica, así que `next build` no
 * intenta prerenderizar el panel ni llamar a la API durante la construcción.
 */

/** Contrato tal como lo declara `lib/api/admin.ts`. Ni un campo más. */
export interface AdminStats {
  totalOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  productsCount: number;
  usersCount: number;
  recentOrders: AdminStatsOrder[];
}

export interface AdminStatsOrder {
  id: string;
  total: string;
  status: string;
  createdAt: string;
}

/** La API contestó, pero dijo que esta sesión no puede leer esto. */
export class AdminStatsUnauthorizedError extends Error {
  constructor() {
    super("La API rechazó la sesión al pedir las cifras del panel");
    this.name = "AdminStatsUnauthorizedError";
  }
}

/** No hubo respuesta utilizable: red caída, 5xx o JSON ilegible. */
export class AdminStatsUnavailableError extends Error {
  constructor(detail: string, cause?: unknown) {
    super(`No se pudieron leer las cifras del panel: ${detail}`);
    this.name = "AdminStatsUnavailableError";
    this.cause = cause;
  }
}

/** La API envuelve todo en `{ success, data }`. */
type Envelope<T> = { success?: boolean; data?: T };

export async function getAdminStats(): Promise<AdminStats> {
  const accessToken = (await cookies()).get("accessToken")?.value;

  /* Sin cookie no se inventa una llamada anónima que la API contestaría con un
     401 igualmente. Es el mismo desenlace que un 401, y se cuenta igual. */
  if (!accessToken) throw new AdminStatsUnauthorizedError();

  let res: Response;
  try {
    res = await fetch(`${serverApiBase()}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });
  } catch (err) {
    throw new AdminStatsUnavailableError("la API no respondió", err);
  }

  if (res.status === 401 || res.status === 403) throw new AdminStatsUnauthorizedError();
  if (!res.ok) throw new AdminStatsUnavailableError(`la API devolvió ${res.status}`);

  let body: Envelope<AdminStats> | null;
  try {
    body = (await res.json()) as Envelope<AdminStats>;
  } catch (err) {
    throw new AdminStatsUnavailableError("la respuesta no era JSON", err);
  }

  if (!body?.data) throw new AdminStatsUnavailableError("la respuesta venía sin datos");

  return body.data;
}

/* ── Lectura de los pedidos ──────────────────────────────────────────────── */

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

/**
 * Qué queda por hacer en cada estado. Es la misma máquina de estados que
 * gobierna los botones de `/admin/pedidos`: si desde un estado se puede
 * avanzar, el pedido espera a alguien. `DELIVERED` y `CANCELLED` no aparecen
 * porque son finales, y por eso un pedido en esos estados no es trabajo.
 *
 * No es una métrica inventada: sale de comparar el `status` que devuelve la API
 * con las transiciones que el propio panel ofrece.
 */
export const PENDING_ACTION: Record<string, string> = {
  PENDING: "Confirmar o cancelar",
  CONFIRMED: "Pasar a preparación",
  PROCESSING: "Marcar como enviado",
  SHIPPED: "Confirmar la entrega",
};

export function awaitsAction(order: AdminStatsOrder): boolean {
  return order.status in PENDING_ACTION;
}

/** Dólares con dos decimales y separador local. La tienda cobra en USD. */
export function formatMoney(value: number | string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("es-PA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * «hoy», «ayer», «hace 4 días» y, a partir de ahí, la fecha.
 *
 * En una cola de trabajo importa la antigüedad, no el día exacto: «hace 4 días»
 * se lee como un retraso y «12/8/2026» hay que restarlo mentalmente. Se fija la
 * zona horaria de Panamá porque el servidor corre en UTC y, sin ella, un pedido
 * de las 20:00 de ayer aparecía ya como de hoy.
 */
export function formatAge(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";

  /* `en-CA` da YYYY-MM-DD, y `Date.parse` de una fecha sin hora la sitúa en la
     medianoche UTC: restar dos de esas medianoches da días civiles exactos, sin
     que la hora del día desplace la cuenta. */
  const civil = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Panama" });
  const days = Math.round((Date.parse(civil(new Date())) - Date.parse(civil(then))) / 86_400_000);

  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;

  return then.toLocaleDateString("es-PA", { timeZone: "America/Panama" });
}
