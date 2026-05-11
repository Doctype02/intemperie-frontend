"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingCart,
  Menu,
  User,
  ChevronDown,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { CartSheet } from "@/components/cart/cart-sheet";
import { MobileNav } from "@/components/layout/mobile-nav";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/colecciones/residencial", label: "Colecciones" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="bg-green-700 text-white text-sm py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            <span>+507 6287-4042</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">ventas@tiendasintemperie.com</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Envíos a todo Panamá</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded bg-green-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">I</span>
              </div>
              <span className="text-xl font-bold text-green-700 tracking-tight">
                INTEMPERIE
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.href.startsWith("#") ? (
                  <Button key={link.href} variant="ghost" asChild>
                    <a href={link.href}>{link.label}</a>
                  </Button>
                ) : (
                  <Button key={link.href} variant="ghost" asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                )
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500 text-white text-xs rounded-full">
                  {itemCount}
                </Badge>
              )}
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta">Resumen</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/pedidos">Mis Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/direcciones">Direcciones</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
