"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Package2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { getOrders } from "@/lib/api/orders";
import type { Order } from "@/types";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

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
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

      {fetchError ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Error al cargar pedidos</h3>
          <p className="text-gray-500 mt-1 mb-6">No pudimos conectarnos. Verifica tu conexión e intenta de nuevo.</p>
          <Button className="bg-green-700 hover:bg-green-800" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package2 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No tienes pedidos aún</h3>
          <p className="text-gray-500 mt-1 mb-6">
            Explora nuestro catálogo y realiza tu primer pedido.
          </p>
          <Button asChild className="bg-green-700 hover:bg-green-800">
            <Link href="/productos">Ver Productos</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateShort(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status] || ""}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/cuenta/pedidos/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
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
