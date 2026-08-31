"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Ruler, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

import { useWishlist } from "@/lib/hooks/use-wishlist"
import { useCartStore } from "@/lib/store/cart-store"
import type { ProductImage, ProductUnit } from "@/types"

/* Ficha de producto del listado — sistema «Perímetro».
 *
 * Sigue siendo `"use client"`, y con razón: el carrito y los favoritos viven en
 * el navegador. Es la única isla de la parrilla; todo lo que la rodea (parrilla,
 * facetas, orden, paginación) es HTML de servidor.
 *
 * Lo que cambia aquí:
 *
 * 1. COLOR. Tenía dieciséis literales y un mapa `catColors` con un hexadecimal
 *    escrito a mano por categoría. Ese mapa se rompía dos veces: en modo oscuro
 *    metía un pastel clarísimo detrás de la foto, sobre un fondo azul marino, y
 *    con una categoría nueva en el CMS caía al color por defecto sin que nadie
 *    se enterara. Un fondo distinto por categoría tampoco informaba de nada: el
 *    nombre de la categoría ya está escrito justo debajo.
 *
 * 2. EL HUECO SIN FOTO. Diez de las quince fichas del catálogo no tienen
 *    fotografía. Un icono de imagen genérico dice «esto falló»; el alzado
 *    dibujado en CSS (`.diagram`, ver globals.css) dice «ficha pendiente de
 *    foto» y encima informa —se distingue una malla electrosoldada de una cerca
 *    de listones de un vistazo—. Es el mismo recurso que usa la portada.
 *
 * 3. MARCADO. La imagen iba envuelta en un `<Link>` que contenía a su vez otro
 *    `<Link>` (la lupa de vista rápida) y un `<button>` (favoritos): contenido
 *    interactivo dentro de un ancla, que es HTML inválido y que el navegador
 *    resuelve como quiere. Además, sin fotografía ese ancla se quedaba sin
 *    nombre accesible (su único hijo era decorativo) y el teclado pasaba dos
 *    veces por el mismo destino.
 *
 *    Ahora hay UN enlace, el del título, extendido sobre toda la tarjeta con
 *    `after:absolute after:inset-0`: se puede pulsar la foto entera, hay un solo
 *    tabulador por ficha y el lector de pantalla anuncia el nombre del producto.
 *    Los dos controles que no navegan (favoritos y carrito) suben con `z-10`
 *    por encima de esa capa. La lupa de vista rápida desaparece: llevaba a la
 *    misma URL que el título y sólo existía al pasar el ratón, así que en móvil
 *    —donde se ve el catálogo— no existía.
 *
 * Nada de estrellas, SKU ni marca: el modelo no los tiene y no se inventan.
 */

interface ProductCardProps {
  id: string
  name: string
  slug: string
  basePrice: number
  comparePrice?: number
  unit: ProductUnit
  stock: number
  isNew?: boolean
  /* Atributos reales del catálogo (columna `attributes` de Product). No hay
   * SKU ni reseñas en el modelo: mostrarlos sería inventar datos. Lo que un
   * comprador de cercas pregunta primero es la altura, y eso sí está. */
  attributes?: {
    heightOptions?: string[]
    colors?: string[]
    material?: string
    warranty?: string
  } | null
  category?: { name: string } | null
  collection?: { name: string } | null
  images?: ProductImage[]
  /* Sólo la primera ficha de la parrilla: ver `ProductGrid`. */
  preload?: boolean
}

