"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Ingresa un correo electrónico válido.");
      return;
    }
    setSubmitted(true);
    setEmail("");
    toast.success("¡Gracias! Te avisaremos sobre novedades y precios especiales.");
  };

  return (
    <section className="bg-gray-900 py-12 sm:py-16">
      <div className="mx-auto max-w-lg px-4 sm:px-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-2">
          Mantente informado
        </p>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">
          ¡No te pierdas ninguna novedad!
        </h2>
        <p className="text-sm text-gray-400 mb-7 leading-relaxed">
          Nuevos modelos, precios especiales y proyectos inspiradores directo a tu correo.
        </p>
        {submitted ? (
          <p className="text-green-400 font-semibold text-sm">¡Gracias por suscribirte! Pronto recibirás novedades.</p>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="tu@email.com"
              aria-label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 h-11 rounded-xl border border-gray-700 bg-gray-800 px-4 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 px-6 rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-500 transition-colors whitespace-nowrap"
            >
              Suscribirse
            </button>
          </div>
        )}
        <p className="mt-3 text-[11px] text-gray-600">Sin spam. Cancela cuando quieras.</p>
      </div>
    </section>
  );
}
