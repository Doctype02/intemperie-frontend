"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { OrderTotals } from "@/components/cart/order-totals";
import { formatMoney } from "@/lib/utils";
import type { CartQuote } from "@/lib/api/cart";
import {
  createOrder,
  initiateTilopay,
  getOrderPaymentStatus,
  clearCheckoutToken,
} from "@/lib/api/orders";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  Lock,
  ShoppingCart,
  X,
} from "lucide-react";
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

/** Formas de pago que el equipo acepta de verdad al cerrar el pedido. */
const PAYMENT_METHODS = ["Visa", "Mastercard", "Yappy", "Clave", "Transferencia", "Efectivo"];

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

  /* Impuesto, envío y total salen del API, no de una fórmula local. Esta
     pantalla los calculaba bien —7 % y $5.99 sobre $500— pero acertar copiando
     la regla no es lo mismo que ser correcto: el día que cambie la tarifa, el
     checkout mentiría igual que mentían el carrito y el panel. Con la
     cotización del servidor las cuatro pantallas no pueden discrepar.
     Va con el resto de hooks, antes de los retornos tempranos. */
  const { quote, isUpdating, error: quoteError, retry: retryQuote } = useCartQuote(items);

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
      <main className="flex-1">
        <div className="shell max-w-4xl py-section-sm">
          <p className="sr-only" role="status">Preparando tu pedido…</p>
          <div className="animate-pulse space-y-4" aria-hidden="true">
            <div className="mx-auto h-8 w-48 rounded-md bg-surface-2" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-4 rounded-xl border border-border bg-surface p-6 lg:col-span-2">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-11 rounded-lg bg-surface-2" />)}
              </div>
              <div className="h-48 rounded-xl border border-border bg-surface p-6" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated && !guestMode) {
    return (
      <main className="flex flex-1 items-center justify-center py-section">
        <div className="shell max-w-sm">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden="true" />
            <h1 className="text-center font-heading text-xl font-bold text-foreground">
              Completa tu pedido
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Elige cómo quieres continuar
            </p>
            <div className="mt-6 space-y-3">
              <Button size="block" asChild>
                <Link href="/login?redirect=/checkout">Iniciar sesión con mi cuenta</Link>
              </Button>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">o</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" size="block" onClick={() => setGuestMode(true)}>
                Continuar como invitado
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Con cuenta puedes consultar tus pedidos y guardar tus direcciones
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) return null;

  /* Mientras no haya cotización no hay importe que enseñar ni que cobrar: los
     botones de pago se bloquean en lugar de anunciar una cifra propia. */
  const total = quote ? formatMoney(quote.total) : null;

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
    // El mensaje lleva el importe: sin cotización del servidor no se manda una
    // cifra al equipo de ventas. El botón ya está bloqueado, esto es el cierre.
    if (!total) return;

    setLoading(true);
    setError("");
    try {
      // 1. Create order in DB as TRANSFERENCIA (manual payment via WhatsApp)
      const order = await createOrder(buildOrderPayload("TRANSFERENCIA"));

      // 2. Compose WhatsApp message with real order ID
      const orderLines = items
        .map((i) => `• ${i.product?.name} — ${i.quantity} ${i.product?.unit === "METRO" ? "m" : "unid."}`)
        .join("%0A");
      const msg = `Hola%2C quiero confirmar mi pedido:%0A%0A${orderLines}%0A%0ARef: ${order.id.slice(0, 8).toUpperCase()}%0ATotal: ${total}%0AEnvío a: ${address.street}, ${address.city}, ${address.province}%0AContacto: ${address.phone}`;
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

  /* Lo que necesitan los tres sitios donde se pinta el resumen. El subtotal es
     local (suma instantánea al cambiar cantidades); lo demás, del servidor. */
  const summary = {
    subtotal,
    quote,
    isUpdating,
    error: quoteError,
    onRetry: retryQuote,
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
        /* El velo es azul de obra, no negro: sobre el fondo oscuro del sitio un
           negro puro no se distingue del propio fondo y el diálogo parece
           flotar sin contexto. */
        className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy-deep/80 p-4 backdrop-blur-sm"
      >
        {/* Salir del pago se hace con el pulgar y con prisa: 44px, siempre
            visible y separado del formulario de la pasarela. */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeTilopay}
          className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full bg-surface text-foreground shadow-lg transition-colors hover:bg-surface-2"
          aria-label="Cerrar el pago seguro"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative flex h-[640px] max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl bg-surface shadow-xl">
          <div className="flex shrink-0 items-center gap-2 border-b border-hairline px-4 py-3">
            <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <h2 id="tilopay-dialog-title" className="text-xs font-semibold text-muted-foreground">
              Pago seguro · Tilopay
            </h2>
          </div>
          <p id="tilopay-dialog-description" className="sr-only">
            Formulario de pago con tarjeta. Pulsa Escape para cerrarlo y volver al checkout.
          </p>
          <iframe
            ref={iframeRef}
            src={tilopayFrame.url}
            className="w-full flex-1 border-0"
            title="Pago seguro con Tilopay"
            allow="payment"
          />

          {verifying && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-surface/95 px-6 text-center"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">
                Confirmando tu pago con nuestro servidor…
              </p>
              <p className="text-xs text-muted-foreground">
                No cierres esta ventana ni vuelvas a pagar.
              </p>
            </div>
          )}
        </div>
      </div>
    )}
    <main className="flex-1" inert={tilopayFrame ? true : undefined}>
      <div className="shell max-w-4xl py-section-sm">
        {/* Step indicators */}
        <nav aria-label="Progreso del checkout" className="mb-6">
          <ol className="flex items-center justify-center gap-1 md:gap-2">
            {(["address", "review", "payment"] as const).map((s, i) => {
              const isActive = step === s;
              const isCompleted = STEP_ORDER[step] > STEP_ORDER[s];
              const label = ["Dirección", "Revisar", "Pago"][i];
              return (
                <li key={s} className="flex items-center gap-1 md:gap-2" aria-current={isActive ? "step" : undefined}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold tabular transition-colors ${
                    isCompleted ? "border-2 border-brand-green bg-secondary text-secondary-foreground" :
                    isActive    ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"
                  }`} aria-hidden="true">
                    {isCompleted ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={`hidden text-sm font-semibold transition-colors sm:inline ${
                    isCompleted || isActive ? "text-primary" : "text-muted-foreground"
                  }`} aria-hidden="true">
                    {label}
                  </span>
                  <span className="sr-only">
                    {`Paso ${i + 1}: ${label}${isCompleted ? " (completado)" : isActive ? " (paso actual)" : ""}`}
                  </span>
                  {i < 2 && (
                    <span aria-hidden="true" className={`mx-1 h-px w-8 md:w-10 transition-colors ${isCompleted ? "bg-brand-green" : "bg-border"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Móvil: el total va arriba y siempre a la vista, y el detalle se
            despliega si se quiere. El resumen completo vive en la columna
            derecha, que en un móvil queda a una pantalla y media de scroll:
            nadie paga a ciegas por no querer bajar hasta el final. */}
        <details className="group mb-4 rounded-xl border border-border bg-surface lg:hidden">
          <summary className="flex min-h-11 list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ChevronDown
                className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
              Resumen del pedido
              <span className="text-muted-foreground tabular">({items.length})</span>
            </span>
            <span className="text-base font-bold text-foreground tabular">
              {total ?? "—"}
            </span>
          </summary>
          <div className="border-t border-hairline px-4 py-3">
            <SummaryLines items={items} summary={summary} />
          </div>
        </details>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">

              {/* ── STEP: ADDRESS ─────────────────────────────── */}
              {step === "address" && (
                <div>
                  <h2 ref={stepHeadingRef} tabIndex={-1} className={stepHeadingCls}>Dirección de envío</h2>
                  <p className="mt-0.5 mb-5 text-xs text-muted-foreground">
                    Los campos con <span className="text-destructive">*</span> son obligatorios
                  </p>
                  <form onSubmit={handleAddressSubmit} noValidate>
                    {/* El resumen de error va ANTES del formulario y con role="alert"
                        para que el lector de pantalla lo anuncie al validar. El
                        mensaje de cada campo no repite el aviso: se enlaza con
                        aria-describedby y se oye al llegar al campo, así no se
                        anuncian seis alarmas a la vez. */}
                    {error && <ErrorAlert className="mb-4">{error}</ErrorAlert>}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

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
                          inputMode="tel"
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
                          inputMode="email"
                          autoCapitalize="none"
                          spellCheck={false}
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
                          className={inputCls}
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

                      {/* El país no es un campo: sólo se envía dentro de Panamá y la
                          lista de provincias ya lo dice. Se muestra como dato, no
                          como control, para no ofrecer una elección que no existe. */}
                      <p className="text-sm text-muted-foreground sm:col-span-2">
                        Enviamos únicamente dentro de <strong className="font-semibold text-foreground">Panamá</strong>.
                      </p>

                    </div>
                    <Button type="submit" size="block" className="mt-5">
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
                  <div className="mb-4 rounded-lg border border-hairline bg-surface-sunk p-4">
                    <p className="eyebrow mb-1 text-muted-foreground">Enviar a</p>
                    <p className="font-semibold text-foreground">{address.name}</p>
                    <p className="text-sm text-muted-foreground">{address.street}</p>
                    <p className="text-sm text-muted-foreground">{address.city}, {address.province}</p>
                    <p className="text-sm text-muted-foreground tabular">{address.phone}</p>
                  </div>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-3 border-b border-hairline pb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.product?.name}</p>
                          <p className="text-xs text-muted-foreground tabular">
                            {item.quantity} {item.product?.unit === "METRO" ? "m" : "unid."}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-foreground tabular">
                          ${((Number(item.product?.basePrice) || 0) * item.quantity).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <SummaryLines items={items} summary={summary} hideItems />
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button variant="outline" onClick={() => setStep("address")}>
                      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Editar dirección
                    </Button>
                    <Button size="block" className="flex-1" onClick={() => setStep("payment")}>
                      Ir al pago
                    </Button>
                  </div>
                </div>
              )}

              {/* ── STEP: PAYMENT ─────────────────────────────── */}
              {step === "payment" && (
                <div>
                  <h2 ref={stepHeadingRef} tabIndex={-1} className={`${stepHeadingCls} mb-1`}>Elige tu método de pago</h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Selecciona cómo quieres completar tu pedido
                  </p>

                  {error && <ErrorAlert className="mb-4">{error}</ErrorAlert>}

                  <div className="space-y-3">
                    {/* Tilopay — iframe modal */}
                    <div className="rounded-xl border-2 border-brand-green/45 bg-secondary/35 p-4 sm:p-5">
                      <div className="mb-4">
                        <p className="text-sm font-bold text-foreground">Pagar con tarjeta</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Visa · Mastercard · Amex</p>
                      </div>
                      {/* El importe va dentro del botón: es el último sitio donde
                          se puede comprobar cuánto se va a cobrar. */}
                      <Button
                        onClick={handleTilopay}
                        disabled={loading || !total}
                        aria-busy={loading}
                        size="block"
                      >
                        {loading
                          ? <><Loader2 className="animate-spin" aria-hidden="true" />Preparando pago…</>
                          : total
                            ? <>Pagar <span className="tabular">{total}</span></>
                            : "Calculando el total…"}
                      </Button>
                      <p className="mt-2 flex items-center justify-center gap-1 text-2xs text-muted-foreground">
                        <Lock className="h-3 w-3" aria-hidden="true" /> Pago seguro con Tilopay · PCI DSS
                      </p>
                    </div>

                    <div className="flex items-center gap-3" aria-hidden="true">
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-xs font-medium text-muted-foreground">o</span>
                      <span className="h-px flex-1 bg-border" />
                    </div>

                    {/* WhatsApp fallback */}
                    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                      <p className="mb-0.5 text-sm font-bold text-foreground">Confirmar por WhatsApp</p>
                      <p className="mb-3 text-xs text-muted-foreground">
                        Envía tu pedido a nuestro equipo. Coordinaremos el pago por transferencia, Yappy o efectivo.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={loading || !total}
                        aria-busy={loading}
                        onClick={handleWhatsApp}
                      >
                        {loading ? (
                          <><Loader2 className="animate-spin" aria-hidden="true" />Procesando…</>
                        ) : "Confirmar por WhatsApp"}
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 text-muted-foreground"
                    onClick={() => setStep("review")}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" aria-hidden="true" /> Volver al resumen
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order summary sidebar — pegado al scroll en escritorio: al recorrer
              un formulario largo el total no debe irse de la pantalla. */}
          <aside
            aria-labelledby="order-summary-title"
            className="hidden h-fit rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-24 lg:block"
          >
            <h2 id="order-summary-title" className="mb-4 font-heading font-bold text-foreground">
              Resumen del pedido
            </h2>
            <SummaryLines items={items} summary={summary} />

            <div className="mt-4 rounded-lg border border-hairline bg-surface-sunk p-3">
              <p className="eyebrow mb-2.5 flex items-center gap-1.5 text-muted-foreground">
                <Lock className="h-3 w-3 text-primary" aria-hidden="true" />
                Pago 100% seguro
              </p>
              {/* Las marcas de tarjeta iban con su color corporativo escrito a
                  mano. Aquí sólo hace falta decir qué se acepta, y decirlo con
                  los tokens del sistema se lee igual en claro y en oscuro. */}
              <ul className="flex flex-wrap gap-1.5">
                {PAYMENT_METHODS.map((label) => (
                  <li
                    key={label}
                    className="rounded-md border border-border bg-surface px-2 py-1 text-2xs font-semibold text-foreground"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
    </>
  );
}

/* Campo de texto: mismos tokens que el `Input` del sistema. 44px de alto y
   cuerpo de 16px, porque por debajo de eso Safari en iOS hace zoom al enfocar
   y descoloca la página entera en mitad de un pago. */
const inputCls =
  "h-11 w-full min-w-0 rounded-lg border border-input bg-surface px-3 py-2 text-[1rem] text-foreground tabular " +
  "transition-colors duration-150 outline-none placeholder:text-muted-foreground/80 " +
  "hover:border-foreground/35 focus-visible:border-ring aria-invalid:border-destructive";

/* El foco lo dibuja la regla global de :focus-visible (anillo doble), así que
   aquí no se declara ni se anula ninguno. */
const stepHeadingCls = "font-heading text-lg font-bold text-foreground";

/** Bloque de error anunciado por lectores de pantalla en cuanto aparece. */
function ErrorAlert({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`flex items-start gap-2.5 rounded-lg border border-destructive/35 bg-destructive/8 px-4 py-3 text-sm text-destructive ${className}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/* Conceptos e importes del pedido. Se pinta en tres sitios (resumen plegable de
   móvil, paso de revisión y columna de escritorio) y por eso vive aquí: tres
   copias de la misma suma acaban divergiendo. Ya no suma nada: los artículos
   son suyos, y las cuatro cifras las delega en `OrderTotals`, que las toma de
   la cotización del servidor. */
function SummaryLines({
  items,
  summary,
  hideItems = false,
}: {
  items: { id: string; quantity: number; product?: { name?: string; basePrice?: number | string } }[];
  summary: {
    subtotal: number;
    quote: CartQuote | null;
    isUpdating: boolean;
    error: string | null;
    onRetry: () => void;
  };
  hideItems?: boolean;
}) {
  return (
    <div className="space-y-3 text-sm">
      {!hideItems && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="text-muted-foreground tabular">{item.quantity}×</span>
              <span className="flex-1 truncate text-muted-foreground">{item.product?.name}</span>
              <span className="font-medium text-foreground tabular">
                ${((Number(item.product?.basePrice) || 0) * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {/* Las cuatro cifras las pinta el bloque compartido del embudo: mismo
          origen y mismo formato que el carrito y que el panel, que es la única
          forma de que no vuelvan a discrepar entre pantallas. */}
      <OrderTotals
        subtotal={summary.subtotal}
        quote={summary.quote}
        isUpdating={summary.isUpdating}
        error={summary.error}
        onRetry={summary.onRetry}
        size="sm"
        className={hideItems ? "" : "border-t border-hairline pt-3"}
      />
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
      <label htmlFor={htmlFor} className="mb-1 block font-heading text-sm font-semibold text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (obligatorio)</span>}
        {optional && <span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span>}
      </label>
      {children}
      {error && htmlFor && (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
