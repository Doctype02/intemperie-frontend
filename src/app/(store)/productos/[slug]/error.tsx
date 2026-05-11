"use client";

import { Button } from "@/components/ui/button";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el producto</h2>
      <p className="text-gray-600 mb-6">{error.message || "Ha ocurrido un error inesperado."}</p>
      <Button onClick={reset} variant="outline">
        Intentar de nuevo
      </Button>
    </div>
  );
}
