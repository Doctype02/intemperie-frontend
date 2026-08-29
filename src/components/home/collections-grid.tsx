import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  unit: string;
  stock: number;
  category?: { name: string };
  collection?: { name: string };
  isActive: boolean;
}

interface CollectionsGridProps {
  products: Product[];
}

const stockLabel = (stock: number) => {
  if (stock === 0) return { text: "Agotado", color: "bg-red-100 text-red-700" };
  if (stock <= 5) return { text: `Solo ${stock} unidades`, color: "bg-orange-100 text-orange-700" };
  return { text: "En inventario", color: "bg-brand-green-soft text-brand-green-deep" };
};

export function CollectionsGrid({ products }: CollectionsGridProps) {
  return (
    <section className="py-16 bg-surface-sunk">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Colecciones destacadas</h2>
            <p className="mt-2 text-muted-foreground">Nuestras cercas más vendidas en Panamá</p>
          </div>
          <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-green-deep hover:text-brand-green-deep">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => {
            const stock = stockLabel(product.stock);
            return (
              <Link key={product.id} href={`/productos/${product.slug}`} className="group">
                <Card className="h-full overflow-hidden border-border transition-all hover:border-brand-green-soft hover:shadow-md">
                  <div className="relative h-48 bg-gradient-to-br from-brand-green-soft to-brand-green-soft flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-5xl opacity-20 select-none">🏗️</p>
                      <p className="mt-2 text-xs text-brand-green font-medium">{product.collection?.name || product.category?.name}</p>
                    </div>
                    {product.stock > 0 && product.stock <= 5 && (
                      <Badge className="absolute left-3 top-3 bg-orange-500 text-white border-0">
                        ¡Quedan pocos!
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge className="absolute left-3 top-3 bg-red-500 text-white border-0">
                        Agotado
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.collection?.name || "Intemperie"}</p>
                    <h3 className="font-semibold text-foreground group-hover:text-brand-green-deep transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        ${Number(product.basePrice).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">/{product.unit === "METRO" ? "m" : product.unit === "PANEL" ? "panel" : "unidad"}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className={`text-xs border-0 ${stock.color}`}>
                        {stock.text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" className="border-brand-green-soft text-brand-green-deep hover:bg-brand-green-soft" asChild>
            <Link href="/productos">
              Ver todos los productos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
