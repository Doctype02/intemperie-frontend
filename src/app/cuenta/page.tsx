"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package2, MapPin, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Cuenta</h1>

      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </CardContent>
        </Card>

        <Link href="/cuenta/pedidos">
          <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Package2 className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="font-semibold">Mis Pedidos</h3>
              <p className="text-sm text-gray-500">Ver historial de pedidos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cuenta/direcciones">
          <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="font-semibold">Mis Direcciones</h3>
              <p className="text-sm text-gray-500">Gestionar direcciones de envío</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Accesos Rápidos</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/productos">Ver Productos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/calculadora">Calculadora de Cercas</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/carrito">Mi Carrito</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
