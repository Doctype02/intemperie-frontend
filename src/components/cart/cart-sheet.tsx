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
      {/* Objetivo táctil de 44 px, el mismo que el resto de iconos de la
          cabecera: con `p-2` medía 36 px y era el más difícil de acertar de
          una fila en la que además es el que más se pulsa.

          El recuento va también en el nombre accesible: la burbuja es un
          número sin contexto, y quien no la ve necesita saber si el carrito
          lleva algo antes de decidir abrirlo. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        className="relative flex size-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
        aria-label={count > 0 ? `Abrir carrito (${count} productos)` : "Abrir carrito, vacío"}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <ShoppingCart className="size-5" aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] leading-none font-bold text-primary-foreground tabular"
          >
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
