"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { createOrder, chargeTilopay } from "@/lib/api/orders";
import { Check, ArrowLeft, ShoppingCart, Lock, Loader2 } from "lucide-react";
import type { GuestAddress } from "@/types";

type Step = "address" | "review" | "payment";

const STEP_ORDER: Record<Step, number> = { address: 0, review: 1, payment: 2 };
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50762874042";

const emptyAddress: GuestAddress = {
  name: "", phone: "", email: "", street: "", city: "", province: "",
};

export default function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<GuestAddress>(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });

  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  // Hydrate and restore address from session
  useEffect(() => {
    setReady(true);
    if (isAuthenticated && user) {
      setAddress((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
      }));
    }
    try {
      const saved = sessionStorage.getItem("intemperie-checkout-address");
      if (saved) {
        const parsed = JSON.parse(saved);
        setAddress((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, [isAuthenticated, user]);

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
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 rounded bg-gray-200" />)}
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
  const shipping = subtotal > 500 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  // Builds the common order payload from the Zustand cart + address
  const buildOrderPayload = (paymentMethod: "STRIPE" | "TRANSFERENCIA" | "TILOPAY") => ({
    paymentMethod,
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    guestAddress: {
      street: address.street,
      city: address.city,
      province: address.province,
      phone: address.phone,
    },
    guestName: address.name,
    guestEmail: address.email || undefined,
  });

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
  };

  const handleTilopay = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = card.number.replace(/\s/g, "");
    const [expM, expY] = card.expiry.split("/");
    if (digits.length < 13 || !expM || !expY || card.cvv.length < 3) {
      setError("Completa los datos de la tarjeta correctamente.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const order = await createOrder(buildOrderPayload("TILOPAY"));
      await chargeTilopay(order.id, {
        cardNumber: digits,
        expMonth: expM.padStart(2, "0"),
        expYear: expY.length === 2 ? "20" + expY : expY,
        cvv: card.cvv,
      });
      try { sessionStorage.removeItem("intemperie-checkout-address"); } catch {}
      clearCart();
      router.push(`/checkout/success?ref=${order.id.slice(0, 8).toUpperCase()}&method=tilopay`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago. Intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create order in DB as TRANSFERENCIA (manual payment via WhatsApp)
      const order = await createOrder(buildOrderPayload("TRANSFERENCIA"));

      // 2. Compose WhatsApp message with real order ID
      const orderLines = items
        .map((i) => `• ${i.product?.name} — ${i.quantity} ${i.product?.unit === "METRO" ? "m" : "unid."}`)
        .join("%0A");
      const msg = `Hola%2C quiero confirmar mi pedido:%0A%0A${orderLines}%0A%0ARef: ${order.id.slice(0, 8).toUpperCase()}%0ATotal: $${total.toFixed(2)}%0AEnvío a: ${address.street}, ${address.city}, ${address.province}%0AContacto: ${address.phone}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

      // 3. Clear state and go to success
      try { sessionStorage.removeItem("intemperie-checkout-address"); } catch {}
      clearCart();
      router.push(`/checkout/success?ref=${order.id.slice(0, 8).toUpperCase()}&method=whatsapp`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-1 md:gap-2">
          {(["address", "review", "payment"] as const).map((s, i) => {
            const isActive = step === s;
            const isCompleted = STEP_ORDER[step] > STEP_ORDER[s];
            return (
              <div key={s} className="flex items-center gap-1 md:gap-2">
                <div className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full text-xs md:text-sm font-bold transition-colors ${
                  isCompleted ? "bg-green-100 text-green-700 border-2 border-green-400" :
                  isActive    ? "bg-green-700 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-xs md:text-sm font-semibold hidden sm:inline transition-colors ${
                  isCompleted ? "text-green-600" : isActive ? "text-green-700" : "text-gray-400"
                }`}>
                  {["Dirección", "Revisar", "Pago"][i]}
                </span>
                {i < 2 && (
                  <div className={`mx-1 h-px w-8 md:w-10 transition-colors ${isCompleted ? "bg-green-300" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white border border-gray-200 p-6">

              {/* ── STEP: ADDRESS ─────────────────────────────── */}
              {step === "address" && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Dirección de envío</h2>
                  <form onSubmit={(e) => { e.preventDefault(); setStep("review"); }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Nombre completo">
                        <input required className={inputCls} value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                      </Field>
                      <Field label="Teléfono">
                        <input required type="tel" placeholder="+507 6000-0000" className={inputCls} value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                      </Field>
                      <Field label="Correo electrónico" className="sm:col-span-2">
                        <input required type="email" placeholder="tu@correo.com" className={inputCls} value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} />
                      </Field>
                      <Field label="Dirección" className="sm:col-span-2">
                        <input required placeholder="Calle, casa, edificio, referencia" className={inputCls} value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                      </Field>
                      <Field label="Ciudad">
                        <input required className={inputCls} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                      </Field>
                      <Field label="Provincia">
                        <input required className={inputCls} value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })} />
                      </Field>
                    </div>
                    <Button type="submit" className="mt-6 w-full bg-green-700 hover:bg-green-800 h-12">
                      Continuar al resumen
                    </Button>
                  </form>
                </div>
              )}

              {/* ── STEP: REVIEW ──────────────────────────────── */}
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
                          <p className="text-sm font-medium">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity} {item.product?.unit === "METRO" ? "m" : "unid."}
                          </p>
                        </div>
                        <p className="text-sm font-bold">
                          ${((Number(item.product?.basePrice) || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">ITBMS (7%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Envío</span><span>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={() => setStep("address")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />Editar dirección
                    </Button>
                    <Button className="flex-1 bg-green-700 hover:bg-green-800 h-12" onClick={() => setStep("payment")}>
                      Ir al pago
                    </Button>
                  </div>
                </div>
              )}

              {/* ── STEP: PAYMENT ─────────────────────────────── */}
              {step === "payment" && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Elige tu método de pago</h2>
                  <p className="text-sm text-gray-500 mb-6">Selecciona cómo quieres completar tu pedido</p>

                  {error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Tilopay — direct card form */}
                    <form onSubmit={handleTilopay} className="rounded-xl border-2 border-green-200 bg-green-50/40 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Pagar con tarjeta</p>
                          <p className="text-xs text-gray-500 mt-0.5">Visa · Mastercard · Amex</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {[
                            { label: "VISA", bg: "bg-blue-600", text: "text-white" },
                            { label: "MC", bg: "bg-red-500", text: "text-white" },
                          ].map((m) => (
                            <span key={m.label} className={`rounded px-1.5 py-0.5 text-[9px] font-black ${m.bg} ${m.text}`}>
                              {m.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Número de tarjeta</label>
                          <input
                            required
                            placeholder="1234 5678 9012 3456"
                            className={inputCls}
                            value={card.number}
                            maxLength={19}
                            onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                            inputMode="numeric"
                            autoComplete="cc-number"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Vencimiento</label>
                            <input
                              required
                              placeholder="MM/AA"
                              className={inputCls}
                              value={card.expiry}
                              maxLength={5}
                              onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                              inputMode="numeric"
                              autoComplete="cc-exp"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                            <input
                              required
                              placeholder="123"
                              type="password"
                              className={inputCls}
                              value={card.cvv}
                              maxLength={4}
                              onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                              inputMode="numeric"
                              autoComplete="cc-csc"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="mt-4 w-full bg-green-700 hover:bg-green-800 h-12 text-sm font-bold"
                        disabled={loading}
                      >
                        {loading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando…</>
                        ) : `Pagar $${total.toFixed(2)}`}
                      </Button>
                      <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" /> Pago seguro con Tilopay · PCI DSS
                      </p>
                    </form>

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
                        disabled={loading}
                        onClick={handleWhatsApp}
                      >
                        {loading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando…</>
                        ) : "Confirmar por WhatsApp"}
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="mt-4 text-gray-500 text-xs"
                    onClick={() => setStep("review")}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" /> Volver al resumen
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="rounded-xl bg-white border border-gray-200 p-6 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Resumen del pedido</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <span className="text-gray-400">{item.quantity}×</span>
                  <span className="flex-1 truncate text-gray-600">{item.product?.name}</span>
                  <span className="font-medium">
                    ${((Number(item.product?.basePrice) || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ITBMS (7%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Envío</span><span>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span></div>
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
                ].map((m) => (
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

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