export function ProductCard(p: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, isWishlisted } = useWishlist()
  const wishlisted = isWishlisted(p.id)

  const collectionName = p.collection?.name || p.category?.name || "Intemperie"
  const primaryImage = p.images?.[0]?.url || null
  const soldOut = p.stock === 0

  /* La unidad se escribe igual que en `unitSuffix` de product-filters, pero no
     se importa de allí: ese módulo arrastra el panel de facetas y el formulario
     de precio, que son de servidor. Importarlo desde esta isla los bajaría al
     navegador enteros para reutilizar tres palabras. */
  const unitLabel = p.unit === "METRO" ? "/m" : p.unit === "PANEL" ? "/panel" : "c/u"

  /* Mismo criterio que la portada: el catálogo no marca el tipo de cerca en
     ningún campo, pero los quince nombres lo dicen. Sólo decide qué alzado se
     dibuja cuando no hay foto, así que fallar aquí no cuesta nada. */
  const mesh = /malla/i.test(p.name)

  const discount =
    p.comparePrice && p.comparePrice > p.basePrice
      ? Math.round(((p.comparePrice - p.basePrice) / p.comparePrice) * 100)
      : 0

  /* `attributes` es Json en Prisma: puede venir vacío o incompleto según el
   * producto, así que se normaliza a array antes de pintar nada. */
  const alturas = Array.isArray(p.attributes?.heightOptions) ? p.attributes.heightOptions : []
  const colores = Array.isArray(p.attributes?.colors) ? p.attributes.colors : []

  /* Existencias: el punto de color no va solo. Lleva su texto al lado porque
     un semáforo sin etiqueta no dice nada a quien no distingue rojo de verde. */
  const stockTone = soldOut
    ? { dot: "bg-destructive", text: "text-destructive", label: "Agotado" }
    : p.stock <= 5
      ? { dot: "bg-warning", text: "text-warning", label: `Solo ${p.stock} disponibles` }
      : { dot: "bg-success", text: "text-success", label: "En existencia" }

  const minQty = p.unit === "METRO" ? 10 : 1

  const handleAddToCart = () => {
    addItem(
      {
        id: p.id, name: p.name, slug: p.slug,
        basePrice: p.basePrice, unit: p.unit, stock: p.stock,
        collection: p.collection, category: p.category, images: p.images,
      },
      minQty,
    )
    toast.success(`${p.name} agregado`, {
      description: `${minQty}${p.unit === "METRO" ? "m" : " unid."} · $${(p.basePrice * minQty).toFixed(2)}`,
      duration: 2500,
    })
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-brand-green focus-within:border-brand-green">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={p.name}
            fill
            /* La retícula real es 1 columna en móvil, 2 desde `sm` y 3 desde
               `xl` (ver ProductGrid). El `sizes` anterior decía 50vw en móvil y
               pedía imágenes de la mitad de ancho del hueco: se veían borrosas
               justo donde más se mira el catálogo. */
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            /* Next 16: `priority` está obsoleto en favor de `preload`. */
            preload={p.preload}
          />
        ) : (
          /* Decorativo: toda la información está en texto debajo. */
          <div
            className={`diagram size-full ${mesh ? "diagram-mesh" : "diagram-picket"}`}
            aria-hidden="true"
          />
        )}

        {(p.isNew || discount > 0) && (
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {p.isNew && (
              <span className="rounded-sm bg-brand-green-deep px-1.5 py-0.5 text-2xs font-bold text-on-dark">
                Nuevo
              </span>
            )}
            {discount > 0 && (
              <span className="tabular rounded-sm bg-destructive px-1.5 py-0.5 text-2xs font-bold text-destructive-foreground">
                -{discount}%
              </span>
            )}
          </div>
        )}

        {/* El objetivo táctil mide 44 px aunque el círculo visible mida 32: se
            pulsa con el pulgar en marcha, y agrandar el círculo taparía la
            foto. `z-10` lo saca por encima del enlace extendido del título. */}
        <button
          type="button"
          onClick={() => {
            toggle({
              id: p.id, name: p.name, slug: p.slug,
              basePrice: p.basePrice, unit: p.unit, stock: p.stock,
              imageUrl: primaryImage ?? undefined,
              categoryName: p.category?.name ?? p.collection?.name,
            })
            toast(wishlisted ? "Eliminado de favoritos" : "Guardado en favoritos", {
              duration: 1800,
            })
          }}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? `Quitar ${p.name} de favoritos` : `Guardar ${p.name} en favoritos`}
          className="absolute top-0.5 right-0.5 z-10 flex size-tap items-center justify-center"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-surface/95 shadow-xs">
            <Heart
              className={`size-4 transition-colors ${
                wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
              }`}
              aria-hidden="true"
            />
          </span>
        </button>

        {soldOut && (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-surface/70"
          >
            <span className="rounded-full bg-brand-navy px-3 py-1 text-xs font-bold text-on-dark">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <p className="eyebrow truncate text-muted-foreground">{collectionName}</p>

        <h3 className="mt-1">
          {/* El único enlace de la ficha, extendido sobre toda la tarjeta. */}
          <Link
            href={`/productos/${p.slug}`}
            className="line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-brand-green-deep after:absolute after:inset-0"
          >
            {p.name}
          </Link>
        </h3>

        {/* Altura y color: es lo primero que pregunta quien va a cercar un
         * terreno, y ya estaba en la base de datos sin mostrarse en ningún
         * sitio. Sólo se pinta si el producto lo trae de verdad. */}
        {(alturas.length > 0 || colores.length > 0) && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
            {alturas.length > 0 && (
              <span className="tabular inline-flex items-center gap-1">
                <Ruler className="size-3 shrink-0 text-brand-green" aria-hidden="true" />
                <span className="sr-only">Alturas: </span>
                {alturas.length === 1 ? alturas[0] : `${alturas[0]}–${alturas[alturas.length - 1]}`}
              </span>
            )}
            {colores.length > 0 && (
              <span className="truncate">
                {colores.length === 1 ? colores[0] : `${colores.length} colores`}
              </span>
            )}
          </p>
        )}

        {/* Sin estrellas: el modelo Product no expone valoraciones y el catálogo
         * no tiene ninguna reseña cargada. Pintar estrellas vacías o inventadas
         * es peor que no pintarlas — y con marcado AggregateRating sería además
         * un riesgo con Google. Cuando existan reseñas reales, aquí van. */}

        <p className="mt-2.5 flex flex-wrap items-baseline gap-1.5">
          <span className="tabular text-2xl leading-none font-bold text-foreground">
            ${Number(p.basePrice).toFixed(2)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{unitLabel}</span>
          {p.comparePrice && p.comparePrice > p.basePrice && (
            <span className="tabular text-xs text-muted-foreground line-through">
              ${Number(p.comparePrice).toFixed(2)}
            </span>
          )}
        </p>

        {/* Sólo el mínimo de venta, que es el que aplica este mismo componente
            al añadir al carrito. La línea anterior prometía además «envío
            incluido desde $50»: esa política no está en el modelo ni verificada
            en ningún sitio, y una promesa de envío inventada en una ficha se
            cobra en la primera entrega. */}
        {p.unit === "METRO" && (
          <p className="tabular mt-1 text-2xs text-muted-foreground">
            Pedido mínimo {minQty} m
          </p>
        )}

        <p className="mt-2 flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${stockTone.dot}`} />
          <span className={`tabular text-xs font-semibold ${stockTone.text}`}>
            {stockTone.label}
          </span>
        </p>

        {!soldOut && (
          <div className="mt-auto pt-3">
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`Agregar ${p.name} al carrito`}
              className="relative z-10 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-green-deep"
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
              Agregar al carrito
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
