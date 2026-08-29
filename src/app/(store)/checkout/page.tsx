"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  createOrder,
  initiateTilopay,
  getOrderPaymentStatus,
  clearCheckoutToken,
} from "@/lib/api/orders";
import { Check, ArrowLeft, ShoppingCart, Lock, Loader2, X } from "lucide-react";
import type { GuestAddress } from "@/types";

type Step = "address" | "review" | "payment";
type FieldName = "name" | "phone" | "email" | "street" | "city" | "province";
type FieldErrors = Partial<Record<FieldName, string>>;

const STEP_ORDER: Record<Step, number> = { address: 0, review: 1, payment: 2 };
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50762874042";

/** Cada cuánto le preguntamos al backend por el estado real del pedido. */
const POLL_INTERVAL_MS = 3000;
/** Cuánto esperamos, tras un aviso de éxito, a que el backend lo confirme. */
const CONFIRM_TIMEOUT_MS = 90_000;

/** Referencia corta que ve el comprador (la misma que en la pantalla de éxito). */
const orderRef = (orderId: string) => orderId.slice(0, 8).toUpperCase();

/** Mensajes de cierre del pago: siempre accionables y sin invitar a pagar dos veces. */
const timeoutMessage = (orderId: string) =>
  "No pudimos confirmar el pago con nuestro servidor. Si el cobro se realizó, no vuelvas a pagar: " +
  `escríbenos con tu número de pedido (${orderRef(orderId)}) y lo verificamos.`;

/**
 * 402 del API: la transacción existe pero Tilopay no la da por aprobada. No es un
 * error de red ni un "inténtalo otra vez": el dinero puede estar retenido.
 */
const notApprovedMessage = (orderId: string) =>
  "El pago aún no aparece aprobado por Tilopay. No vuelvas a pagar: si tu banco te confirmó el cobro, " +
  `escríbenos con tu número de pedido (${orderRef(orderId)}) y lo verificamos por ti.`;

const FIELD_IDS: Record<FieldName, string> = {
  name: "addr-name",
  phone: "addr-phone",
  email: "addr-email",
  street: "addr-street",
  city: "addr-city",
  province: "addr-province",
};

const PANAMA_PROVINCES = [
  "Bocas del Toro",
  "Chiriquí",
  "Coclé",
  "Colón",
  "Darién",
  "Herrera",
  "Los Santos",
  "Panamá",
  "Panamá Oeste",
  "Veraguas",
  "Guna Yala",
  "Ngäbe-Buglé",
  "Emberá-Wounaan",
];

const emptyAddress: GuestAddress = {
  name: "", phone: "", email: "", street: "", city: "", province: "",
};

function validateAddress(address: GuestAddress): FieldErrors {
  const errors: FieldErrors = {};

  if (!address.name.trim()) errors.name = "Escribe tu nombre completo.";
  if (!address.phone.trim()) errors.phone = "Escribe un teléfono de contacto.";

  if (!address.email.trim()) {
    errors.email = "Escribe tu correo electrónico.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
    errors.email = "El correo no tiene un formato válido.";
  }

  if (!address.street.trim()) errors.street = "Escribe la dirección de envío.";
  if (!address.city.trim()) errors.city = "Escribe la ciudad o distrito.";
  if (!address.province) errors.province = "Selecciona una provincia.";

  return errors;
}

