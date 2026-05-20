"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/store/cart-store";
import { ProductGallery } from "@/components/products/product-gallery";
import { Minus, Plus, ShoppingCart, ChevronRight, Calculator, Heart, ChevronDown } from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice?: number;
  pricePerMeter?: number;
  comparePrice?: number;
  unit?: string;
  stock: number;
  sku?: string;
  collection?: { name: string };
  category?: { name: string };
  images?: { id?: string; url: string; alt?: string; order?: number }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specifications?: any;
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const FAQ_ITEMS = [
  {
    q: "¿Las cercas PVC requieren mantenimiento?",
    a: "No. A diferencia de la madera o el metal, el PVC no se oxida, pudre ni necesita pintura. Un lavado ocasional con agua y jabón neutro es suficiente para mantenerlas como nuevas por décadas.",
  },
  {
    q: "¿Cuánto tiempo dura una cerca PVC?",
    a: "Nuestras cercas están fabricadas con PVC virgen de alta densidad, lo que garantiza una vida útil superior a 25 años incluso en zonas costeras y de alta humedad como Panamá.",
  },
  {
    q: "¿Incluyen la instalación?",
    a: "La instalación se cotiza por separado según la longitud, el terreno y la ubicación. Contamos con instaladores certificados en todo Panamá. Puedes solicitarla al momento de la compra o por WhatsApp.",
  },
  {
    q: "¿Hacen envíos a todo Panamá?",
    a: "Sí. Despachamos a Ciudad de Panamá, Panamá Oeste, Colón, Chiriquí y otras provincias. Los pedidos mayores a $50 tienen envío gratuito. Los tiempos de entrega varían entre 2 y 5 días hábiles.",
  },
  {
    q: "¿Puedo ver una muestra antes de comprar?",
    a: "Claro. Puedes visitarnos en nuestra sala de ventas en La Chorrera, Panamá Oeste (Lun–Sáb 8:00–18:00) o solicitar muestras físicas por WhatsApp.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-gray-900 hover:text-green-700 transition-colors"
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-500 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}

function FaqSection() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-extrabold text-gray-900 mb-1">Preguntas frecuentes</h2>
        <p className="text-sm text-gray-400 mb-5">Todo lo que necesitas saber sobre las cercas PVC</p>
        <div>
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailClient({ product }: { product: ProductData }) {
  const [quantity,            setQuantity]            = useState(10);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [added,               setAdded]               = useState(false);
  const [descExpanded,        setDescExpanded]        = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { addItem: trackView } = useRecentlyViewed();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  useEffect(() => {
    const price = Number(product.pricePerMeter ?? product.basePrice ?? 0);
    trackView({
      id: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: price,
      unit: product.unit ?? "METRO",
      imageUrl: product.images?.[0]?.url,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Normalize price — API may return either field
  const price     = Number(product.pricePerMeter ?? product.basePrice ?? 0);
  const unitLabel = product.unit === "PANEL" ? "/panel" : product.unit === "M2" ? "/m²" : "/m lineal";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const specs: { label: string; value: any }[] =
    Array.isArray(product.specifications)
      ? product.specifications
      : product.specifications && typeof product.specifications === "object"
      ? Object.entries(product.specifications).map(([l, v]) => ({ label: l, value: v }))
      : [];

  const installationCost = includeInstallation ? price * quantity * 0.3 : 0;
  const subtotal         = price * quantity;
  const tax              = (subtotal + installationCost) * 0.07;
  const total            = subtotal + installationCost + tax;

  const waText = encodeURIComponent(
    `Hola, quiero cotizar ${product.name} — ${quantity}${product.unit === "PANEL" ? " panel(es)" : "m"}`
  );

  const handleAdd = () => {
    addItem(
      {
        id: product.id, name: product.name, slug: product.slug,
        basePrice: price, unit: product.unit ?? "METRO",
        stock: product.stock, collection: product.collection,
        category: product.category, images: product.images,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    toast.success(`${product.name} agregado al carrito`, {
      description: `${quantity}${product.unit === "PANEL" ? " panel(es)" : "m"} · $${subtotal.toFixed(2)}`,
      duration: 3000,
    });
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 pb-28 lg:pb-8">
        {/* Breadcrumb */}
        <div className="mb-4 hidden sm:flex items-center gap-1 text-xs text-gray-400">
          <Link href="/" className="hover:text-green-600">Inicio</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/productos" className="hover:text-green-600">Productos</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-600 truncate">{product.name}</span>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <ProductGallery images={product.images || []} productName={product.name} />

            {/* Specs */}
            {specs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-extrabold text-gray-900 mb-3">Especificaciones</h2>
                <Card className="border-gray-200">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <tbody>
                          {specs.map((spec, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                              <td className="px-5 py-3 font-semibold text-gray-500 w-2/5">{spec.label}</td>
                              <td className="px-5 py-3 text-gray-900">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-[77px] lg:h-fit">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              {product.collection?.name || product.category?.name} {product.sku && `· SKU: ${product.sku}`}
            </p>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-extrabold text-gray-900">
                ${price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400">{unitLabel}</span>
              {product.comparePrice && product.comparePrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  ${Number(product.comparePrice).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                product.stock === 0
                  ? "bg-red-50 text-red-700"
                  : product.stock <= 5
                  ? "bg-amber-50 text-amber-700"
                  : "bg-green-50 text-green-700"
              }`}>
                {product.stock === 0 ? "Agotado" : product.stock <= 5 ? `Solo ${product.stock} disponibles` : "En stock · listo para despachar"}
              </span>
              <button
                onClick={() => {
                  const price = Number(product.pricePerMeter ?? product.basePrice ?? 0);
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    basePrice: price,
                    unit: product.unit ?? "METRO",
                    imageUrl: product.images?.[0]?.url,
                    categoryName: product.category?.name ?? product.collection?.name,
                  });
                  toast(wishlisted ? "Eliminado de favoritos" : "Guardado en favoritos", {
                    icon: wishlisted ? "🗑️" : "❤️",
                    duration: 1800,
                  });
                }}
                aria-label={wishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
                className="ml-auto flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500 hover:border-red-300 hover:text-red-500 transition-all duration-200"
              >
                <Heart className={`h-3.5 w-3.5 transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
                {wishlisted ? "Guardado" : "Guardar"}
              </button>
            </div>

            {product.description && (
              <div className="mt-3">
                <p className={`text-sm text-gray-600 leading-relaxed ${!descExpanded ? "line-clamp-4" : ""}`}>
                  {product.description}
                </p>
                {!descExpanded && (product.description?.length ?? 0) > 200 && (
                  <button
                    onClick={() => setDescExpanded(true)}
                    className="mt-1 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
                  >
                    Leer descripción completa ↓
                  </button>
                )}
              </div>
            )}

            {/* Calculator */}
            <div className="mt-6 rounded-xl border-2 border-green-100 bg-green-50/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-green-700" />
                <h3 className="text-sm font-extrabold text-green-800">Calculadora de presupuesto</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase">
                    {product.unit === "PANEL" ? "Cantidad de paneles" : "Metros lineales"}
                  </label>
                  <div className="mt-1 flex items-center rounded-lg border bg-white">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-400 hover:bg-gray-50 rounded-l-lg">
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-full text-center font-bold text-base bg-transparent border-0 outline-none"
                    />
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 text-gray-400 hover:bg-gray-50 rounded-r-lg">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Incluir instalación (+30%)</span>
                </label>

                <div className="border-t pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>{quantity}{product.unit === "PANEL" ? " panel" : "m"} × ${price.toFixed(2)}</span>
                    <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {includeInstallation && (
                    <div className="flex justify-between text-gray-500">
                      <span>Instalación</span>
                      <span className="font-medium">${installationCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>ITBMS (7%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 text-base font-extrabold text-gray-900">
                    <span>Total estimado</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop CTA buttons */}
            {product.stock > 0 && (
              <div className="mt-4 space-y-2 hidden lg:block">
                <Button size="lg" className="w-full bg-green-700 hover:bg-green-800 font-bold text-sm h-12" onClick={handleAdd}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {added ? "¡Agregado al carrito!" : `Agregar ${quantity}${product.unit === "PANEL" ? " panel(es)" : "m"} al carrito`}
                </Button>
                <Button size="lg" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 h-11 text-sm" asChild>
                  <Link href={`https://wa.me/50762874042?text=${waText}`} target="_blank">
                    <IconWhatsApp className="mr-2 h-4 w-4" />
                    Cotizar por WhatsApp
                  </Link>
                </Button>
              </div>
            )}

            {/* Payment methods */}
            <div className="mt-4 rounded-lg border p-3 hidden lg:block">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Pago seguro</p>
              <div className="flex gap-1.5 flex-wrap">
                {["Visa", "Mastercard", "Yappy", "Clave"].map((m) => (
                  <span key={m} className="rounded border px-2 py-0.5 text-[10px] font-medium text-gray-500 border-gray-200">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <FaqSection />

      {/* Mobile sticky CTA bar — fixed to bottom on mobile only */}
      {product.stock > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 pt-3 flex gap-3 shadow-2xl" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <Button
            className="flex-1 bg-green-700 hover:bg-green-800 font-bold h-12 text-sm"
            onClick={handleAdd}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {added ? "¡Agregado!" : `Agregar ${quantity}m — $${subtotal.toFixed(2)}`}
          </Button>
          <Link
            href={`https://wa.me/50762874042?text=${waText}`}
            target="_blank"
            className="flex items-center justify-center gap-1.5 px-4 rounded-xl border-2 border-green-200 text-green-700 hover:bg-green-50 font-bold text-sm transition-colors"
          >
            <IconWhatsApp className="h-5 w-5" />
          </Link>
        </div>
      )}
    </>
  );
}
