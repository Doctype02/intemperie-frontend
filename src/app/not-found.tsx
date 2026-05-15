import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-green-600/20 mb-4">404</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 mb-8">Lo sentimos, la página que buscas no existe o fue movida.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </main>
  );
}
