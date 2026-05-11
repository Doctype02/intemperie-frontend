"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCartStore } from "@/lib/store/cart-store";

const categories = [
  { name: "Residencial", slug: "residencial" },
  { name: "Industrial", slug: "industrial" },
  { name: "Gubernamental", slug: "gubernamental" },
  { name: "Agropecuario", slug: "agropecuario" },
  { name: "Zonas Costeras", slug: "zonas-costeras" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { router.push(`/productos?search=${encodeURIComponent(search.trim())}`); setSearch(""); }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="bg-green-800 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px]">
          <span className="flex items-center gap-1.5">🚚 Envíos a todo Panamá</span>
          <div className="hidden sm:flex items-center gap-4">
            <a href="mailto:ventas@tiendasintemperie.com" className="flex items-center gap-1 hover:underline"><Mail className="h-3 w-3" />ventas@tiendasintemperie.com</a>
            <a href="tel:+50762874042" className="flex items-center gap-1 hover:underline"><Phone className="h-3 w-3" />+507 6287-4042</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-4">
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-green-700 text-white font-extrabold text-base">I</div>
            <div className="hidden sm:block leading-none">
              <p className="text-base font-extrabold text-green-900 tracking-tight">INTEMPERIE</p>
              <p className="text-[9px] text-gray-400 font-medium">CERCAS PVC & MALLAS</p>
            </div>
          </Link>

          {/* Mega menu trigger */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Productos <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            {megaOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMegaOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border bg-white p-2 shadow-lg">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categorias/${cat.slug}`}
                      className="block rounded px-3 py-2.5 text-sm hover:bg-green-50 hover:text-green-700 transition-colors"
                      onClick={() => setMegaOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="my-1" />
                  <Link href="/productos" className="block rounded px-3 py-2.5 text-sm font-medium text-green-700 hover:bg-green-50" onClick={() => setMegaOpen(false)}>
                    Ver todos los productos
                  </Link>
                </div>
              </>
            )}
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="text-sm text-gray-600"><Link href="/productos">Catálogo</Link></Button>
            <Button variant="ghost" size="sm" asChild className="text-sm text-gray-600"><Link href="/calculadora">Calculadora</Link></Button>
          </nav>

          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-lg mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="pl-9 h-9 bg-gray-100 border-gray-200 rounded-full text-sm focus-visible:ring-green-500" placeholder="Buscar cercas, mallas..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated ? (
              <div className="relative group">
                <Button variant="ghost" size="icon" asChild><Link href="/cuenta"><User className="h-5 w-5" /></Link></Button>
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-white p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="px-3 py-1.5 text-sm font-medium truncate">{user?.name}</p>
                  <Link href="/cuenta" className="block rounded px-3 py-1.5 text-sm hover:bg-gray-50">Mi cuenta</Link>
                  <Link href="/cuenta/pedidos" className="block rounded px-3 py-1.5 text-sm hover:bg-gray-50">Pedidos</Link>
                  {user?.role === "ADMIN" && <Link href="/admin" className="block rounded px-3 py-1.5 text-sm hover:bg-gray-50">Admin</Link>}
                  <button onClick={logout} className="block w-full text-left rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Salir</button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="icon" asChild><Link href="/login"><User className="h-5 w-5" /></Link></Button>
            )}

            <Link href="/carrito" className="relative p-2">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-[10px] font-bold text-white">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white lg:hidden">
          <div className="px-4 py-3 space-y-1">
            <form onSubmit={handleSearch} className="sm:hidden mb-3">
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input className="pl-9 h-9 bg-gray-100 border-gray-200 rounded-full text-sm" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </form>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categorias/${cat.slug}`} className="block rounded px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setMobileOpen(false)}>{cat.name}</Link>
            ))}
            <hr />
            <Link href="/productos" className="block rounded px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Catálogo completo</Link>
            <Link href="/calculadora" className="block rounded px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Calculadora</Link>
          </div>
        </div>
      )}
    </header>
  );
}
