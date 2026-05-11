"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCartStore } from "@/lib/store/cart-store";
import { TopBar } from "./top-bar";

const categories = [
  {
    name: "Residencial",
    slug: "residencial",
    items: ["oceanides-101", "super-oceanides-103", "pandora-201", "pandora-204", "afrodita-401", "atenea-303"],
  },
  {
    name: "Industrial",
    slug: "industrial",
    items: ["atlas", "atenea-305", "vesta-601", "titan", "super-titan"],
  },
  {
    name: "Gubernamental",
    slug: "gubernamental",
    items: ["maximus"],
  },
  {
    name: "Agropecuario",
    slug: "agropecuario",
    items: ["mini-titan"],
  },
  {
    name: "Zonas Costeras",
    slug: "zonas-costeras",
    items: ["poseidon-502", "selene-701"],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/productos?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <TopBar />
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Mobile menu */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-700 text-white font-bold text-lg">
              I
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-bold leading-tight text-green-800">INTEMPERIE</p>
              <p className="text-[10px] leading-tight text-gray-500">Cercas PVC & Mallas</p>
            </div>
          </Link>

          {/* Mega menu - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-sm font-medium">
                  <Grid3X3 className="h-4 w-4" />
                  Productos
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link
                      href={`/categorias/${cat.slug}`}
                      className="flex items-center justify-between rounded px-2 py-2 hover:bg-green-50"
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.items.length}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/productos">Catálogo</Link>
            </Button>
            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/calculadora">Calculadora</Link>
            </Button>
            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="#contacto">Contacto</Link>
            </Button>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9 bg-gray-100 border-none focus-visible:ring-green-500"
                placeholder="Buscar cercas, mallas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta">Mi cuenta</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta/pedidos">Mis pedidos</Link>
                  </DropdownMenuItem>
                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/carrito">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white lg:hidden">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-4 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 bg-gray-100 border-none"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
            <nav className="space-y-1">
              <Link
                href="/productos"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                Catálogo completo
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categorias/${cat.slug}`}
                  className="block rounded-lg px-3 py-2.5 text-sm hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/calculadora"
                className="block rounded-lg px-3 py-2.5 text-sm hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                Calculadora de cercas
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
