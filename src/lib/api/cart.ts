import { request } from "@/lib/api";
import type { Cart } from "@/types";

export async function getCart(): Promise<Cart> {
  return request<Cart>("/cart");
}

export async function addToCart(data: {
  productId: string;
  quantity: number;
}): Promise<Cart> {
  return request<Cart>("/cart/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCartItem(
  itemId: string,
  data: { quantity: number }
): Promise<Cart> {
  return request<Cart>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function removeCartItem(itemId: string): Promise<void> {
  return request<void>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<void> {
  return request<void>("/cart", {
    method: "DELETE",
  });
}

/* ─── Cotización del carrito ──────────────────────────────────────────────────
 *
 * El impuesto, el envío y el total son reglas de negocio del backend (ITBMS,
 * tarifa de envío y umbral de envío gratis). Replicarlas en el cliente ya nos
 * costó que el carrito y el checkout enseñaran cifras distintas para el mismo
 * pedido: el comprador veía aparecer un cargo en el último paso. Este endpoint
 * es la única fuente de esas tres cifras.
 *
 * Los importes llegan como cadena a propósito: el backend los calcula en
 * decimal exacto y un `Number` intermedio reintroduce el error binario que
 * precisamente se quiere evitar. Se formatean, no se recalculan.
 */
export interface CartQuoteItem {
  productId: string;
  quantity: number;
}

export interface CartQuote {
  /** Importes en formato decimal con dos posiciones, tal cual los da el API. */
  subtotal: string;
  tax: string;
  /** Fracción, no porcentaje: "0.07". Alimenta el rótulo «ITBMS (7%)». */
  taxRate: string;
  shipping: string;
  /** Único criterio válido para decidir si el envío sale gratis. */
  shippingIsFree: boolean;
  freeShippingThreshold: string;
  total: string;
  currency: string;
}

/**
 * Ruta pública: no exige sesión. `skipAuthRedirect` evita que un 401 accidental
 * (proxy, cookie corrupta) expulse al comprador del embudo hacia /login por
 * consultar un precio.
 */
export async function getCartQuote(
  items: CartQuoteItem[],
  signal?: AbortSignal
): Promise<CartQuote> {
  return request<CartQuote>("/cart/quote", {
    method: "POST",
    body: JSON.stringify({ items }),
    skipAuthRedirect: true,
    signal,
  });
}
