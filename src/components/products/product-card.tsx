"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ArrowRight, Heart, ImageIcon, Ruler } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import type { ProductImage, ProductUnit } from "@/types";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice?: number;
  unit: ProductUnit;
  stock: number;
  isNew?: boolean;
  /* Atributos reales del catalogo (columna `attributes` de Product). No hay
   * SKU ni resenas en el modelo: mostrarlos seria inventar datos. Lo que un
   * comprador de cercas pregunta primero es la altura, y eso si esta. */
  attributes?: {
    heightOptions?: string[]
    colors?: string[]
    material?: string
    warranty?: string
  } | null;
  category?: { name: string } | null;
  collection?: { name: string } | null;
  images?: ProductImage[];
  priority?: boolean;
}

const catColors: Record<string, string> = {
  Residencial:    "#dcfce7",
  Industrial:     "#f1f5f9",
  Gubernamental:  "#dbeafe",
  Agropecuario:   "#fef3c7",
  "Zonas Costeras": "#cffafe",
};

export function ProductCard(p: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(p.id);

  const collectionName = p.collection?.name || p.category?.name || "Intemperie";
  const catBg          = catColors[p.category?.name || ""] || "#f0fdf4";
  const unitLabel      = p.unit === "METRO" ? "/m" : p.unit === "PANEL" ? "/panel" : "";
  const primaryImage   = p.images?.[0]?.url || null;
  const discount       =
    p.comparePrice && p.comparePrice > p.basePrice
      ? Math.round(((p.comparePrice - p.basePrice) / p.comparePrice) * 100)
      : 0;

  /* `attributes` es Json en Prisma: puede venir vacio o incompleto segun el
   * producto, asi que se normaliza a array antes de pintar nada. */
  const alturas = Array.isArray(p.attributes?.heightOptions) ? p.attributes.heightOptions : [];
  const colores = Array.isArray(p.attributes?.colors) ? p.attributes.colors : [];

  const stockDot =
    p.stock === 0
      ? { dot: "bg-red-400",   text: "text-red-600",   label: "Agotado" }
      : p.stock <= 5
      ? { dot: "bg-amber-400", text: "text-amber-700", label: `¡Solo ${p.stock} disponibles!` }
      : { dot: "bg-green-500", text: "text-green-700", label: "En stock" };

  const minQty = p.unit === "METRO" ? 10 : 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        id: p.id, name: p.name, slug: p.slug,
        basePrice: p.basePrice, unit: p.unit, stock: p.stock,
        collection: p.collection, category: p.category, images: p.images,
      },
      minQty,
    );
    toast.success(`${p.name} agregado`, {
      description: `${minQty}${p.unit === "METRO" ? "m" : " unid."} · $${(p.basePrice * minQty).toFixed(2)}`,
      duration: 2500,
    });
  };

  return (
    <div className="group relative flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-xl hover:shadow-green-900/10 transition-all duration-200">

      {/* Image */}
      <Link href={`/productos/${p.slug}`} className="block relative overflow-hidden" style={{ backgroundColor: catBg }}>
        <div className="relative aspect-[4/3]">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              priority={p.priority}
            />
          ) : (
            /* Dos tercios del catalogo no tienen foto cargada todavia. Una
             * letra gigante gris parece un error de carga; esto parece una
             * ficha pendiente de foto, que es lo que realmente es. */
            <div className="flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center">
              <ImageIcon className="size-7 text-muted-foreground/40" aria-hidden="true" />
              <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                Foto en preparacion
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground/70">
                Escribenos y te la enviamos
              </span>
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {p.isNew && (
              <span className="rounded-sm bg-green-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
                Nuevo
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-sm bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist heart */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle({
                id: p.id, name: p.name, slug: p.slug,
                basePrice: p.basePrice, unit: p.unit, stock: p.stock,
                imageUrl: primaryImage ?? undefined,
                categoryName: p.category?.name ?? p.collection?.name,
              });
              toast(wishlisted ? "Eliminado de favoritos" : "Guardado en favoritos", {
                icon: wishlisted ? "🗑️" : "❤️",
                duration: 1800,
              });
            }}
            aria-label={wishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
            className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:scale-110 transition-all duration-200"
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-400"}`} />
          </button>

          {/* Quick-view icon — appears on hover, links to PDP */}
          <Link
            href={`/productos/${p.slug}`}
            aria-label={`Ver ${p.name}`}
            className="absolute bottom-2.5 right-2.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-white/90 hover:bg-white text-gray-900 rounded-full h-8 w-8 flex items-center justify-center shadow-lg backdrop-blur-sm"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {p.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <span className="rounded-full bg-gray-900/80 px-3 py-1 text-xs font-bold text-white">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Collection label */}
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5 truncate">
          {collectionName}
        </p>

        {/* Name */}
        <Link href={`/productos/${p.slug}`} className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-green-700 transition-colors">
            {p.name}
          </h3>
        </Link>

        {/* Altura y color: es lo primero que pregunta quien va a cercar un
         * terreno, y ya estaba en la base de datos sin mostrarse en ningun
         * sitio. Solo se pinta si el producto lo trae de verdad. */}
        {(alturas.length > 0 || colores.length > 0) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
            {alturas.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Ruler className="size-3 shrink-0 text-brand-green" aria-hidden="true" />
                {alturas.length === 1 ? alturas[0] : `${alturas[0]}–${alturas[alturas.length - 1]}`}
              </span>
            )}
            {colores.length > 0 && (
              <span className="truncate">
                {colores.length === 1 ? colores[0] : `${colores.length} colores`}
              </span>
            )}
          </div>
        )}

        {/* Sin estrellas: el modelo Product no expone valoraciones y el catalogo
         * no tiene ninguna resena cargada. Pintar estrellas vacias o inventadas
         * es peor que no pintarlas — y con marcado AggregateRating seria ademas
         * un riesgo con Google. Cuando existan resenas reales, aqui van. */}

        {/* Price */}
        <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[22px] font-black text-gray-900 leading-none">
            ${Number(p.basePrice).toFixed(2)}
          </span>
          <span className="text-[11px] text-gray-400">{unitLabel}</span>
          {p.comparePrice && p.comparePrice > p.basePrice && (
            <span className="text-xs text-gray-400 line-through">
              ${Number(p.comparePrice).toFixed(2)}
            </span>
          )}
        </div>
        {p.unit === "METRO" && (
          <p className="text-[10px] text-gray-400 mt-0.5">Mínimo 10m · envío incluido desde $50</p>
        )}

        {/* Stock indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${stockDot.dot}`} />
          <span className={`text-[11px] font-semibold ${stockDot.text}`}>
            {stockDot.label}
          </span>
        </div>

        {/* Add to cart button */}
        {p.stock > 0 && (
          <button
            onClick={handleAddToCart}
            aria-label={`Agregar ${p.name} al carrito`}
            className="mt-auto pt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 py-2.5 text-[13px] font-bold tracking-wide text-white hover:bg-green-800 active:scale-[0.98] transition-all duration-150 shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}
