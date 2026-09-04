"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/shared/order-status";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { getOrders } from "@/lib/api/orders";
import type { Order } from "@/types";

/* Mis pedidos. El portero de sesión es AccountShell; aquí sólo se pide la
 * lista. El estado de cada pedido usa el badge compartido del sistema. */

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data || []);
      } catch {
        setFetchError(true);
        toast.error("No se pudieron cargar tus pedidos. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Mis pedidos</h1>
        {!loading && !fetchError && orders.length > 0 && (
          <p className="tabular text-sm text-muted-foreground">
            {orders.length === 1 ? "1 pedido" : `${orders.length} pedidos`}
          </p>
        )}
      </div>

      {loading ? (
        <>
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
          <p role="status" className="sr-only">
            Cargando tus pedidos…
          </p>
        </>
      ) : fetchError ? (
        <div className="rounded-xl border border-border bg-surface px-4 py-12 text-center sm:px-8">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-surface-2">
            <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Error al cargar pedidos</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            No pudimos conectarnos. Verifica tu conexión e intenta de nuevo.
          </p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface px-4 py-12 text-center sm:px-8">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-surface-2">
            <Package2 className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">No tienes pedidos aún</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Explora nuestro catálogo y realiza tu primer pedido.
          </p>
          <Button asChild>
            <Link href="/productos">Ver Productos</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm text-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="tabular text-sm text-muted-foreground">
                    {formatDateShort(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="tabular text-right font-medium text-foreground">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/cuenta/pedidos/${order.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
