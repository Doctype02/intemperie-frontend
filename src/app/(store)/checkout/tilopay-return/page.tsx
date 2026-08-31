"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  confirmTilopay,
  getOrderPaymentStatus,
  clearCheckoutToken,
  isPaymentNotApprovedError,
} from "@/lib/api/orders";
import { Loader2 } from "lucide-react";

/**
 * Motivos que se envían al checkout. `not-approved` significa "el API dice que
 * todavía no hay pago aprobado": no es un fallo de red ni un rechazo definitivo,
 * así que el checkout sigue consultando al backend en vez de dar el pago por
 * perdido.
 */
type ErrorReason = "no-order" | "rejected" | "declined" | "not-approved" | "confirm-failed";

type ReturnMessage =
  | { type: "tilopay-success"; orderId: string }
  | { type: "tilopay-error"; reason: ErrorReason; orderId?: string };

/** Traducción del motivo a la query que entiende /checkout cuando NO hay iframe. */
const FALLBACK_ERROR: Record<ErrorReason, string> = {
  "no-order": "confirmacion_fallida",
  rejected: "pago_rechazado",
  declined: "pago_rechazado",
  "not-approved": "pago_no_aprobado",
  "confirm-failed": "confirmacion_fallida",
};

function TilopayReturnContent() {
  const params = useSearchParams();

  useEffect(() => {
    const orderId = params.get("orderId") ?? params.get("orderNumber");
    const tpt = params.get("tpt") ?? params.get("transaction");
    const status = params.get("status");

    const inIframe = window.parent !== window;

    const send = (msg: ReturnMessage) => {
      if (inIframe) {
        // Dentro del iframe el checkout es quien manda: él consulta al backend y
        // él limpia el token. Aquí no se borra nada o el sondeo del invitado se
        // quedaría sin credencial y recibiría 404.
        window.parent.postMessage(msg, window.location.origin);
        return;
      }

      // Fallback: se navegó directamente (sin iframe). Esta página es la única
      // que puede cerrar el flujo, así que sí limpia el estado de checkout.
      if (msg.type === "tilopay-success") {
        clearCheckoutToken(msg.orderId);
        try { sessionStorage.removeItem("intemperie-checkout-address"); } catch {}
        window.location.href = `/checkout/success?ref=${msg.orderId.slice(0, 8).toUpperCase()}&method=tilopay`;
        return;
      }

      window.location.href = `/checkout?error=${FALLBACK_ERROR[msg.reason]}`;
    };

    if (!orderId) { send({ type: "tilopay-error", reason: "no-order" }); return; }

    if (!tpt || status === "declined" || status === "failed" || status === "error") {
      send({ type: "tilopay-error", reason: "rejected", orderId });
      return;
    }

    const confirm = async () => {
      try {
        // El token de checkout viaja solo (lo adjunta la capa de API a partir
        // del orderId); sin él un invitado recibiría 404 aquí.
        await confirmTilopay(orderId, tpt);
        send({ type: "tilopay-success", orderId });
      } catch (err) {
        if (!isPaymentNotApprovedError(err)) {
          send({ type: "tilopay-error", reason: "confirm-failed", orderId });
          return;
        }

        // 402: el pago no está aprobado. El estado real del pedido distingue el
        // rechazo definitivo (FAILED) de una liquidación todavía en curso.
        let paymentStatus: string | null = null;
        try {
          ({ paymentStatus } = await getOrderPaymentStatus(orderId));
        } catch {}

        send({
          type: "tilopay-error",
          reason: paymentStatus === "FAILED" ? "declined" : "not-approved",
          orderId,
        });
      }
    };

    void confirm();
  }, [params]);

  return (
    /* Esta pantalla se pinta dentro del iframe de la pasarela y dura lo que
       tarde la confirmación. `role="status"` la anuncia sin robar el foco, y el
       aviso de no cerrar la ventana va en texto: cerrarla a mitad deja el cobro
       hecho y el pedido sin confirmar. */
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm font-semibold text-foreground">Confirmando tu pago…</p>
      <p className="text-xs text-muted-foreground">No cierres esta ventana</p>
    </div>
  );
}

export default function TilopayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Cargando la confirmación del pago…</span>
        </div>
      }
    >
      <TilopayReturnContent />
    </Suspense>
  );
}
