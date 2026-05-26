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

export default function FavoritosPage() {
  const [ready, setReady] = useState(false);
  const { items, toggle } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-white border border-gray-200 overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-5 w-1/2 rounded bg-gray-200" />
                  <div className="h-9 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-24">
        <div className="text-center max-w-sm px-4">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <Heart className="h-10 w-10 text-red-300" />
          </div>
          <h1 className="text-xl font-black text-gray-900">Sin favoritos aún</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Guarda los productos que te interesan tocando el corazón en cada producto.
          </p>
          <Button className="mt-6 bg-green-700 hover:bg-green-800 h-11" asChild>
            <Link href="/productos">
              Explorar productos <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Mis favoritos
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {items.length} {items.length === 1 ? "producto guardado" : "productos guardados"}
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-gray-500 border-gray-200 text-xs" asChild>
            <Link href="/productos">Seguir explorando</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-xl hover:shadow-green-900/10 transition-all duration-200"
            >
              {/* Image */}
              <Link href={`/productos/${item.slug}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden">
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
                  <div className="flex h-full items-center justify-center bg-green-50">
                    <span className="text-3xl font-black text-green-200">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggle(item);
                    toast("Eliminado de favoritos", { icon: "🗑️" });
                  }}
                  aria-label="Quitar de favoritos"
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all duration-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </Link>

              {/* Info */}
              <div className="flex flex-col flex-1 p-3.5">
                {item.categoryName && (
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5 truncate">
                    {item.categoryName}
                  </p>
                )}
                <Link href={`/productos/${item.slug}`} className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-green-700 transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-black text-gray-900">
                    ${Number(item.basePrice).toFixed(2)}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {item.unit === "PANEL" ? "/panel" : "/m"}
                  </span>
                </div>
                {item.stock === 0 ? (
                  <div className="mt-3 flex w-full items-center justify-center rounded-lg border border-gray-200 py-2.5 text-[13px] font-semibold text-gray-400">
                    Agotado
                  </div>
                ) : (
                  <button
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
                        description: `${item.unit === "METRO" ? "10m" : "1 unid."}`,
                      });
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-700 py-2.5 text-[13px] font-bold text-white hover:bg-green-800 transition-colors"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Agregar al carrito
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
