"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, Check } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 50;

/* Panel del carrito.
 *
 * Vive separado de su disparador a propósito: este fichero es el único que
 * importa `ui/sheet`, y `ui/sheet` es el único que importa el Dialog de
 * Base UI (36.7 kB sin comprimir con su gestión de foco, bloqueo de scroll y
 * floating-ui). Estando el panel en el mismo módulo que la cabecera, ese
 * código se descargaba y parseaba en TODAS las páginas del sitio aunque el
 * visitante no llegara a abrir el carrito nunca.
 *
 * `cart-sheet.tsx` lo carga con `next/dynamic` en el primer clic. Ver allí.
 *
 * ── Sistema «Perímetro» ───────────────────────────────────────────────────
 * Este panel es la mitad del embudo de compra en móvil: se abre sobre el
 * catálogo, con el pulgar, y desde él se paga. Tres cosas cambian con la
 * migración, y ninguna es cromática de fondo:
 *
 *   · Los pasos de cantidad medían 30 px de alto y quedaban a un dedo del
 *     botón de eliminar. Ahora son de 44 px y el de eliminar está separado.
 *   · Los seis botones de cada fila eran iconos sin texto: sin nombre
 *     accesible, un lector de pantalla los anunciaba como «botón» y no decía
 *     de qué producto. Ahora cada uno nombra su artículo.
 *   · Los importes cambian al pulsar los pasos, pero el cambio ocurre a media
 *     pantalla de distancia del dedo. El bloque de totales es región viva y
 *     las cifras van con `.tabular` para que se comparen en columna.
 */
export interface CartPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Botón que abrió el panel; recibe el foco al cerrar. */
  finalFocus?: React.RefObject<HTMLElement | null>;
}

/* El marco redondeado lo pone el grupo, no cada paso: así los dos botones
 * pueden ser cuadrados de 44 px sin que se note la costura. */
const stepButton =
  "flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted active:bg-brand-green-soft";

export function CartPanel({ open, onOpenChange, finalFocus }: CartPanelProps) {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCartStore();
  const setOpen = onOpenChange;
  const count = itemCount();
  const total = subtotal();
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* `gap-0`: el panel es una pila de bandas separadas por su propio borde
          (cabecera, envío, lista, totales). El hueco que traía el primitivo
          dejaba franjas de fondo entre ellas y rompía la continuidad. */}
      <SheetContent
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        finalFocus={finalFocus}
      >
        <SheetHeader className="border-b border-hairline px-5 pt-5 pb-4">
          {/* `pr-12` reserva el sitio del botón de cerrar, que el primitivo
              posiciona en absoluto sobre esta misma esquina. */}
          <SheetTitle className="flex items-center gap-2 pr-12 text-base">
            <ShoppingCart className="size-4.5" aria-hidden="true" />
            Carrito
            {count > 0 && (
              <span className="text-sm font-normal text-muted-foreground tabular">
                ({count} {count === 1 ? "producto" : "productos"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-surface-2">
              <ShoppingCart className="size-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-base font-bold text-foreground">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Agrega productos para comenzar
            </p>
            <Button className="mt-6" asChild onClick={() => setOpen(false)}>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cuánto falta para el envío gratis. El texto lleva el dato; la
                barra sólo lo ilustra, así que se oculta al lector de pantalla
                en lugar de anunciar un porcentaje que nadie pidió. */}
            <div className="border-b border-hairline bg-surface-2 px-5 py-3">
              {remaining > 0 ? (
                <p className="mb-1.5 text-xs text-muted-foreground">
                  Agrega{" "}
                  <span className="font-bold text-foreground tabular">
                    ${remaining.toFixed(2)}
                  </span>{" "}
                  más para envío gratis
                </p>
              ) : (
                <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-success">
                  <Check className="size-3.5" aria-hidden="true" />
                  Envío gratuito incluido en tu pedido
                </p>
              )}
              <div
                aria-hidden="true"
                className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunk"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => {
                const minQty = item.product.unit === "METRO" ? 10 : 1;
                const lineTotal = item.product.basePrice * item.quantity;

                return (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                      {item.product.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        /* Sin foto, la inicial. El par es `secondary` y no
                           `brand-green-soft` con `brand-green-deep`: en modo
                           oscuro esos dos tonos casi coinciden y la letra se
                           perdería sobre su propio fondo. */
                        <div className="flex h-full items-center justify-center bg-secondary">
                          <span className="text-xl font-bold text-secondary-foreground">
                            {item.product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm leading-tight font-semibold text-foreground">
                        {item.product.name}
                      </p>
                      {item.product.collection?.name && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.product.collection.name}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div
                          role="group"
                          aria-label={`Cantidad de ${item.product.name}`}
                          className="flex items-center overflow-hidden rounded-lg border border-border-strong"
                        >
                          <button
                            type="button"
                            className={stepButton}
                            aria-label={`Quitar una unidad de ${item.product.name}`}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                Math.max(minQty, item.quantity - 1),
                              )
                            }
                          >
                            <Minus className="size-4" aria-hidden="true" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-foreground tabular">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className={stepButton}
                            aria-label={`Agregar una unidad de ${item.product.name}`}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="size-4" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-foreground tabular">
                            <span className="sr-only">Importe: </span>$
                            {lineTotal.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            aria-label={`Eliminar ${item.product.name} del carrito`}
                            onClick={() => removeItem(item.productId)}
                            className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-hairline bg-surface px-5 py-4">
              {/* Los pasos de cantidad están arriba y estas cifras abajo: sin
                  anuncio, quien no ve la pantalla no se entera de que acaba de
                  cambiar el total de su pedido. */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="mb-4 space-y-1.5"
              >
                <div className="flex justify-between gap-4 text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground tabular">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm text-muted-foreground">
                  <span>ITBMS (7%)</span>
                  <span className="font-medium text-foreground tabular">
                    ${(total * 0.07).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-hairline pt-1.5 text-base font-bold text-foreground">
                  <span>Total</span>
                  <span className="tabular">${(total * 1.07).toFixed(2)}</span>
                </div>
              </div>

              {/* Una acción por pantalla: pagar ocupa el ancho completo y 52 px
                  de alto; volver al carrito es el enlace secundario debajo. */}
              <Button size="block" asChild onClick={() => setOpen(false)}>
                <Link href="/checkout">Ir a pagar</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-11 w-full text-muted-foreground"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/carrito">Ver carrito completo</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
