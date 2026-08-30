"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";

/* Disparador del carrito — isla mínima.
 *
 * La cabecera se monta en todas las páginas de la tienda, así que todo lo que
 * ella importe se descarga en todas las páginas. El panel del carrito
 * arrastraba el Dialog de Base UI: 36.7 kB sin comprimir (14.9 kB brotli) de
 * trampa de foco, bloqueo de scroll y floating-ui, cargados y parseados
 * aunque el visitante no tocase el carrito.
 *
 * Aquí sólo queda el botón: un icono y un contador leído de la store. El
 * panel entra con `next/dynamic` en el primer clic. El coste es una petición
 * de ~15 kB que ocurre mientras el usuario ya ha decidido abrir el carrito;
 * el beneficio es no gastar ese parseo en cada visita de cada página.
 *
 * `ssr: false` porque el panel sólo existe tras una interacción: no hay nada
 * que prerrenderizar y así no entra tampoco en el payload RSC.
 */
const CartPanel = dynamic(
  () => import("@/components/cart/cart-panel").then((m) => m.CartPanel),
  { ssr: false },
);

export function CartSheet() {
  // Selector escalar: el componente sólo se vuelve a renderizar cuando cambia
  // el número, no en cada escritura de la store.
  const count = useCartStore((s) => s.itemCount());
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  /* Una vez cargado, el módulo se queda montado: cerrar el carrito no debe
   * obligar a re-descargarlo, y desmontarlo perdería la animación de salida. */
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Abrir carrito"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <ShoppingCart className="h-5 w-5 text-gray-700" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {loaded && (
        <CartPanel open={open} onOpenChange={setOpen} finalFocus={triggerRef} />
      )}
    </>
  );
}
