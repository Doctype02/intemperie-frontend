"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function FooterNewsletter() {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    window.location.href = `mailto:ventas@intemperie.com?subject=Suscripción%20al%20boletín&body=Por%20favor%20suscribir%20el%20correo%3A%20${encodeURIComponent(email)}`;
    setSubmitted(true);
  };

  return (
    <div className="border-t border-gray-800 pt-8 mt-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-gray-200 leading-tight">
            ¡No te pierdas ninguna novedad!
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Suscríbete para recibir precios especiales y nuevos modelos
          </p>
        </div>
        {submitted ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold shrink-0">
            <CheckCircle2 className="h-5 w-5" />
            ¡Gracias! Revisa tu correo.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto shrink-0">
            <input
              type="email"
              required
              placeholder="tu@email.com"
              aria-label="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 sm:w-64 h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-green-600 text-xs font-bold text-white hover:bg-green-500 transition-colors whitespace-nowrap"
            >
              Suscribirse
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
