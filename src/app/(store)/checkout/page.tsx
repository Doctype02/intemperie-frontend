"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { AddressForm } from "@/components/checkout/address-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentSection } from "@/components/checkout/payment-section";
import type { AddressInput } from "@/lib/validators";

type Step = "address" | "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const [step, setStep] = useState<Step>("address");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [addressData, setAddressData] = useState<AddressInput | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia Sesión para Continuar</h1>
        <p className="text-gray-600 mb-6">Debes iniciar sesión para completar tu compra.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push("/login")} className="bg-green-700 hover:bg-green-800">
            Iniciar Sesión
          </Button>
          <Button onClick={() => router.push("/registro")} variant="outline">
            Registrarse
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrito Vacío</h1>
        <p className="text-gray-600 mb-6">Agrega productos antes de continuar con la compra.</p>
        <Button onClick={() => router.push("/productos")} className="bg-green-700 hover:bg-green-800">
          Ver Productos
        </Button>
      </div>
    );
  }

  const handleAddressSubmit = (data: AddressInput) => {
    setAddressData(data);
    setShippingAddress(`${data.street}, ${data.city}, ${data.state}`);
    setStep("review");
  };

  const handlePayment = () => {
    setStep("payment");
    // In production: create order via API, get Stripe session URL, redirect
    // For now: simulate success redirect
    router.push("/checkout/success?orderId=DEMO-001");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-8 text-sm">
        <span className={step === "address" ? "font-bold text-green-700" : "text-gray-400"}>
          1. Dirección
        </span>
        <Separator className="flex-1" orientation="horizontal" />
        <span className={step === "review" ? "font-bold text-green-700" : "text-gray-400"}>
          2. Revisar
        </span>
        <Separator className="flex-1" orientation="horizontal" />
        <span className={step === "payment" ? "font-bold text-green-700" : "text-gray-400"}>
          3. Pago
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === "address" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Dirección de Envío</h2>
              <AddressForm onSubmit={handleAddressSubmit} isSubmitting={false} />
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Revisar Pedido</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-sm">Dirección de envío</p>
                <p className="text-gray-600">{shippingAddress}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-1 text-green-700"
                  onClick={() => setStep("address")}
                >
                  Cambiar dirección
                </Button>
              </div>
              <Button
                className="w-full bg-green-700 hover:bg-green-800"
                size="lg"
                onClick={handlePayment}
              >
                Pagar Ahora
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Pago</h2>
              <PaymentSection />
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold"
                size="lg"
                onClick={handlePayment}
              >
                Pagar con Stripe
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 h-fit">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            addressName={shippingAddress || "Pendiente"}
          />
        </div>
      </div>
    </div>
  );
}
