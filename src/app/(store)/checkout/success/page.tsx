"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "000000";

  return (
    <>
      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle className="h-8 w-8 text-green-700" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
      <p className="text-gray-600 mb-2">
        Tu pedido ha sido registrado exitosamente.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Número de pedido: <span className="font-mono font-semibold">{orderId}</span>
      </p>

      <Card>
        <CardContent className="p-6 text-left space-y-3 text-sm">
          <p>
            <strong>¿Qué sigue?</strong>
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>1. Recibirás un correo de confirmación con los detalles de tu pedido.</li>
            <li>2. Nuestro equipo verificará el pedido y se pondrá en contacto contigo.</li>
            <li>3. Coordinaremos la fecha de entrega e instalación.</li>
          </ul>
          <p className="text-gray-500 mt-4">
            Si tienes preguntas, contáctanos al <strong>+507 6287-4042</strong> o
            escríbenos a <strong>ventas@tiendasintemperie.com</strong>
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center mt-8">
        <Button asChild className="bg-green-700 hover:bg-green-800">
          <Link href="/cuenta/pedidos">Ver Mis Pedidos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/productos">Seguir Comprando</Link>
        </Button>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 mb-6" />
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-8" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
