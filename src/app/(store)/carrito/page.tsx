"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart-store";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, Check } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 50;

/* El marco redondeado lo pone el grupo y no cada paso, así los dos botones
 * pueden ser cuadrados de 44 px sin costura visible entre ellos. */
const stepButton =
  "flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted active:bg-brand-green-soft";

/* Carrito completo — sistema «Perímetro».
 *
 * La página donde se revisa el pedido antes de pagar. Se abre casi siempre en
 * móvil y con una mano, así que manda el pulgar: los pasos de cantidad y el
 * botón de eliminar median 30 px y compartían fila; ahora son de 44 px y
 * eliminar vive separado, al final de la fila.
 *
 * El resumen de importes deja de ser una esquina apretada de la caja: en móvil
 * ocupa el ancho completo bajo la lista y el botón de pagar es la única acción
 * de la pantalla. Las cifras van con `.tabular` porque subtotal, impuesto y
 * total se leen en columna y un «1» estrecho las desalinea.
 *
 * Los 36 colores literales se van con el mismo argumento de siempre: no tenían
 * modo oscuro. La caja blanca sobre gris con tinta casi negra se quedaba
 * exactamente igual —blanca y cegadora— cuando el sistema pide oscuro.
 */
export default function CartPage() {
  const [ready, setReady] = useState(false);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal);
  const itemCount = useCartStore((s) => s.itemCount);

  useEffect(() => { setReady(true); }, []);

  /* El carrito vive en `localStorage`: hasta que el almacén se rehidrata no se
     sabe si hay cero artículos o cinco. El esqueleto ocupa exactamente el sitio
     de la primera fila real para que la lista no dé un salto al aparecer. */
  if (!ready) {
    return (
      <div id="main-content" tabIndex={-1} className="bg-background outline-none">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4 px-4 py-8" aria-hidden="true">
          <div className="h-8 w-52 rounded-lg bg-surface-2" />
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center gap-4 p-4">
              <div className="size-16 shrink-0 rounded-lg bg-surface-2" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-surface-2" />
                <div className="h-3 w-1/3 rounded bg-surface-2" />
                <div className="h-11 w-32 rounded bg-surface-2" />
              </div>
            </div>
            <div className="flex justify-end border-t border-hairline bg-surface-sunk p-4">
              <div className="h-13 w-52 rounded-lg bg-surface-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div
        id="main-content"
        tabIndex={-1}
        className="flex items-center justify-center bg-background py-section outline-none"
      >
        <div className="max-w-md px-4 text-center">
          <ShoppingCart
            className="mx-auto mb-4 size-16 text-muted-foreground"
            aria-hidden="true"
          />
          <h1 className="font-heading text-xl font-bold text-foreground">
            Tu carrito está vacío
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Agrega productos desde nuestro catálogo
          </p>
          <Button className="mt-6" asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const total = subtotal();
  const count = itemCount();
  const tax = total * 0.07;
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  return (
    /* El layout de la tienda ya aporta el <main>; aquí sólo el destino del
       enlace «saltar al contenido». */
    <div id="main-content" tabIndex={-1} className="bg-background outline-none">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
            Carrito{" "}
            <span className="tabular">
              ({count} {count === 1 ? "producto" : "productos"})
            </span>
          </h1>
          {/* Objetivo táctil de 44 px también aquí: es la salida del embudo y
              en móvil se pulsa con el pulgar desde el borde de la pantalla. */}
          <Link
            href="/productos"
            className="flex min-h-tap items-center gap-1 rounded-lg px-1 text-sm font-semibold text-brand-green-deep transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Seguir comprando
          </Link>
        </div>

        {/* Cuánto falta para el envío gratis. El dato está en el texto; la barra
            sólo lo ilustra, así que no se anuncia un porcentaje aparte. */}
        <div className="mb-4 rounded-xl border border-border bg-surface px-4 py-3.5">
          {remaining > 0 ? (
            <p className="mb-2 text-sm text-muted-foreground">
              Agrega{" "}
              <span className="font-bold text-foreground tabular">
                ${remaining.toFixed(2)}
              </span>{" "}
              más para <span className="font-bold text-success">envío gratis</span>
            </p>
          ) : (
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-success">
              <Check className="size-4" aria-hidden="true" />
              ¡Envío gratuito incluido en tu pedido!
            </p>
          )}
          <div
            aria-hidden="true"
            className="h-2 w-full overflow-hidden rounded-full bg-surface-sunk"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <ul>
            {items.map((item) => {
              const minQty = item.product?.unit === "METRO" ? 10 : 1;
              const name = item.product?.name || "Producto";
              const lineTotal = (item.product?.basePrice || 0) * item.quantity;

              return (
                <li
                  key={item.id}
                  className="border-b border-hairline p-3 last:border-b-0 sm:p-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-2 sm:size-16">
                      {item.product?.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL={BLUR_PLACEHOLDER}
                        />
                      ) : (
                        /* Sin foto, la inicial de la colección. El par es
                           `secondary`, no `brand-green-soft` con
                           `brand-green-deep`: en modo oscuro esos dos tonos
                           casi coinciden y la letra se perdería sobre su
                           propio fondo. */
                        <div className="flex size-full items-center justify-center bg-secondary text-lg font-bold text-secondary-foreground">
                          {item.product?.collection?.name?.charAt(0) || "I"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{name}</p>
                      {item.product?.collection?.name && (
                        <p className="truncate text-xs text-muted-foreground">
                          {item.product.collection.name}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
                        <div
                          role="group"
                          aria-label={`Cantidad de ${name}`}
                          className="flex items-center overflow-hidden rounded-lg border border-border-strong"
                        >
                          <button
                            type="button"
                            className={stepButton}
                            aria-label={`Quitar una unidad de ${name}`}
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
                            aria-label={`Agregar una unidad de ${name}`}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-foreground tabular">
                          <span className="sr-only">Importe: </span>$
                          {lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Eliminar ${name} del carrito`}
                      onClick={() => removeItem(item.productId)}
                      className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-hairline bg-surface-sunk p-4">
            <div className="sm:flex sm:justify-end">
              <div className="w-full sm:w-72">
                {/* Los pasos de cantidad quedan arriba y estas cifras abajo:
                    sin anuncio, quien no ve la pantalla no sabe que acaba de
                    cambiar el total de su pedido. */}
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="space-y-2"
                >
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground tabular">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">ITBMS (7%)</span>
                    <span className="font-medium text-foreground tabular">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border pt-2 text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="tabular">${(total + tax).toFixed(2)}</span>
                  </div>
                </div>

                {/* Una acción por pantalla: en móvil el botón ocupa el ancho
                    completo y 52 px de alto, que es lo que pide un pulgar. */}
                <Button size="block" className="mt-4" asChild>
                  <Link href="/checkout">Ir a pagar</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
