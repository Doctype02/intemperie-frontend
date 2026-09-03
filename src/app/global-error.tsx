"use client";

// Reemplaza al layout raiz cuando el error ocurre en el, por eso debe
// renderizar html/body y cargar sus propios estilos. Cuanto menos arbol,
// mejor: aqui no se importa ni el componente Button.
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <p className="text-7xl font-black text-destructive/20 mb-4">500</p>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Algo salió mal</h1>
            <p className="text-muted-foreground mb-8">Ocurrió un error inesperado. Intenta de nuevo.</p>
            <button
              onClick={reset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-heading text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-green-deep"
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
