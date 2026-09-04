"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, statusInfo } from "@/components/shared/order-status";
import {
  formatCurrency,
  formatDate,
  getWhatsAppLink,
  generateOrderWhatsAppMessage,
} from "@/lib/utils";
import { getOrderById } from "@/lib/api/orders";
import type { Order } from "@/types";

/* Detalle de pedido. El portero de sesión es AccountShell; el estado usa el
 * badge compartido y su `hint` explica qué significa para el cliente. */

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch {
        router.push("/cuenta/pedidos");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <>
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-8 w-48 rounded bg-surface-2" />
          <div className="h-24 rounded-xl bg-surface-2" />
          <div className="h-24 rounded-xl bg-surface-2" />
        </div>
        <p role="status" className="sr-only">
          Cargando tu pedido…
        </p>
      </>
    );
  }

  if (!order) {
    return (
      <div className="rounded-xl border border-border bg-surface px-4 py-12 text-center sm:px-8">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Pedido no encontrado
        </h1>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/cuenta/pedidos">Volver a Mis Pedidos</Link>
        </Button>
      </div>
    );
  }

  const status = statusInfo(order.status);

  return (
    <div className="space-y-6">
      <Link
        href="/cuenta/pedidos"
        className="inline-flex min-h-tap items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Mis pedidos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="tabular text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <OrderStatusBadge status={order.status} />
          {status.hint && (
            <p className="mt-1.5 max-w-52 text-sm text-muted-foreground">
              {status.hint}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Package2 className="size-5" aria-hidden="true" /> Productos
            </h2>
            <ul className="mt-4">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.productName}
                    </p>
                    <p className="tabular text-sm text-muted-foreground">
                      {item.quantity}{" "}
                      {item.product?.unit === "METRO" ? "metros" : "unid."}
                    </p>
                  </div>
                  <span className="tabular font-medium text-foreground">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-semibold text-foreground">Dirección de Envío</h2>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.province}
                {order.shippingAddress.postalCode
                  ? ` ${order.shippingAddress.postalCode}`
                  : ""}
              </p>
              <p className="tabular">{order.shippingAddress.phone}</p>
            </div>
          </section>
        </div>

        <div>
          <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-semibold text-foreground">Resumen</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular text-foreground">
                  {formatCurrency(order.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">ITBMS</dt>
                <dd className="tabular text-foreground">{formatCurrency(order.tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className="tabular text-foreground">
                  {order.shipping === 0 ? "Gratis" : formatCurrency(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-bold text-foreground">
                <dt>Total</dt>
                <dd className="tabular">{formatCurrency(order.total)}</dd>
              </div>
            </dl>

            <Button asChild variant="whatsapp" className="w-full">
              <a
                href={getWhatsAppLink(generateOrderWhatsAppMessage(order.id))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle aria-hidden="true" />
                Consultar por WhatsApp
              </a>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
