import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center bg-white px-4 py-24">
        <div className="text-center max-w-md">
          <p className="text-[120px] font-black leading-none text-green-600/10 select-none">404</p>
          <h1 className="text-2xl font-black text-gray-900 mb-2 -mt-4">Página no encontrada</h1>
          <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
            Lo sentimos, la página que buscas no existe o fue movida a otra dirección.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
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
      <Footer />
    </>
  );
}
