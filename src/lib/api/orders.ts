import { request, ApiError } from "@/lib/api";
import type { Order, Address, CreateOrderPayload } from "@/types";

export async function getOrders(): Promise<Order[]> {
  return request<Order[]>("/orders");
}

export async function getOrderById(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAddresses(): Promise<Address[]> {
  return request<Address[]>("/addresses");
}

export async function createAddress(
  data: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Address> {
  return request<Address>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<Address> {
  return request<Address>(`/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  return request<void>(`/addresses/${id}`, { method: "DELETE" });
}

export async function setDefaultAddress(id: string): Promise<Address> {
  return request<Address>(`/addresses/${id}/default`, {
    method: "PATCH",
  });
}

/* ─── Pagos Tilopay ───────────────────────────────────────────────────────────
 *
 * El API exige autorización sobre la orden en TODOS los endpoints de pago:
 * o la sesión del dueño, o un "token de checkout" firmado y ligado al orderId.
 * Un comprador invitado no tiene sesión, así que sin ese token recibe un 404
 * indistinguible (el API no revela si el pedido existe) tanto al confirmar como
 * al consultar el estado.
 *
 * El token lo emite `POST /payments/tilopay/initiate` y hay que conservarlo
 * mientras el comprador se va a la pasarela y vuelve. Vive en `sessionStorage`
 * (misma pestaña, sobrevive a la navegación de ida y vuelta y al iframe de
 * retorno, que es del mismo origen) y va ligado al orderId para que dos pedidos
 * en la misma sesión no se pisen.
 */

/** Cabecera esperada por el API (ver `checkoutToken.ts` en el backend). */
const CHECKOUT_TOKEN_HEADER = "x-checkout-token";
const CHECKOUT_TOKEN_PREFIX = "intemperie-checkout-token:";

function checkoutTokenKey(orderId: string): string {
  return `${CHECKOUT_TOKEN_PREFIX}${orderId}`;
}

export function saveCheckoutToken(orderId: string, token: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(checkoutTokenKey(orderId), token);
  } catch {}
}

export function getCheckoutToken(orderId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(checkoutTokenKey(orderId));
  } catch {
    return null;
  }
}

/** Se llama cuando el pedido queda confirmado o cuando se abandona el pago. */
export function clearCheckoutToken(orderId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(checkoutTokenKey(orderId));
  } catch {}
}

function checkoutTokenHeaders(orderId: string): Record<string, string> {
  const token = getCheckoutToken(orderId);
  return token ? { [CHECKOUT_TOKEN_HEADER]: token } : {};
}

export interface OrderPaymentStatus {
  orderStatus: string;
  paymentStatus: string | null;
}

export interface InitiateTilopayResult {
  url: string;
  /** Credencial de vida corta ligada a esta orden; obligatoria para el invitado. */
  checkoutToken?: string;
}

export interface ConfirmTilopayResult {
  paymentStatus: "COMPLETED";
  orderStatus: "CONFIRMED";
  alreadyConfirmed: boolean;
}

/**
 * Error de negocio del API: el pago existe pero NO está aprobado (rechazado por
 * el banco o todavía sin liquidar). Es un 402, no un fallo de red: el comprador
 * necesita un mensaje distinto y no debe volver a pagar a ciegas.
 */
export function isPaymentNotApprovedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 402;
}

/** El invitado sin token (o con token caducado) recibe 404 indistinguible. */
export function isOrderUnauthorizedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

export async function getOrderPaymentStatus(orderId: string): Promise<OrderPaymentStatus> {
  return request<OrderPaymentStatus>(`/payments/order-status/${orderId}`, {
    headers: checkoutTokenHeaders(orderId),
  });
}

/**
 * Abre la transacción en Tilopay. Para un comprador sin sesión el API exige
 * `guestEmail`: debe coincidir con el correo con el que se creó el pedido.
 * El `checkoutToken` devuelto se guarda aquí mismo para que nadie olvide hacerlo.
 */
export async function initiateTilopay(
  orderId: string,
  options: { guestEmail?: string } = {}
): Promise<InitiateTilopayResult> {
  const token = getCheckoutToken(orderId);

  const result = await request<InitiateTilopayResult>("/payments/tilopay/initiate", {
    method: "POST",
    headers: checkoutTokenHeaders(orderId),
    body: JSON.stringify({
      orderId,
      ...(options.guestEmail ? { guestEmail: options.guestEmail } : {}),
      ...(token ? { checkoutToken: token } : {}),
    }),
  });

  if (result.checkoutToken) saveCheckoutToken(orderId, result.checkoutToken);

  return result;
}

export async function confirmTilopay(orderId: string, tpt: string): Promise<ConfirmTilopayResult> {
  const token = getCheckoutToken(orderId);

  return request<ConfirmTilopayResult>("/payments/tilopay/confirm", {
    method: "POST",
    headers: checkoutTokenHeaders(orderId),
    // El token va también en el cuerpo (el API lo acepta por cabecera, cuerpo o
    // query) por si algún proxy intermedio descarta cabeceras no estándar.
    body: JSON.stringify({ orderId, tpt, ...(token ? { checkoutToken: token } : {}) }),
  });
}
