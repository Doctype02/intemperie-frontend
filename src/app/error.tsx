"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
          <div className="text-center max-w-md">
            <p className="text-7xl font-black text-red-500/20 mb-4">500</p>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Algo salió mal</h1>
            <p className="text-gray-500 mb-8">Ocurrió un error inesperado. Intenta de nuevo.</p>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
