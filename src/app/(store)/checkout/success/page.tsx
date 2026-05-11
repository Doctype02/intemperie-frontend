"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Pedido confirmado</h1>
          <p className="mt-2 text-gray-500">Tu pedido ha sido registrado exitosamente</p>

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left">
            <p className="font-semibold text-gray-900">Qué sigue:</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>1. Recibirás un correo con los detalles de tu pedido</li>
              <li>2. Nuestro equipo verificará el pedido y te contactará</li>
              <li>3. Coordinaremos la fecha de entrega e instalación</li>
            </ul>
            <p className="mt-4 text-sm text-gray-400">
              ¿Preguntas? Llámanos al <strong className="text-gray-600">+507 6287-4042</strong> o
              escribe a <strong className="text-gray-600">ventas@tiendasintemperie.com</strong>
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button className="bg-green-700 hover:bg-green-800" asChild>
              <Link href="/cuenta/pedidos">Mis pedidos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/productos">Seguir comprando</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
