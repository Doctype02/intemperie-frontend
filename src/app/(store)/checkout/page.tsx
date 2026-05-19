"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { Check, ArrowLeft, ShoppingCart, Lock } from "lucide-react";

type Step = "address" | "review" | "payment";

export default function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState({ name: "", phone: "", email: "", street: "", city: "", province: "" });
  const [tilopayLoading, setTilopayLoading] = useState(false);
  const [tilopayError,   setTilopayError]   = useState("");

  useEffect(() => {
    setReady(true);
    try {
      const saved = sessionStorage.getItem("intemperie-checkout-address");
      if (saved) setAddress(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem("intemperie-checkout-address", JSON.stringify(address));
    } catch {}
  }, [address, ready]);

  if (!ready) {
    return (
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200 mx-auto" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-6 space-y-4">
              <div className="h-6 w-40 rounded bg-gray-200" />
              {[1,2,3,4].map(i => <div key={i} className="h-10 rounded bg-gray-200" />)}
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-6 h-48" />
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated && !guestMode) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-20">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full mx-4 shadow-sm">
          <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900 text-center">Completa tu pedido</h1>
          <p className="mt-2 text-sm text-gray-500 text-center">Elige cómo quieres continuar</p>
          <div className="mt-6 space-y-3">
            <Button className="w-full h-12 bg-green-700 hover:bg-green-800 text-sm font-bold" asChild>
              <Link href="/login?redirect=/checkout">Iniciar sesión con mi cuenta</Link>
            </Button>
            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">o</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <Button
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50"
              onClick={() => setGuestMode(true)}
            >
              Continuar como invitado
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">
            Con cuenta puedes rastrear tu pedido y guardar tus direcciones
          </p>
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

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-center gap-1 md:gap-2">
          {(["address", "review", "payment"] as const).map((s, i) => {
            const stepOrder = { address: 0, review: 1, payment: 2 };
            const isActive    = step === s;
            const isCompleted = stepOrder[step] > stepOrder[s];
            return (
              <div key={s} className="flex items-center gap-1 md:gap-2">
                <div className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full text-xs md:text-sm font-bold transition-colors ${
                  isCompleted ? "bg-green-100 text-green-700 border-2 border-green-400" :
                  isActive    ? "bg-green-700 text-white" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-xs md:text-sm font-semibold hidden sm:inline transition-colors ${
                  isCompleted ? "text-green-600" : isActive ? "text-green-700" : "text-gray-400"
                }`}>
                  {i === 0 ? "Dirección" : i === 1 ? "Revisar" : "Pago"}
                </span>
                {i < 2 && <div className={`mx-1 h-px w-8 md:w-10 transition-colors ${isCompleted ? "bg-green-300" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              {step === "address" && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Dirección de envío</h2>
                  <form onSubmit={(e) => { e.preventDefault(); setStep("review"); }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                        <input required className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input required type="tel" inputMode="tel" placeholder="+507 6000-0000" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                        <input required type="email" inputMode="email" placeholder="tu@correo.com" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input required placeholder="Calle, casa, edificio, referencia" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                        <input required className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                        <input required className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })} />
                      </div>
                    </div>
                    <Button type="submit" className="mt-6 w-full bg-green-700 hover:bg-green-800 h-12">Continuar al resumen</Button>
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
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between border-b pb-3">
                        <div>
                          <p className="text-sm font-medium">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">{item.quantity} {item.product?.unit === "METRO" ? "m" : "unid."}</p>
                        </div>
                        <p className="text-sm font-bold">${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">ITBMS (7%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={() => setStep("address")}><ArrowLeft className="mr-2 h-4 w-4" />Editar</Button>
                    <Button className="flex-1 bg-green-700 hover:bg-green-800 h-12" onClick={() => setStep("payment")}>Ir al pago</Button>
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Elige tu método de pago</h2>
                  <p className="text-sm text-gray-500 mb-6">Selecciona cómo quieres completar tu pedido</p>

                  {tilopayError && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
                      {tilopayError}
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Tilopay — card payment */}
                    <div className="rounded-xl border-2 border-green-200 bg-green-50/40 p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Pagar con tarjeta</p>
                          <p className="text-xs text-gray-500 mt-0.5">Visa, Mastercard, Amex · Yappy · Apple Pay</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {[
                            { label: "VISA", bg: "bg-blue-600", text: "text-white" },
                            { label: "MC",   bg: "bg-red-500",  text: "text-white" },
                            { label: "Yappy",bg: "bg-yellow-400",text: "text-gray-900" },
                          ].map((m) => (
                            <span key={m.label} className={`rounded px-1.5 py-0.5 text-[9px] font-black ${m.bg} ${m.text}`}>
                              {m.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-3">
                        Serás redirigido a la plataforma segura de Tilopay. Tu pago está protegido con 3DS y PCI DSS.
                      </p>
                      <Button
                        className="w-full bg-green-700 hover:bg-green-800 h-12 text-sm font-bold"
                        disabled={tilopayLoading}
                        onClick={async () => {
                          setTilopayLoading(true);
                          setTilopayError("");
                          try {
                            const orderRef = `IMP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
                            const res = await fetch("/api/payments/tilopay", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                orderNumber: orderRef,
                                amount: total,
                                billingInfo: address,
                              }),
                            });
                            const data = await res.json();
                            if (!res.ok || !data.url) {
                              throw new Error(data.error ?? "No se pudo iniciar el pago. Intenta de nuevo.");
                            }
                            try { sessionStorage.removeItem("intemperie-checkout-address"); } catch {}
                            window.location.href = data.url;
                          } catch (err) {
                            setTilopayError(err instanceof Error ? err.message : "Error al procesar el pago.");
                            setTilopayLoading(false);
                          }
                        }}
                      >
                        {tilopayLoading ? "Redirigiendo a Tilopay…" : "Pagar con tarjeta →"}
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-gray-200" />
                      <span className="text-xs text-gray-400 font-medium">o</span>
                      <div className="flex-1 border-t border-gray-200" />
                    </div>

                    {/* WhatsApp fallback */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                      <p className="text-sm font-bold text-gray-900 mb-0.5">Confirmar por WhatsApp</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Envía tu pedido a nuestro equipo. Coordinaremos el pago por transferencia, Yappy o efectivo.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full h-11 border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50"
                        onClick={() => {
                          const orderRef = `IMP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
                          const orderLines = items
                            .map((i) => `• ${i.product?.name} — ${i.quantity}${i.product?.unit === "METRO" ? "m" : " unid."}`)
                            .join("%0A");
                          const msg = `Hola%2C quiero confirmar mi pedido:%0A%0A${orderLines}%0A%0ARef: ${orderRef}%0ATotal: $${total.toFixed(2)}%0AEnvío a: ${address.street}, ${address.city}, ${address.province}%0AContacto: ${address.phone}`;
                          window.open(`https://wa.me/50762874042?text=${msg}`, "_blank");
                          try { sessionStorage.removeItem("intemperie-checkout-address"); } catch {}
                          clearCart();
                          router.push(`/checkout/success?ref=${orderRef}`);
                        }}
                      >
                        Confirmar por WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white border border-gray-200 p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Resumen del pedido</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <span className="text-gray-400">{item.quantity}×</span>
                  <span className="flex-1 truncate text-gray-600">{item.product?.name}</span>
                  <span className="font-medium">${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ITBMS (7%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Lock className="h-3 w-3 text-green-600" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pago 100% seguro</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "VISA", bg: "bg-blue-600", text: "text-white" },
                  { label: "MC", bg: "bg-red-500", text: "text-white" },
                  { label: "Yappy", bg: "bg-yellow-400", text: "text-gray-900" },
                  { label: "Clave", bg: "bg-green-600", text: "text-white" },
                ].map(m => (
                  <div key={m.label} className={`rounded-md px-2.5 py-1 text-[10px] font-black ${m.bg} ${m.text}`}>
                    {m.label}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Transferencia bancaria y efectivo también aceptados</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
