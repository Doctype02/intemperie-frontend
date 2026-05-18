"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function CheckoutSuccessPage() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <main id="main-content" className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-xl px-4 py-16 sm:py-20">

        {/* Success indicator */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">¡Pedido enviado!</h1>
          <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
            Tu pedido fue enviado a nuestro equipo por WhatsApp. Te contactaremos en breve para confirmar.
          </p>
        </div>

        {/* Next steps */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-black uppercase tracking-wider text-gray-500">¿Qué sigue?</p>
          </div>
          <div className="divide-y divide-gray-100">
            {[
              { num: "1", title: "Confirmación del equipo", desc: "Un asesor revisará tu pedido y te contactará para confirmar disponibilidad." },
              { num: "2", title: "Coordinación del pago", desc: "Aceptamos transferencia bancaria, Yappy, Clave, Visa y Mastercard." },
              { num: "3", title: "Fecha de entrega", desc: "Coordinamos la entrega e instalación según tu ubicación en Panamá." },
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

        {/* Contact card */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-6 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
            <Phone className="h-5 w-5 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">¿Tienes dudas? Llámanos o escríbenos:</p>
            <p className="text-sm font-bold text-gray-900">+507 6287-4042 · ventas@intemperie.com</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/50762874042?text=Hola%2C%20acabo%20de%20enviar%20mi%20pedido%20y%20quiero%20confirmar%20los%20detalles"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-colors"
          >
            <IconWhatsApp className="h-4 w-4" />
            Hablar con un asesor
          </a>
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-gray-200 font-bold" asChild>
            <Link href="/productos">
              Seguir comprando <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
