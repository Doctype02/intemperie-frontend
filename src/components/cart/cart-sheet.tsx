"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cart-store";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount());
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingCart className="h-16 w-16 text-gray-300" />
            <div>
              <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
              <p className="text-gray-400 text-sm mt-1">
                Agrega productos desde nuestro catálogo
              </p>
            </div>
            <Button asChild variant="outline" onClick={onClose}>
              <Link href="/productos">Ver Productos</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              {items.map((item) => (
                <CartItem key={`${item.productId}-${item.unit}`} item={item} />
              ))}
            </div>
            <Separator className="my-4" />
            <CartSummary
              subtotal={subtotal}
              itemCount={itemCount}
              showCheckout
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
