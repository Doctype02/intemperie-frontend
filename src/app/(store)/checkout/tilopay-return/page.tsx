"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { confirmTilopay } from "@/lib/api/orders";

type Status = "loading" | "success" | "failed" | "cancelled";

function TilopayReturnContent() {
  const params    = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);

  const orderParam = params.get("order") ?? "";
  const tpt        = params.get("tpt")   ?? "";
  const cancelled  = params.get("wp_cancel") !== null;

  const [status,  setStatus]  = useState<Status>(cancelled ? "cancelled" : "loading");
  const [orderId, setOrderId] = useState(orderParam);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (cancelled) return;

    let id = orderParam;
    try {
      id = sessionStorage.getItem("intemperie-pending-order-id") || orderParam;
    } catch {}

    if (!id || !tpt) {
      setStatus("failed");
      return;
    }

    setOrderId(id);

    confirmTilopay(id, tpt)
      .then(({ success }) => {
        if (success) {
          clearCart();
          try { sessionStorage.removeItem("intemperie-pending-order-id"); } catch {}
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-700" />
        <p className="mt-6 text-base font-semibold text-gray-700">Confirmando tu pago…</p>
        <p className="mt-1 text-sm text-gray-400">Esto tomará unos segundos.</p>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-50">
          <XCircle className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Pago cancelado</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
          Cancelaste el proceso de pago. Tu pedido no fue cobrado.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-green-700 hover:bg-green-800 h-12" asChild>
            <Link href="/checkout">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al checkout
            </Link>
          </Button>
          <Button variant="outline" className="h-12 border-gray-200" asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Pago no procesado</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
          No pudimos confirmar tu pago. No se realizó ningún cobro. Puedes intentarlo de nuevo o
          contactar soporte.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-green-700 hover:bg-green-800 h-12" asChild>
            <Link href="/checkout">
              <ArrowLeft className="mr-2 h-4 w-4" /> Intentar de nuevo
            </Link>
          </Button>
          <Button variant="outline" className="h-12 border-gray-200" asChild>
            <a
              href="https://wa.me/50762874042?text=Tuve%20un%20problema%20con%20mi%20pago%20en%20la%20tienda"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contactar soporte
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:py-20">
      <div className="text-center mb-8">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">¡Pago aprobado!</h1>
        <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
          Tu pago fue procesado correctamente. Nuestro equipo coordinará la entrega contigo.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {orderId && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
              <span className="text-xs text-green-700 font-semibold">Pedido:</span>
              <span className="text-sm font-black text-green-800 tracking-widest">{orderId}</span>
            </div>
          )}
          {tpt && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5">
              <span className="text-xs text-gray-500 font-semibold">Ref. Tilopay:</span>
              <span className="text-xs font-bold text-gray-700">{tpt}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">¿Qué sigue?</p>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { num: "1", title: "Confirmación por correo", desc: "Recibirás un comprobante de pago de Tilopay en tu correo." },
            { num: "2", title: "Coordinación de entrega", desc: "Un asesor te contactará para coordinar la fecha y hora de entrega." },
            { num: "3", title: "Instalación", desc: "Coordinamos la instalación según tu ubicación en Panamá." },
          ].map((step) => (
            <div key={step.num} className="flex gap-4 px-5 py-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-black text-green-700">
                {step.num}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`https://wa.me/50762874042?text=Hola%2C%20realicé%20un%20pago${orderId ? `%20(Ref%3A%20${orderId})` : ""}%20y%20quiero%20coordinar%20la%20entrega`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-colors"
        >
          Coordinar entrega por WhatsApp
        </a>
        <Button variant="outline" className="flex-1 h-12 rounded-xl border-gray-200 font-bold" asChild>
          <Link href="/productos">
            Seguir comprando <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function TilopayReturnPage() {
  return (
    <main id="main-content" className="flex-1 bg-gray-50">
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 m-4 rounded-2xl" />}>
        <TilopayReturnContent />
      </Suspense>
    </main>
  );
}
