"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency, calculateItemTotal } from "@/lib/utils";

/* Línea de carrito — sistema «Perímetro».
 *
 * El carrito se toca con el pulgar y con una sola mano: los tres controles de
 * esta fila (menos, más, eliminar) miden 44 px de lado. Antes eran cuadrados de
 * 32 px pegados entre sí, con lo que restar una unidad y borrar el artículo
 * caían a menos de un dedo de distancia.
 *
 * Los tres eran además botones mudos: un icono sin texto no tiene nombre
 * accesible, así que un lector de pantalla anunciaba «botón» tres veces
 * seguidas sin decir sobre qué producto actuaba. Ahora cada uno nombra su
 * artículo, y el importe de la línea se anuncia solo al cambiar la cantidad:
 * quien no ve la pantalla necesita oír el efecto de lo que acaba de pulsar.
 */

/* Los pasos de cantidad viven dentro de un marco compartido: el redondeo lo
 * pone el contenedor, no cada botón. */
const stepButton =
  "flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted active:bg-brand-green-soft";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    product: {
      name: string;
      slug: string;
      pricePerMeter: number;
      pricePerPanel: number | null;
      panelWidth: number | null;
      images: { url: string; alt: string | null }[];
    };
    quantity: number;
    unit: "meters" | "panels";
  };
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore();
  const { product, quantity, unit } = item;

  const total = calculateItemTotal(
    quantity,
    unit,
    product.pricePerMeter,
    product.pricePerPanel,
    product.panelWidth
  );

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/productos/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-surface-2"
      >
        {product.images.length > 0 ? (
          <Image
            src={product.images[0].url}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          /* Sin fotografía, la inicial sobre el verde suave: identifica la fila
             de un vistazo sin fingir que hay una imagen que no existe. El par
             es `secondary`, no `brand-green-soft` + `brand-green-deep`: en modo
             oscuro esos dos tonos son casi el mismo y la letra desaparece. */
          <div className="flex size-full items-center justify-center bg-secondary font-bold text-secondary-foreground">
            {product.name.charAt(0)}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        {/* La miniatura de al lado apunta al mismo sitio y está oculta al lector
            de pantalla: dos enlaces idénticos seguidos sólo alargan el recorrido. */}
        <Link
          href={`/productos/${product.slug}`}
          className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-brand-green-deep"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {unit === "meters" ? "Metros lineales" : "Paneles"}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label={`Cantidad de ${product.name}`}
            className="flex items-center overflow-hidden rounded-md border border-border-strong"
          >
            <button
              type="button"
              className={stepButton}
              aria-label={`Quitar una unidad de ${product.name}`}
              onClick={() => updateQuantity(item.productId, quantity - 1)}
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-foreground tabular">
              {quantity}
            </span>
            <button
              type="button"
              className={stepButton}
              aria-label={`Agregar una unidad de ${product.name}`}
              onClick={() => updateQuantity(item.productId, quantity + 1)}
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="text-sm font-semibold text-foreground tabular"
            >
              <span className="sr-only">Importe de {product.name}: </span>
              {formatCurrency(total)}
            </span>
            <button
              type="button"
              aria-label={`Eliminar ${product.name} del carrito`}
              className="flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              onClick={() => removeItem(item.productId)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
