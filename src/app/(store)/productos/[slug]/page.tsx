"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, Ruler, Shield, Package2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGallery } from "@/components/products/product-gallery";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency, getWhatsAppLink, generateProductWhatsAppMessage } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // In a real app this would use SWR or React Query to fetch from API
  // For now, we use a placeholder pattern that works with SSR
  const [product] = useState<Product | null>(null);
  const [loading] = useState(true);
  const [error] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<"meters" | "panels">("meters");
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, unit);
    router.push("/carrito");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
        <p className="text-gray-600 mb-6">
          {error || "El producto que buscas no existe o ha sido descontinuado."}
        </p>
        <Button onClick={() => router.push("/productos")} variant="outline">
          Volver al Catálogo
        </Button>
      </div>
    );
  }

  const panelPrice = product.pricePerPanel ?? product.pricePerMeter * (product.panelWidth ?? 2.5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.category && (
                <Badge variant="secondary">{product.category.name}</Badge>
              )}
              {product.collection && (
                <Badge className="bg-green-100 text-green-800">{product.collection.name}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Precio por metro lineal</p>
              <p className="text-3xl font-bold text-green-700">
                {formatCurrency(product.pricePerMeter)}
              </p>
            </div>
            {product.pricePerPanel && (
              <div>
                <p className="text-sm text-gray-500">Precio por panel</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(product.pricePerPanel)}
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex gap-2 mb-3">
              <Button
                variant={unit === "meters" ? "default" : "outline"}
                size="sm"
                className={unit === "meters" ? "bg-green-700 hover:bg-green-800" : ""}
                onClick={() => setUnit("meters")}
              >
                <Ruler className="h-4 w-4 mr-1" />
                Metros
              </Button>
              <Button
                variant={unit === "panels" ? "default" : "outline"}
                size="sm"
                className={unit === "panels" ? "bg-green-700 hover:bg-green-800" : ""}
                onClick={() => setUnit("panels")}
              >
                <Package2 className="h-4 w-4 mr-1" />
                Paneles
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <span className="text-sm text-gray-500">
                {unit === "meters" ? "metros lineales" : "paneles"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-green-700 hover:bg-green-800"
              onClick={handleAddToCart}
            >
              Añadir al Carrito —{" "}
              {formatCurrency(
                unit === "meters" ? quantity * product.pricePerMeter : quantity * panelPrice
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
              asChild
            >
              <a
                href={getWhatsAppLink(generateProductWhatsAppMessage(product.name))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Cotizar por WhatsApp
              </a>
            </Button>
          </div>

          {product.stock <= 10 && product.stock > 0 && (
            <p className="text-amber-600 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" /> Solo quedan {product.stock} en stock
            </p>
          )}
        </div>
      </div>

      <Separator className="my-12" />

      <Tabs defaultValue="specs">
        <TabsList>
          <TabsTrigger value="specs">Especificaciones</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="install">Instalación</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="mt-4">
          {product.specifications ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">{key}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay especificaciones disponibles para este producto.</p>
          )}
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <div className="prose max-w-none text-gray-600">
            <p>{product.description}</p>
            <p className="mt-4">
              <strong>Material:</strong> {product.material}
            </p>
            {product.panelHeight && (
              <p>
                <strong>Altura del panel:</strong> {product.panelHeight}m
              </p>
            )}
            {product.panelWidth && (
              <p>
                <strong>Ancho del panel:</strong> {product.panelWidth}m
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="install" className="mt-4">
          <div className="text-gray-600 space-y-3">
            <p>
              Ofrecemos servicio de instalación profesional en toda la República de Panamá.
              Nuestro equipo certificado garantiza un trabajo limpio y duradero.
            </p>
            <p>
              <strong>Incluye:</strong> Excavación, colocación de postes, montaje de paneles,
              nivelación y limpieza final.
            </p>
            <p>
              <strong>Tiempo estimado:</strong> La mayoría de las instalaciones residenciales
              se completan en 2-3 días hábiles.
            </p>
            <p>
              <strong>Garantía de instalación:</strong> 2 años en mano de obra.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
