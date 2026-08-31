import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function calculateItemTotal(
  quantity: number,
  unit: "meters" | "panels",
  pricePerMeter: number,
  pricePerPanel: number | null,
  panelWidth: number | null
): number {
  if (unit === "meters") {
    return quantity * pricePerMeter;
  }
  const panelPrice = pricePerPanel ?? pricePerMeter * (panelWidth ?? 2.5);
  return quantity * panelPrice;
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50762874042";

export function getWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function generateOrderWhatsAppMessage(orderId: string): string {
  return `¡Hola Intemperie! Quisiera consultar sobre mi pedido #${orderId}`;
}

export function generateProductWhatsAppMessage(productName: string): string {
  return `¡Hola! Me interesa cotizar el producto: ${productName}. ¿Podrían darme más información?`;
}

/* ─── Dinero que viene del servidor ───────────────────────────────────────────
 *
 * `POST /cart/quote` devuelve los importes como cadena decimal ("5.99") porque
 * el backend los calcula en decimal exacto. Pasarlos por `Number` para
 * enseñarlos reintroduce el error binario del punto flotante justo en la
 * pantalla donde el comprador comprueba cuánto se le va a cobrar, así que aquí
 * sólo se maquilla el texto: se separan los miles y se deja la parte decimal
 * intacta, sin aritmética de por medio.
 */
export function formatMoney(amount: string): string {
  const negative = amount.startsWith("-");
  const [whole = "0", decimals = "00"] = amount.replace(/^[-+]/, "").split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}$${grouped}.${decimals.padEnd(2, "0").slice(0, 2)}`;
}

/**
 * "0.07" → "7%". La tasa la manda el servidor para que el rótulo no mienta si
 * el ITBMS cambia; aquí sí se puede usar `Number` porque el resultado es una
 * etiqueta, no un importe que nadie va a pagar.
 */
export function formatTaxRatePercent(rate: string): string {
  const percent = Math.round(Number(rate) * 10000) / 100;
  return `${Number.isFinite(percent) ? percent : 0}%`;
}

/* Los importes del servidor se comparan y se restan en céntimos enteros.
 *
 * Hace falta para lo que el API no manda: cuánto le falta al carrito para el
 * envío gratis. `500.00 - 449.10` en punto flotante da 50.900000000000006, y esa
 * cifra acaba impresa en «Agrega $X más para envío gratis». En enteros no hay
 * arrastre posible. Nunca para recalcular impuesto, envío o total: esos vienen
 * dados y no se tocan. */
export function moneyToCents(amount: string): number {
  const [whole = "0", decimals = "0"] = amount.replace(/^\+/, "").split(".");
  const sign = whole.startsWith("-") ? -1 : 1;
  const wholeCents = Math.abs(parseInt(whole, 10) || 0) * 100;
  const fraction = parseInt(decimals.padEnd(2, "0").slice(0, 2), 10) || 0;
  return sign * (wholeCents + fraction);
}

export function centsToMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(Math.round(cents));
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}
