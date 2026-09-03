import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center bg-background px-gutter py-24"
      >
        <div className="max-w-md text-center">
          <p aria-hidden="true" className="text-[120px] leading-none font-bold text-brand-green-soft select-none">
            404
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Página no encontrada</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Lo sentimos, la página que buscas no existe o fue movida a otra dirección.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">
                <ArrowLeft aria-hidden="true" /> Volver al inicio
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
