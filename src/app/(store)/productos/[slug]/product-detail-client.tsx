"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Calculator, Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconWhatsApp } from "@/components/ui/icon-whatsapp";
import { useCartStore } from "@/lib/store/cart-store";
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { getWhatsAppLink } from "@/lib/utils";
import {
  buildCalculatorHref,
  buildQuoteMessage,
  type ProductView,
} from "./product-view";

/* Panel de compra: la única isla interactiva de la ficha.
 *
 * Todo lo que no reacciona al visitante — título, precio, ficha técnica,
 * preguntas frecuentes — se pinta en el servidor y no viaja como JavaScript.
 * Aquí queda cantidad, altura, color, carrito y los dos caminos de cotización.
 */

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

interface Props {
  product: ProductView;
}

export function ProductPurchasePanel({ product }: Props) {
  const { unitCopy, stock } = product;
  const [quantity, setQuantity] = useState(unitCopy.min);
  // El valor por defecto no es una elección del visitante: sólo viaja a la
  // cotización la cantidad que ha escrito o ajustado de verdad.
  const [quantityChosen, setQuantityChosen] = useState(false);
  const [height, setHeight] = useState<string>();
  const [color, setColor] = useState<string>();
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { addItem: trackView } = useRecentlyViewed();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  useEffect(() => {
    trackView({
      id: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: product.price,
      unit: product.unit,
      imageUrl: product.images[0]?.url,
    });
    // Una vez por producto: `trackView` cambia de identidad en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const inStock = stock > 0;
  const subtotal = product.price * quantity;
  const chosenQuantity = quantityChosen ? quantity : undefined;

  const setQty = (value: number) => {
    const clamped = Math.max(unitCopy.min, Math.min(stock, Math.round(value) || unitCopy.min));
    setQuantity(clamped);
    setQuantityChosen(true);
  };

  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage(product, { quantity: chosenQuantity, height, color }),
  );
  const calculatorHref = buildCalculatorHref(product, chosenQuantity);

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: product.price,
        unit: product.unit,
        stock,
        collection: product.collectionName ? { name: product.collectionName } : null,
        category: product.categoryName ? { name: product.categoryName } : null,
        images: product.images,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast.success(`${product.name} agregado al carrito`, {
      description: `${quantity} ${unitCopy.abbr} · $${subtotal.toFixed(2)}`,
      duration: 3000,
    });
  };

  const addLabel = added
    ? "Agregado al carrito"
    : `Agregar ${quantity} ${unitCopy.abbr} al carrito`;

  return (
    <div className="space-y-4">
      {/* Altura y color: están en el catálogo y hasta hoy no se mostraban. Se
          eligen aquí porque viajan con la cotización, no porque cambien el
          precio de lista. */}
      {(product.heights.length > 0 || product.colors.length > 0) && (
        <div className="space-y-3 rounded-xl border border-hairline bg-surface p-4">
          {product.heights.length > 0 && (
            <OptionGroup
              legend="Altura"
              options={product.heights}
              value={height}
              onChange={setHeight}
            />
          )}
          {product.colors.length > 0 && (
            <OptionGroup
              legend="Color"
              options={product.colors}
              value={color}
              onChange={setColor}
            />
          )}
          <p className="text-xs text-muted-foreground">
            Tu selección viaja en la cotización. Si no eliges, la confirmamos por WhatsApp.
          </p>
        </div>
      )}

      {/* Cantidad y estimado de material */}
      <div className="rounded-xl border border-hairline bg-brand-mint p-4">
        <label
          htmlFor="cantidad"
          className="text-2xs font-semibold uppercase text-brand-green-deep"
        >
          {unitCopy.field}
        </label>
        <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface p-1">
          <button
            type="button"
            onClick={() => setQty(quantity - 1)}
            disabled={quantity <= unitCopy.min}
            aria-label={`Quitar un ${unitCopy.abbr === "m" ? "metro" : "elemento"}`}
            className={`flex size-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-surface-2 disabled:opacity-40 ${FOCUS}`}
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <input
            id="cantidad"
            type="number"
            inputMode="numeric"
            min={unitCopy.min}
            max={stock}
            value={quantity}
            onChange={(e) => setQty(Number(e.target.value))}
            className={`w-full min-w-0 bg-transparent text-center font-heading text-lg font-bold tabular-nums text-foreground ${FOCUS}`}
          />
          <button
            type="button"
            onClick={() => setQty(quantity + 1)}
            disabled={quantity >= stock}
            aria-label={`Añadir un ${unitCopy.abbr === "m" ? "metro" : "elemento"}`}
            className={`flex size-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-surface-2 disabled:opacity-40 ${FOCUS}`}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 flex items-baseline justify-between border-t border-brand-green/20 pt-3">
          <span className="text-sm text-brand-green-deep">
            {quantity} {unitCopy.abbr} × ${product.price.toFixed(2)}
          </span>
          <span className="font-heading text-lg font-bold tabular-nums text-brand-green-deep">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Estimado de material. El ITBMS y la instalación se calculan en el precotizador.
        </p>
      </div>

      {/* Acciones */}
      <div className="space-y-2">
        {inStock && (
          <Button size="block" className="text-base" onClick={handleAdd}>
            <ShoppingCart aria-hidden="true" />
            {addLabel}
          </Button>
        )}

        <Button size="block" variant="whatsapp" className="text-base" asChild>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <IconWhatsApp />
            Cotizar por WhatsApp
          </a>
        </Button>

        <Button size="block" variant="outline" className="text-base" asChild>
          <Link href={calculatorHref} prefetch={false}>
            <Calculator aria-hidden="true" />
            Calcular con instalación e ITBMS
          </Link>
        </Button>

        <button
          type="button"
          onClick={() => {
            toggleWishlist({
              id: product.id,
              name: product.name,
              slug: product.slug,
              basePrice: product.price,
              unit: product.unit,
              stock,
              imageUrl: product.images[0]?.url,
              categoryName: product.categoryName ?? product.collectionName,
            });
            toast(wishlisted ? "Eliminado de favoritos" : "Guardado en favoritos", {
              duration: 1800,
            });
          }}
          aria-pressed={wishlisted}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground ${FOCUS}`}
        >
          <Heart
            className={`size-4 ${wishlisted ? "fill-destructive text-destructive" : ""}`}
            aria-hidden="true"
          />
          {wishlisted ? "Guardado en favoritos" : "Guardar en favoritos"}
        </button>
      </div>

      {/* Barra fija sólo en móvil: el precio y las dos acciones siempre a mano.
          El desplazamiento del contenido se compensa con padding en la página. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-hairline bg-surface px-4 pt-3 shadow-lg lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {inStock ? (
          <>
            <Button className="h-12 flex-1" onClick={handleAdd}>
              <ShoppingCart aria-hidden="true" />
              {added ? "Agregado" : `Agregar · $${subtotal.toFixed(2)}`}
            </Button>
            <Button variant="whatsapp" size="icon-lg" asChild>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cotizar por WhatsApp"
              >
                <IconWhatsApp />
              </a>
            </Button>
          </>
        ) : (
          <Button variant="whatsapp" className="h-12 flex-1" asChild>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp />
              Consultar disponibilidad
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Selector de opciones ───────────────────────────────────────────────── */

function OptionGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: string[];
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <fieldset>
      <legend className="text-2xs font-semibold uppercase text-muted-foreground">
        {legend}
      </legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : option)}
              className={`h-9 rounded-lg border px-3 text-sm font-semibold capitalize transition-colors duration-150 ${FOCUS} ${
                selected
                  ? "border-brand-green bg-brand-green-soft text-brand-green-deep"
                  : "border-border-strong bg-surface text-foreground hover:border-brand-green"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
