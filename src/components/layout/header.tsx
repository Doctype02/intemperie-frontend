"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown,
  Phone, Clock, Instagram, Facebook, Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCartStore } from "@/lib/store/cart-store";

const navCategories = [
  { name: "Residencial",    slug: "residencial",    desc: "Hogares y urbanizaciones",      count: 7 },
  { name: "Industrial",     slug: "industrial",     desc: "Bodegas y zonas industriales",   count: 5 },
  { name: "Gubernamental",  slug: "gubernamental",  desc: "Instituciones públicas",         count: 1 },
  { name: "Agropecuario",   slug: "agropecuario",   desc: "Fincas y producción animal",     count: 1 },
  { name: "Zonas Costeras", slug: "zonas-costeras", desc: "Resistentes al salitre",         count: 2 },
];

const navLinks = [
  { label: "Inicio",       href: "/" },
  { label: "Nosotros",     href: "/nosotros" },
  { label: "Calculadora",  href: "/calculadora" },
  { label: "Cotizar",      href: "/nosotros#cotizaciones" },
];

export function Header() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [megaOpen,     setMegaOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [cartBounce,   setCartBounce]   = useState(false);

  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (cartCount > 0) { setCartBounce(true); setTimeout(() => setCartBounce(false), 400); }
  }, [cartCount]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/productos?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? "shadow-md" : ""}`}>

      {/* ── Tier 1: Free-shipping announcement ── */}
      <div className="bg-green-700 text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-9">
          <p className="font-semibold truncate">
            🚚&nbsp; <span className="hidden sm:inline">Envío gratis en pedidos mayores a </span>$50 &mdash; Panamá y provincias
          </p>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <a href="https://wa.me/50762874042" target="_blank" rel="noopener noreferrer"
               className="hover:text-green-200 transition-colors text-[11px]">
              📱 +507 6287-4042
            </a>
            <div className="flex items-center gap-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                 className="hover:text-green-200 transition-colors"><Facebook className="h-3.5 w-3.5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                 className="hover:text-green-200 transition-colors"><Instagram className="h-3.5 w-3.5" /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                 className="hover:text-green-200 transition-colors"><Youtube className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier 2: Main bar ── */}
      <div className={`bg-white border-b border-gray-200 transition-all duration-200 ${scrolled ? "border-gray-200" : "border-gray-100"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 sm:h-16 items-center gap-3">

            {/* Mobile hamburger */}
            <button
              className="lg:hidden -ml-1 p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5 mr-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white font-black text-lg shadow-sm">
                I
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-[15px] font-black tracking-tight text-gray-900 leading-none">INTEMPERIE</p>
                <p className="text-[9px] font-bold text-gray-400 tracking-[0.15em] uppercase leading-none mt-0.5">
                  Cercas PVC &amp; Mallas
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {/* Productos mega-menu */}
              <div className="relative">
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
                    <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                      {navCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/productos?category=${cat.slug}`}
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors">
                              {cat.name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{cat.desc}</p>
                          </div>
                          <span className="text-xs text-gray-300">{cat.count}</span>
                        </Link>
                      ))}
                      <hr className="my-1.5 border-gray-100" />
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

              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Search — desktop */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm lg:max-w-md xl:max-w-lg mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  className="h-9 pl-9 pr-4 bg-gray-100 border-transparent rounded-full text-sm focus-visible:ring-1 focus-visible:ring-green-400 focus-visible:border-green-400 focus-visible:bg-white transition-all"
                  placeholder="Buscar cercas, mallas…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="sm:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Mi cuenta"
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-50">
                        <p className="px-3 py-1.5 text-sm font-semibold truncate text-gray-900">{user?.name}</p>
                        <p className="px-3 pb-1.5 text-xs text-gray-400 truncate">{user?.email}</p>
                        <hr className="my-1 border-gray-100" />
                        {[
                          { label: "Mi cuenta",    href: "/cuenta" },
                          { label: "Mis pedidos",  href: "/cuenta/pedidos" },
                          ...(user?.role === "ADMIN" ? [{ label: "Admin", href: "/admin" }] : []),
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full text-left rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Ingresar"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              {/* Cart */}
              <Link href="/carrito" className="relative p-2 rounded-md hover:bg-gray-100 transition-colors" aria-label="Carrito">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className={`absolute top-0.5 right-0.5 flex h-4.5 w-4.5 min-w-[1.1rem] items-center justify-center rounded-full bg-green-600 text-[9px] font-black text-white ${cartBounce ? "scale-125" : ""} transition-transform`}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile search dropdown */}
        {searchOpen && (
          <div className="sm:hidden border-t border-gray-100 px-4 py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  autoFocus
                  className="h-10 pl-9 bg-gray-100 border-transparent rounded-full text-sm"
                  placeholder="Buscar cercas, mallas…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Tier 3: Secondary nav bar (desktop) ── */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-1 h-9 text-[13px]">
            <Link href="/productos" className="flex items-center gap-1 rounded px-3 h-full font-semibold text-gray-700 hover:bg-gray-200 hover:text-green-700 transition-colors">
              🏠 Residencial
            </Link>
            <Link href="/productos?category=industrial" className="flex items-center gap-1 rounded px-3 h-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
              🏭 Industrial
            </Link>
            <Link href="/productos?category=gubernamental" className="flex items-center gap-1 rounded px-3 h-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
              🏛️ Gubernamental
            </Link>
            <Link href="/productos?category=agropecuario" className="flex items-center gap-1 rounded px-3 h-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
              🌾 Agropecuario
            </Link>
            <Link href="/productos?category=zonas-costeras" className="flex items-center gap-1 rounded px-3 h-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
              🌊 Zonas Costeras
            </Link>
            <div className="ml-auto flex items-center gap-1 text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">Lun–Sáb 8:00 AM – 6:00 PM</span>
              <span className="mx-2 text-gray-300">|</span>
              <a href="mailto:ventas@intemperie.com" className="text-xs hover:text-green-700 transition-colors">
                ventas@intemperie.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-0.5">
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/productos?category=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.count} productos</span>
              </Link>
            ))}
            <hr className="border-gray-100 my-1" />
            <Link href="/productos" onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors">
              Catálogo completo
            </Link>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="pt-2 px-3 flex items-center gap-3 text-gray-500">
              <a href="https://wa.me/50762874042" className="text-xs flex items-center gap-1 hover:text-green-700">
                📱 +507 6287-4042
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
