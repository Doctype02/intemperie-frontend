"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Truck, Wrench, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCartStore } from "@/lib/store/cart-store";

const megaMenuCategories = [
  {
    name: "Residencial",
    slug: "residencial",
    desc: "Hogares, urbanizaciones",
    products: 7,
  },
  {
    name: "Industrial",
    slug: "industrial",
    desc: "Bodegas, zonas de trabajo",
    products: 5,
  },
  {
    name: "Gubernamental",
    slug: "gubernamental",
    desc: "Instituciones, espacios públicos",
    products: 1,
  },
  {
    name: "Agropecuario",
    slug: "agropecuario",
    desc: "Fincas, producción animal",
    products: 1,
  },
  {
    name: "Zonas Costeras",
    slug: "zonas-costeras",
    desc: "Resistentes al salitre",
    products: 2,
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartBounce, setCartBounce] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cartCount > 0) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 400);
    }
  }, [cartCount]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/productos?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}
    >
      {/* Top Promo Bar */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-1.5 text-[11px] sm:text-xs text-gray-500 sm:justify-between">
          <div className="hidden sm:flex items-center gap-6 overflow-x-auto">
            <span className="flex items-center gap-1.5 whitespace-nowrap hover:text-green-700 cursor-pointer transition-colors">
              <Truck className="h-3.5 w-3.5 text-green-600" />
              Envíos a todo Panamá
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap hover:text-green-700 cursor-pointer transition-colors">
              <Wrench className="h-3.5 w-3.5 text-green-600" />
              Instalación profesional
            </span>
          </div>
          <Link
            href="https://wa.me/50762874042"
            target="_blank"
            className="flex items-center gap-1.5 font-medium text-green-700 hover:text-green-800 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            Cotizar +507 6287-4042
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-3 sm:gap-4">
          {/* Mobile menu button */}
          <button className="lg:hidden -ml-1 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white font-extrabold text-base shadow-sm shadow-green-200">
              I
            </div>
            <div className="hidden sm:block leading-none">
              <p className="text-base font-extrabold tracking-tight text-gray-900">
                INTEMPERIE
              </p>
              <p className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">
                Cercas PVC & Mallas
              </p>
            </div>
          </Link>

          {/* Mega Menu trigger - Desktop */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Productos
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            {megaOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMegaOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {megaMenuCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/productos?category=${cat.slug}`}
                      onClick={() => setMegaOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors group"
                    >
                      <div>
                        <span className="font-semibold text-gray-700 group-hover:text-green-700 transition-colors">
                          {cat.name}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                      </div>
                      <span className="text-xs text-gray-300">{cat.products}</span>
                    </Link>
                  ))}
                  <hr className="my-1" />
                  <Link
                    href="/productos"
                    onClick={() => setMegaOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors"
                  >
                    Ver todo el catálogo →
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="text-sm font-medium text-gray-600 hover:text-gray-900">
              <Link href="/productos">Catálogo</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-sm font-medium text-gray-600 hover:text-gray-900">
              <Link href="/calculadora">Calculadora</Link>
            </Button>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="h-10 pl-10 bg-gray-100 border-gray-200 rounded-full text-sm focus-visible:ring-2 focus-visible:ring-green-400/40 focus-visible:border-green-400 focus-visible:bg-white transition-all"
                placeholder="Buscar cercas, mallas, colecciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {isAuthenticated ? (
              <div className="relative group">
                <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                  <Link href="/cuenta">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="px-3 py-1.5 text-sm font-semibold truncate text-gray-900">{user?.name}</p>
                  <p className="px-3 pb-1.5 text-xs text-gray-400 truncate">{user?.email}</p>
                  <hr className="my-1" />
                  <Link href="/cuenta" className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Mi cuenta</Link>
                  <Link href="/cuenta/pedidos" className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Mis pedidos</Link>
                  {user?.role === "ADMIN" && <Link href="/admin" className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Admin</Link>}
                  <button onClick={logout} className="block w-full text-left rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors">Cerrar sesión</button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link href="/login"><User className="h-5 w-5" /></Link>
              </Button>
            )}

            <Link href="/carrito" className="relative p-2">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white shadow-sm ${
                    cartBounce ? "animate-bounce" : ""
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            <form onSubmit={handleSearch} className="sm:hidden mb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="h-10 pl-10 bg-gray-100 border-gray-200 rounded-full text-sm"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
            {megaMenuCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/productos?category=${cat.slug}`}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                <span className="font-medium text-gray-700">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.products} productos</span>
              </Link>
            ))}
            <hr />
            <Link href="/productos" className="block rounded-lg px-3 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50" onClick={() => setMobileOpen(false)}>
              Catálogo completo
            </Link>
            <Link href="/calculadora" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
              Calculadora
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