export default function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<GuestAddress>(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [tilopayFrame, setTilopayFrame] = useState<{ url: string; orderId: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef<Step | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);
  /** Evita que el efecto de "carrito vacío" nos mande a /carrito justo cuando
   *  estamos vaciando el carrito para ir a la pantalla de éxito. */
  const leavingToSuccessRef = useRef(false);

  // Cerrar el modal es abandonar este intento de pago: el token de checkout deja
  // de tener uso, así que no se queda en sessionStorage.
  const closeTilopay = useCallback(() => {
    if (tilopayFrame) clearCheckoutToken(tilopayFrame.orderId);
    setTilopayFrame(null);
    setVerifying(false);
  }, [tilopayFrame]);

  // Show error if returning from a failed Tilopay payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "pago_rechazado") {
      setStep("payment");
      setError("El pago fue rechazado. Por favor intenta con otra tarjeta.");
    } else if (err === "pago_no_aprobado") {
      setStep("payment");
      setError(
        "El pago aún no aparece aprobado por Tilopay. No vuelvas a pagar: si tu banco te confirmó el cobro, " +
        "escríbenos con tu número de pedido y lo verificamos por ti."
      );
    } else if (err === "confirmacion_fallida") {
      setStep("payment");
      setError("Error al confirmar el pago. Contacta a soporte.");
    }
  }, []);

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

  // Redirect to cart if cart becomes empty after hydration
  useEffect(() => {
    if (leavingToSuccessRef.current) return;
    if (ready && items.length === 0) router.push("/carrito");
  }, [ready, items.length, router]);

  // Al cambiar de paso movemos el foco al encabezado del paso nuevo, para que
  // un lector de pantalla anuncie dónde está el usuario.
  useEffect(() => {
    if (previousStepRef.current !== null && previousStepRef.current !== step) {
      stepHeadingRef.current?.focus();
    }
    previousStepRef.current = step;
  }, [step]);

  // Confirmación del pago.
  //
  // El `postMessage` sólo es una señal para acelerar la comprobación: NUNCA es
  // la fuente de verdad. El carrito se vacía y se redirige a "éxito" únicamente
  // cuando el backend dice que el pedido está CONFIRMED.
  useEffect(() => {
    if (!tilopayFrame) return;

    const { orderId } = tilopayFrame;
    let finalized = false;
    let awaitingConfirmation = false;
    let giveUpTimer: ReturnType<typeof setTimeout> | undefined;
    /** Mensaje que se mostrará si se agota la espera; puede afinarse por el camino. */
    let giveUpMessage = timeoutMessage(orderId);

    const finalize = () => {
      if (finalized) return;
      finalized = true;
      leavingToSuccessRef.current = true;
      setTilopayFrame(null);
      setVerifying(false);
      clearCart();
      try { sessionStorage.removeItem("intemperie-checkout-address"); } catch {}
      // Pedido confirmado por el backend: el token de checkout ya no hace falta.
      clearCheckoutToken(orderId);
      router.push(`/checkout/success?ref=${orderRef(orderId)}&method=tilopay`);
    };

    /** Cierra el intento con un error definitivo (y libera el token). */
    const abort = (message: string) => {
      if (finalized) return;
      setTilopayFrame(null);
      setVerifying(false);
      clearCheckoutToken(orderId);
      setError(message);
    };

    /**
     * Única fuente de verdad: el estado del pedido según el backend.
     * La consulta lleva el token de checkout; sin él un invitado recibiría 404
     * en cada intento y el pago parecería fallido aunque estuviera cobrado.
     */
    const checkOrderStatus = async (): Promise<boolean> => {
      try {
        const { orderStatus } = await getOrderPaymentStatus(orderId);
        if (orderStatus === "CONFIRMED") {
          finalize();
          return true;
        }
      } catch { /* ignore transient errors */ }
      return false;
    };

    const startConfirmation = (message?: string) => {
      if (message) giveUpMessage = message;
      if (awaitingConfirmation) return;
      awaitingConfirmation = true;
      setVerifying(true);
      giveUpTimer = setTimeout(() => abort(giveUpMessage), CONFIRM_TIMEOUT_MS);
    };

    // postMessage from the tilopay-return page loaded in the iframe
    const msgHandler = (e: MessageEvent) => {
      // Sólo aceptamos mensajes de nuestro propio origen. Un iframe en sandbox
      // reporta origin "null", así que admitirlo permitiría a cualquier tercero
      // falsificar un pago aprobado.
      if (e.origin !== window.location.origin) return;

      // …y sólo si vienen del iframe de pago que nosotros abrimos.
      const frameWindow = iframeRef.current?.contentWindow;
      if (frameWindow && e.source !== frameWindow) return;

      const data = e.data as { type?: unknown; reason?: unknown } | null;
      if (!data || typeof data !== "object") return;

      if (data.type === "tilopay-success") {
        // Pista, no veredicto: preguntamos al backend.
        startConfirmation();
        void checkOrderStatus();
      } else if (data.type === "tilopay-error") {
        const reason = data.reason;

        // 402 sin rechazo definitivo: el API consultó a Tilopay y todavía no hay
        // pago aprobado. Puede llegar por webhook en segundos, así que seguimos
        // preguntando al backend en vez de dar el pago por perdido; si se agota
        // la espera, el mensaje ya no es de "error de red".
        if (reason === "not-approved") {
          startConfirmation(notApprovedMessage(orderId));
          void checkOrderStatus();
          return;
        }

        abort(
          reason === "rejected" || reason === "declined"
            ? "El pago fue rechazado. Intenta con otra tarjeta."
            : reason === "confirm-failed"
              ? "No pudimos comunicarnos con nuestro servidor para confirmar el pago. " +
                `Si el cobro se realizó, escríbenos con tu número de pedido (${orderRef(orderId)}).`
              : "Ocurrió un error con el pago."
        );
      }
    };
    window.addEventListener("message", msgHandler);

    // Polling: también cubre el caso en que la redirección de retorno falle.
    const poll = setInterval(() => { void checkOrderStatus(); }, POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener("message", msgHandler);
      clearInterval(poll);
      if (giveUpTimer) clearTimeout(giveUpTimer);
    };
  }, [tilopayFrame, clearCart, router]);

  // Modal del iframe: foco inicial, trampa de foco, Escape y devolución del foco.
  useEffect(() => {
    if (!tilopayFrame) return;

    const previouslyFocused =
      dialogTriggerRef.current ?? (document.activeElement as HTMLElement | null);

    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeTilopay();
        return;
      }

      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), iframe, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      const active = document.activeElement;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus?.();
      dialogTriggerRef.current = null;
    };
  }, [tilopayFrame, closeTilopay]);

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

  if (items.length === 0) return null;

  const tax = subtotal * 0.07;
  const shipping = subtotal > 500 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const updateField = (name: keyof GuestAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name as FieldName];
      return next;
    });
  };

  /** Atributos ARIA que enlazan cada campo con su mensaje de error. */
  const fieldA11y = (name: FieldName) =>
    fieldErrors[name]
      ? { "aria-invalid": true as const, "aria-describedby": `${FIELD_IDS[name]}-error` }
      : {};

  const handleAddressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateAddress(address);
    setFieldErrors(errors);

    const firstInvalid = (Object.keys(FIELD_IDS) as FieldName[]).find((name) => errors[name]);
    if (firstInvalid) {
      setError("Revisa los campos marcados: faltan datos obligatorios.");
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    setError("");
    setStep("review");
  };

  // Builds the common order payload from the Zustand cart + address
  const buildOrderPayload = (paymentMethod: "TRANSFERENCIA" | "TILOPAY") => ({
    paymentMethod,
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    guestAddress: {
      street: [address.street, address.address2].filter(Boolean).join(", "),
      city: address.city,
      province: address.province,
      phone: address.phone,
    },
    guestName: address.name,
    guestEmail: address.email || undefined,
  });

  const handleTilopay = async (e: React.MouseEvent<HTMLButtonElement>) => {
    dialogTriggerRef.current = e.currentTarget;
    setLoading(true);
    setError("");
    try {
      const order = await createOrder(buildOrderPayload("TILOPAY"));

      // Sin sesión, el API exige el correo con el que se creó el pedido para
      // autorizar el inicio del pago. Es el mismo que pidió el formulario.
      // A cambio devuelve el token de checkout, que la capa de API guarda ligado
      // al orderId para el retorno de la pasarela (confirm + estado del pedido).
      const { url } = await initiateTilopay(order.id, {
        guestEmail: isAuthenticated ? undefined : address.email.trim(),
      });

      setTilopayFrame({ url, orderId: order.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar el pago. Intenta de nuevo.");
    } finally {
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
      leavingToSuccessRef.current = true;
      clearCart();
      router.push(`/checkout/success?ref=${order.id.slice(0, 8).toUpperCase()}&method=whatsapp`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {/* Tilopay iframe modal */}
    {tilopayFrame && (
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tilopay-dialog-title"
        aria-describedby="tilopay-dialog-description"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      >
        {/* Close button — floating, always visible */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeTilopay}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Cerrar el pago seguro"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl overflow-hidden" style={{ height: "640px" }}>
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 shrink-0">
            <Lock className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
            <h2 id="tilopay-dialog-title" className="text-xs font-semibold text-gray-600">
              Pago seguro · Tilopay
            </h2>
          </div>
          <p id="tilopay-dialog-description" className="sr-only">
            Formulario de pago con tarjeta. Pulsa Escape para cerrarlo y volver al checkout.
          </p>
          <iframe
            ref={iframeRef}
            src={tilopayFrame.url}
            className="flex-1 w-full border-0"
            title="Pago seguro con Tilopay"
            allow="payment"
          />

          {verifying && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-white/95 px-6 text-center"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-7 w-7 animate-spin text-green-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-gray-700">Confirmando tu pago con nuestro servidor…</p>
              <p className="text-xs text-gray-500">No cierres esta ventana ni vuelvas a pagar.</p>
            </div>
          )}
        </div>
      </div>
    )}
    <main className="flex-1 bg-gray-50" inert={tilopayFrame ? true : undefined}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Step indicators */}
        <nav aria-label="Progreso del checkout" className="mb-8">
          <ol className="flex items-center justify-center gap-1 md:gap-2">
            {(["address", "review", "payment"] as const).map((s, i) => {
              const isActive = step === s;
              const isCompleted = STEP_ORDER[step] > STEP_ORDER[s];
              const label = ["Dirección", "Revisar", "Pago"][i];
              return (
                <li key={s} className="flex items-center gap-1 md:gap-2" aria-current={isActive ? "step" : undefined}>
                  <div className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full text-xs md:text-sm font-bold transition-colors ${
                    isCompleted ? "bg-green-100 text-green-700 border-2 border-green-400" :
                    isActive    ? "bg-green-700 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                  </div>
                  <span className={`text-xs md:text-sm font-semibold hidden sm:inline transition-colors ${
                    isCompleted ? "text-green-600" : isActive ? "text-green-700" : "text-gray-400"
                  }`} aria-hidden="true">
                    {label}
                  </span>
                  <span className="sr-only">
                    {`Paso ${i + 1}: ${label}${isCompleted ? " (completado)" : isActive ? " (paso actual)" : ""}`}
                  </span>
                  {i < 2 && (
                    <div aria-hidden="true" className={`mx-1 h-px w-8 md:w-10 transition-colors ${isCompleted ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white border border-gray-200 p-6">

              {/* ── STEP: ADDRESS ─────────────────────────────── */}
              {step === "address" && (
                <div>
                  <h2 ref={stepHeadingRef} tabIndex={-1} className={stepHeadingCls}>Dirección de envío</h2>
                  <p className="text-xs text-gray-400 mt-0.5 mb-5">Los campos con <span className="text-red-500">*</span> son obligatorios</p>
                  <form onSubmit={handleAddressSubmit} noValidate>
                    {/* El resumen de error va ANTES del formulario y con role="alert"
                        para que el lector de pantalla lo anuncie al validar. */}
                    {error && <ErrorAlert className="mb-4">{error}</ErrorAlert>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Name */}
                      <Field label="Nombre completo" htmlFor="addr-name" required error={fieldErrors.name}>
                        <input
                          id="addr-name"
                          name="name"
                          required
                          autoComplete="name"
                          placeholder="Juan Pérez"
                          className={inputCls}
                          value={address.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          {...fieldA11y("name")}
                        />
                      </Field>

                      {/* Phone */}
                      <Field label="Teléfono" htmlFor="addr-phone" required error={fieldErrors.phone}>
                        <input
                          id="addr-phone"
                          name="phone"
                          required
                          type="tel"
                          autoComplete="tel"
                          placeholder="+507 6000-0000"
                          className={inputCls}
                          value={address.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          {...fieldA11y("phone")}
                        />
                      </Field>

                      {/* Email */}
                      <Field label="Correo electrónico" htmlFor="addr-email" required className="sm:col-span-2" error={fieldErrors.email}>
                        <input
                          id="addr-email"
                          name="email"
                          required
                          type="email"
                          autoComplete="email"
                          placeholder="tu@correo.com"
                          className={inputCls}
                          value={address.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          {...fieldA11y("email")}
                        />
                      </Field>

                      {/* Address Line 1 */}
                      <Field label="Dirección" htmlFor="addr-street" required className="sm:col-span-2" error={fieldErrors.street}>
                        <input
                          id="addr-street"
                          name="street"
                          required
                          autoComplete="address-line1"
                          placeholder="Calle, número de casa o edificio"
                          className={inputCls}
                          value={address.street}
                          onChange={(e) => updateField("street", e.target.value)}
                          {...fieldA11y("street")}
                        />
                      </Field>

                      {/* Address Line 2 */}
                      <Field label="Apartamento, local, suite" htmlFor="addr-street2" className="sm:col-span-2" optional>
                        <input
                          id="addr-street2"
                          name="address2"
                          autoComplete="address-line2"
                          placeholder="Piso 3, apto 4B, corregimiento…"
                          className={inputCls}
                          value={address.address2 ?? ""}
                          onChange={(e) => updateField("address2", e.target.value)}
                        />
                      </Field>

                      {/* City */}
                      <Field label="Ciudad / Distrito" htmlFor="addr-city" required error={fieldErrors.city}>
                        <input
                          id="addr-city"
                          name="city"
                          required
                          autoComplete="address-level2"
                          placeholder="Ciudad de Panamá"
                          className={inputCls}
                          value={address.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          {...fieldA11y("city")}
                        />
                      </Field>

                      {/* Province — select */}
                      <Field label="Provincia" htmlFor="addr-province" required error={fieldErrors.province}>
                        <select
                          id="addr-province"
                          name="province"
                          required
                          autoComplete="address-level1"
                          className={`${inputCls} bg-white`}
                          value={address.province}
                          onChange={(e) => updateField("province", e.target.value)}
                          {...fieldA11y("province")}
                        >
                          <option value="" disabled>Selecciona una provincia</option>
                          {PANAMA_PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </Field>

                      {/* Country — fixed */}
                      <Field label="País" htmlFor="addr-country" className="sm:col-span-2">
                        <div id="addr-country" className={`${inputCls} bg-gray-50 text-gray-500 flex items-center gap-2 cursor-default select-none`}>
                          <span aria-hidden="true">🇵🇦</span>
                          <span>Panamá</span>
                        </div>
                      </Field>

                    </div>
                    <Button type="submit" className="mt-4 w-full bg-green-700 hover:bg-green-800 h-12 text-sm font-bold">
                      Continuar al resumen
                    </Button>
                  </form>
                </div>
              )}

              {/* ── STEP: REVIEW ──────────────────────────────── */}
              {step === "review" && (
                <div>
                  <h2 ref={stepHeadingRef} tabIndex={-1} className={`${stepHeadingCls} mb-4`}>Revisa tu pedido</h2>
                  {error && <ErrorAlert className="mb-4">{error}</ErrorAlert>}
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
                      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Editar dirección
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
                  <h2 ref={stepHeadingRef} tabIndex={-1} className={`${stepHeadingCls} mb-1`}>Elige tu método de pago</h2>
                  <p className="text-sm text-gray-500 mb-6">Selecciona cómo quieres completar tu pedido</p>

                  {error && <ErrorAlert className="mb-4">{error}</ErrorAlert>}

                  <div className="space-y-3">
                    {/* Tilopay — iframe modal */}
                    <div className="rounded-xl border-2 border-green-200 bg-green-50/40 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Pagar con tarjeta</p>
                          <p className="text-xs text-gray-500 mt-0.5">Visa · Mastercard · Amex</p>
                        </div>
                        <div className="flex gap-1 shrink-0" aria-hidden="true">
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
                      <Button
                        onClick={handleTilopay}
                        disabled={loading}
                        className="w-full bg-green-700 hover:bg-green-800 h-12 text-sm font-bold"
                      >
                        {loading
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Preparando pago…</>
                          : `Pagar $${total.toFixed(2)}`}
                      </Button>
                      <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" aria-hidden="true" /> Pago seguro con Tilopay · PCI DSS
                      </p>
                    </div>

                    <div className="flex items-center gap-3" aria-hidden="true">
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
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Procesando…</>
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
                    <ArrowLeft className="mr-1 h-3 w-3" aria-hidden="true" /> Volver al resumen
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <aside aria-labelledby="order-summary-title" className="rounded-xl bg-white border border-gray-200 p-6 h-fit">
            <h2 id="order-summary-title" className="font-bold text-gray-900 mb-4">Resumen del pedido</h2>
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
                <Lock className="h-3 w-3 text-green-600" aria-hidden="true" />
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
          </aside>
        </div>
      </div>
    </main>
    </>
  );
}

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-300";

const stepHeadingCls =
  "text-lg font-bold text-gray-900 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700 rounded";

/** Bloque de error anunciado por lectores de pantalla en cuanto aparece. */
function ErrorAlert({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className = "",
  required,
  optional,
  error,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (obligatorio)</span>}
        {optional && <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>}
      </label>
      {children}
      {error && htmlFor && (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
