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
