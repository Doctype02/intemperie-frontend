import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AccountShell } from "./account-shell";

/* /cuenta vivía fuera de (store) y sin layout propio: era la única zona del
 * sitio que se pintaba sin cabecera ni pie. Quien entraba a ver un pedido
 * perdía el catálogo, el buscador y el carrito hasta que pulsaba «atrás».   */

export const metadata: Metadata = {
  title: { default: "Mi cuenta", template: "%s | Mi cuenta · Intemperie" },
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 bg-surface-sunk">
        <AccountShell>{children}</AccountShell>
      </main>
      <Footer />
    </div>
  );
}
