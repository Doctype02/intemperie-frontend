"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "sonner";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIxAAAQMEAgMBAAAAAAAAAAAAAQIDBAAFERIhMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmtOkbddS1UqMhqIhWXnFnCU+SThI+T5PnXJd7lPkykOSX1u7UhIKjnATgD8CiigH/2Q==";

/* Favoritos — sistema «Perímetro».
 *
 * Una lista de deseos es una lista de decisiones a medias: quien llega aquí ya
 * eligió y viene a comparar precios y a comprar. Por eso los precios llevan
 * `.tabular` (se leen en columna, no en párrafo) y cada ficha termina en el
 * único botón que hace falta.
 *
 * El botón de quitar ya no vive dentro del enlace a la ficha. Estaba anidado
 * dentro del `<a>` y se sostenía con un `preventDefault`: para un lector de
 * pantalla era un control dentro de otro control, y con el teclado no había
 * forma clara de llegar a él. Ahora es hermano del enlace, mide 44px y avisa
 * con opción de deshacer, porque en una parrilla de dos columnas en móvil el
 * dedo se equivoca y perder un favorito sin vuelta atrás es caro.
 */
export default function FavoritosPage() {
  const [ready, setReady] = useState(false);
  const { items, toggle } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <main className="flex-1">
        <div className="shell py-section-sm">
          <p className="sr-only" role="status">Cargando tus favoritos…</p>
          <div className="animate-pulse" aria-hidden="true">
            <div className="mb-6 h-8 w-48 rounded-md bg-surface-2" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="aspect-[4/3] bg-surface-2" />
                  <div className="space-y-2 p-3.5">
                    <div className="h-4 w-3/4 rounded-sm bg-surface-2" />
                    <div className="h-5 w-1/2 rounded-sm bg-surface-2" />
                    <div className="h-11 rounded-lg bg-surface-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center py-section">
        {/* Un vacío sin salida es un callejón. Las dos salidas son las dos cosas
            que se pueden hacer antes de elegir producto: ver el catálogo o
            medir cuánta cerca hace falta. */}
        <div className="shell max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-surface-2">
            <Heart className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-xl font-bold text-foreground">
            Todavía no has guardado nada
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Toca el corazón en cualquier producto y lo tendrás aquí para compararlo con calma.
          </p>
          <div className="mt-6 space-y-3">
            <Button size="block" asChild>
              <Link href="/productos">
                Ver el catálogo <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="block" asChild>
              <Link href="/calculadora">Calcular cuántos metros necesito</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="shell py-section-sm">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              Mis favoritos
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground tabular">
              {items.length} {items.length === 1 ? "producto guardado" : "productos guardados"}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/productos">Seguir explorando</Link>
          </Button>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-brand-green"
            >
              <Link
                href={`/productos/${item.slug}`}
                className="relative block aspect-[4/3] overflow-hidden bg-surface-2"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL={BLUR}
                  />
                ) : (
                  /* Sin fotografía se dibuja el alzado de la cerca en CSS: es la
                     misma solución que la ficha de portada y no pide red. */
                  <>
                    <span
                      className="diagram diagram-picket block size-full"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{item.name}</span>
                  </>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  toggle(item);
                  toast("Quitado de favoritos", {
                    description: item.name,
                    action: { label: "Deshacer", onClick: () => toggle(item) },
                  });
                }}
                className="absolute top-2 right-2 z-10 flex size-11 items-center justify-center rounded-full bg-surface/92 text-muted-foreground shadow-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Quitar {item.name} de favoritos</span>
              </button>

              <div className="flex flex-1 flex-col p-3.5">
                {item.categoryName && (
                  <p className="eyebrow mb-0.5 truncate text-muted-foreground">
                    {item.categoryName}
                  </p>
                )}
                <Link href={`/productos/${item.slug}`} className="flex-1">
                  <h2 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors hover:text-brand-green-deep">
                    {item.name}
                  </h2>
                </Link>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg leading-none font-bold text-foreground tabular">
                    ${Number(item.basePrice).toFixed(2)}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.unit === "PANEL" ? "/panel" : "/m"}
                  </span>
                </p>

                {item.stock === 0 ? (
                  <p className="mt-3 flex w-full items-center justify-center rounded-lg border border-border bg-surface-sunk py-3 text-sm font-semibold text-muted-foreground">
                    Agotado
                  </p>
                ) : (
                  /* La etiqueta visible es corta porque la ficha mide 158px en
                     un móvil de 360px; el nombre del producto va en el nombre
                     accesible, así doce botones dejan de llamarse igual. */
                  <Button
                    className="mt-3 w-full px-2 text-sm"
                    onClick={() => {
                      const minQty = item.unit === "METRO" ? 10 : 1;
                      addItem(
                        {
                          id: item.id,
                          name: item.name,
                          slug: item.slug,
                          basePrice: item.basePrice,
                          unit: item.unit,
                          stock: item.stock ?? 1,
                          images: item.imageUrl ? [{ url: item.imageUrl }] : [],
                        },
                        minQty,
                      );
                      toast.success(`${item.name} agregado`, {
                        description: `${item.unit === "METRO" ? "10 m" : "1 unid."}`,
                      });
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Agregar
                    <span className="sr-only"> {item.name} al carrito</span>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
