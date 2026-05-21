"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { confirmTilopay } from "@/lib/api/orders";
import { Loader2 } from "lucide-react";

function TilopayReturnContent() {
  const params = useSearchParams();

  useEffect(() => {
    const orderId = params.get("orderId") ?? params.get("orderNumber");
    const tpt = params.get("tpt") ?? params.get("transaction");
    const status = params.get("status");

    const inIframe = window.parent !== window;

    const send = (msg: Record<string, unknown>) => {
      if (inIframe) {
        window.parent.postMessage(msg, window.location.origin);
      } else {
        // Fallback: navigated directly (not in iframe)
        if (msg.type === "tilopay-success") {
          window.location.href = `/checkout/success?ref=${(msg.orderId as string).slice(0, 8).toUpperCase()}&method=tilopay`;
        } else {
          window.location.href = "/checkout?error=pago_rechazado";
        }
      }
    };

    if (!orderId) { send({ type: "tilopay-error", reason: "no-order" }); return; }

    if (!tpt || status === "declined" || status === "failed" || status === "error") {
      send({ type: "tilopay-error", reason: "rejected", orderId });
      return;
    }

    confirmTilopay(orderId, tpt)
      .then(() => {
        try { sessionStorage.removeItem("intemperie-checkout-address"); } catch {}
        send({ type: "tilopay-success", orderId });
      })
      .catch(() => send({ type: "tilopay-error", reason: "confirm-failed", orderId }));
  }, [params]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="text-sm font-medium text-gray-600">Confirmando tu pago…</p>
      <p className="text-xs text-gray-400">No cierres esta ventana</p>
    </div>
  );
}

export default function TilopayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      }
    >
      <TilopayReturnContent />
    </Suspense>
  );
}
