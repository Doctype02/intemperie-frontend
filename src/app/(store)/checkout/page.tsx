"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { Check, ArrowLeft, ShoppingCart } from "lucide-react";

type Step = "address" | "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    province: "",
  });

  if (!isAuthenticated) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center bg-white rounded-xl border border-gray-200 p-8 max-w-md">
            <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h1 className="text-xl font-bold text-gray-900">Inicia sesión para comprar</h1>
            <p className="mt-2 text-sm text-gray-500">Necesitas una cuenta para completar tu pedido</p>
            <Button className="mt-6 bg-green-700 hover:bg-green-800" asChild>
              <Link href={`/login?redirect=/checkout`}>Iniciar sesión</Link>
            </Button>
          </div>
        </main>
    );
  }

  if (items.length === 0) {
    router.push("/carrito");
    return null;
  }

  const tax = subtotal * 0.07;
  const total = subtotal + tax;
  const handleAddressSubmit = (e: React.FormEvent) => { e.preventDefault(); setStep("review"); };

  return (
    <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Steps */}
          <div className="mb-8 flex items-center justify-center gap-1 md:gap-2">
            {[
              { key: "address", label: "Dirección" },
              { key: "review", label: "Revisar" },
              { key: "payment", label: "Pago" },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-1 md:gap-2">
                <div className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full text-xs md:text-sm font-bold ${
                  step === s.key ? "bg-green-700 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs md:text-sm font-medium hidden sm:inline ${step === s.key ? "text-green-700" : "text-gray-400"}`}>
                  {s.label}
                </span>
                {i < 2 && <div className="mx-1 h-px w-4 md:w-8 bg-gray-200" />}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main */}
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-white border border-gray-200 p-6">
                {step === "address" && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Dirección de envío</h2>
                    <form onSubmit={handleAddressSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                          <input
                            required
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={address.name}
                            onChange={(e) => setAddress({ ...address, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                          <input
                            required
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={address.phone}
                            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                          <input
                            required
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Calle, casa, edificio, referencia"
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                          <input
                            required
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                          <input
                            required
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={address.province}
                            onChange={(e) => setAddress({ ...address, province: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="mt-6 w-full bg-green-700 hover:bg-green-800 h-12">
                        Continuar al resumen
                      </Button>
                    </form>
                  </div>
                )}

                {step === "review" && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Revisa tu pedido</h2>
                    <div className="mb-4 rounded-lg bg-gray-50 p-4">
                      <p className="text-xs text-gray-400 uppercase mb-1">Enviar a</p>
                      <p className="font-medium">{address.name}</p>
                      <p className="text-sm text-gray-500">{address.street}</p>
                      <p className="text-sm text-gray-500">{address.city}, {address.province}</p>
                      <p className="text-sm text-gray-500">{address.phone}</p>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between border-b pb-3">
                          <div>
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <p className="text-xs text-gray-400">{item.quantity} {item.product.unit === "METRO" ? "m" : "unid."} × ${item.product.basePrice.toFixed(2)}</p>
                          </div>
                          <p className="text-sm font-bold">${(item.product.basePrice * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">ITBMS (7%)</span><span>${tax.toFixed(2)}</span></div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStep("address")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Editar dirección
                      </Button>
                      <Button className="flex-1 bg-green-700 hover:bg-green-800 h-12" onClick={() => setStep("payment")}>
                        Ir al pago
                      </Button>
                    </div>
                  </div>
                )}

                {step === "payment" && (
                  <div className="text-center py-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">¡Pedido simulado!</h2>
                    <p className="mt-2 text-gray-500">
                      En esta versión de prueba, el pago con Stripe estará disponible cuando configures tus llaves reales.
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Por ahora, puedes contactarnos por WhatsApp para finalizar tu pedido.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 max-w-sm mx-auto">
                      <Button
                        className="bg-green-700 hover:bg-green-800 h-12"
                        onClick={() => { clearCart(); router.push("/checkout/success"); }}
                      >
                        Simular pedido completado
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`https://wa.me/50762874042?text=Hola%20quiero%20finalizar%20mi%20pedido%20de%20${items.map(i => i.product.name).join(", ")}`} target="_blank">
                          Finalizar por WhatsApp
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="rounded-xl bg-white border border-gray-200 p-6 h-fit">
              <h3 className="font-bold text-gray-900 mb-4">Resumen del pedido</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <span className="text-gray-400">{item.quantity}×</span>
                    <span className="flex-1 truncate text-gray-600">{item.product.name}</span>
                    <span className="font-medium">${(item.product.basePrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">ITBMS (7%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400 uppercase mb-1">Pago seguro</p>
                <div className="flex gap-1.5">
                  {["Visa", "Mastercard", "Yappy", "Clave"].map((m) => (
                    <div key={m} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-500">{m}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
