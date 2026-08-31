import type { OrderStatus } from "@/types";

/* Estado de pedido — una sola definición para el listado y el detalle.
 *
 * Antes vivía duplicada en dos ficheros con seis colores de Tailwind cada uno
 * (amarillo, azul, morado, cian, verde, rojo), ninguno del sistema. Con la
 * paleta «Perímetro» el estado se lee por rol, no por variedad cromática:
 * verde lo que está resuelto, ámbar lo que está en marcha, azul lo que está
 * en tránsito, gris lo que ya no sigue su curso.
 */

interface StatusStyle {
  label: string;
  /** Qué significa para el cliente, en una línea. */
  hint: string;
  className: string;
}

const STATUS: Record<OrderStatus, StatusStyle> = {
  PENDING: {
    label: "Pendiente",
    hint: "Recibimos tu pedido. Falta confirmar el pago.",
    className: "bg-brand-amber-soft text-warning border-brand-amber/40",
  },
  CONFIRMED: {
    label: "Confirmado",
    hint: "Pago confirmado. Estamos preparando tu pedido.",
    className: "bg-brand-navy-soft text-brand-navy border-brand-navy/25",
  },
  PROCESSING: {
    label: "En preparación",
    hint: "Tu pedido se está alistando en el almacén.",
    className: "bg-brand-navy-soft text-brand-navy border-brand-navy/25",
  },
  SHIPPED: {
    label: "En camino",
    hint: "Tu pedido salió hacia la dirección de entrega.",
    className: "bg-brand-navy-soft text-brand-navy border-brand-navy/25",
  },
  DELIVERED: {
    label: "Entregado",
    hint: "Pedido entregado.",
    className: "bg-brand-green-soft text-brand-green-deep border-brand-green/35",
  },
  CANCELLED: {
    label: "Cancelado",
    hint: "Este pedido fue cancelado.",
    className: "bg-surface-2 text-muted-foreground border-border",
  },
};

export function statusInfo(status: OrderStatus | string): StatusStyle {
  return (
    STATUS[status as OrderStatus] ?? {
      label: String(status),
      hint: "",
      className: "bg-surface-2 text-muted-foreground border-border",
    }
  );
}

export function OrderStatusBadge({
  status,
  className = "",
}: {
  status: OrderStatus | string;
  className?: string;
}) {
  const { label, className: tone } = statusInfo(status);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tone} ${className}`}
    >
      {label}
    </span>
  );
}
