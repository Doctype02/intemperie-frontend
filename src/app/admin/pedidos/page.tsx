"use client";

import { Fragment, useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "@/lib/api/admin";
import { OrderStatusBadge, statusInfo } from "@/components/shared/order-status";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* Pedidos — herramienta interna, sistema «Perímetro».
 *
 * El estado del pedido sale de `@/components/shared/order-status`: el mismo
 * badge que ve el cliente en /cuenta/pedidos, sin un cuarto mapa de colores
 * duplicado. Los importes llegan del backend como cadena decimal (Decimal
 * serializado) y se formatean con `formatMoney(string)`; nunca se pasan por
 * `parseFloat`, que reintroduciría el error binario en la pantalla donde se
 * decide si un cobro está bien.
 */

interface Order {
  id: string;
  userId?: string;
  status: string;
  total: string;
  subtotal: string;
  items?: Array<{ productName: string; quantity: number; totalPrice: string }>;
  user?: { name: string; email: string };
  createdAt: string;
}

/* Transiciones válidas — el contrato de siempre, sin cambios. */
const nextStatus: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getAdminOrders({ limit: 100 })
      .then((r) => setOrders((r as Order[]) || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setExpanded(null);
  };

  const filtered =
    statusFilter === "ALL" ? orders : orders.filter((o) => o.status === statusFilter);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusInfo(s).label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-card py-12 text-center text-sm text-muted-foreground">
          No hay pedidos
        </div>
      ) : (
        <>
          {/* Tabla densa en escritorio: una fila por pedido, expandible. */}
          <div className="hidden overflow-hidden rounded-xl border border-hairline bg-card shadow-xs lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-hairline bg-surface-2">
                <tr>
                  <Th>Pedido</Th>
                  <Th>Cliente</Th>
                  <Th>Fecha</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="text-right">Acción</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((order) => (
                  <Fragment key={order.id}>
                    <tr
                      className="cursor-pointer transition-colors hover:bg-surface-2"
                      onClick={() => toggle(order.id)}
                      aria-expanded={expanded === order.id}
                    >
                      <td className="px-4 py-3">
                        <span className="tabular font-mono text-xs text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="max-w-48 truncate px-4 py-3 text-foreground">
                        {order.user?.name || "Cliente"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {shortDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="tabular px-4 py-3 text-right font-semibold text-foreground">
                        {formatMoney(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <TransitionButtons order={order} onChange={handleStatusChange} />
                      </td>
                    </tr>
                    {expanded === order.id && order.items && (
                      <tr>
                        <td colSpan={6} className="bg-surface-2 px-4 py-3">
                          <OrderItems items={order.items} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas apiladas en móvil y tableta. */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-hairline bg-card p-4 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(order.id)}
                  aria-expanded={expanded === order.id}
                  className="flex min-h-tap w-full items-center gap-2 text-left"
                >
                  <span className="tabular font-mono text-xs text-muted-foreground">
                    #{order.id.slice(0, 8)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <span className="tabular ml-auto font-semibold text-foreground">
                    {formatMoney(order.total)}
                  </span>
                </button>
                <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                  <span>{order.user?.name || "Cliente"}</span>
                  <span>{shortDate(order.createdAt)}</span>
                </div>
                {expanded === order.id && order.items && (
                  <div className="mt-3 border-t border-hairline pt-3">
                    <OrderItems items={order.items} />
                  </div>
                )}
                {nextStatus[order.status] && (
                  <div className="mt-3 flex justify-end border-t border-hairline pt-3">
                    <TransitionButtons order={order} onChange={handleStatusChange} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2.5 text-left text-2xs font-semibold tracking-wide text-muted-foreground uppercase ${className}`}
    >
      {children}
    </th>
  );
}

/** Avance de estado con las transiciones válidas de siempre (`nextStatus`). */
function TransitionButtons({
  order,
  onChange,
}: {
  order: Order;
  onChange: (orderId: string, newStatus: string) => void;
}) {
  const targets = nextStatus[order.status];
  if (!targets) return null;
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {targets.map((s) => (
        <Button
          key={s}
          size="xs"
          variant="outline"
          className={
            s === "CANCELLED"
              ? "border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
              : undefined
          }
          onClick={(e) => {
            e.stopPropagation();
            onChange(order.id, s);
          }}
        >
          {statusInfo(s).label}
        </Button>
      ))}
    </div>
  );
}

function OrderItems({ items }: { items: NonNullable<Order["items"]> }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-hairline text-left text-2xs font-semibold tracking-wide text-muted-foreground uppercase">
          <th className="pb-2 font-semibold">Producto</th>
          <th className="pb-2 font-semibold">Cant.</th>
          <th className="pb-2 text-right font-semibold">Precio</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b border-hairline last:border-0">
            <td className="py-2 text-foreground">{item.productName}</td>
            <td className="tabular py-2 text-muted-foreground">{item.quantity}</td>
            <td className="tabular py-2 text-right text-foreground">
              {formatMoney(item.totalPrice)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
