"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCartStore } from "@/lib/store/cart-store";

const categories = [
  { name: "Residencial", slug: "residencial", items: ["oceanides-101", "pandora-201", "pandora-204", "afrodita-401", "atenea-303", "super-oceanides-103"] },
  { name: "Industrial", slug: "industrial", items: ["atlas", "atenea-305", "vesta-601", "titan", "super-titan"] },
  { name: "Gubernamental", slug: "gubernamental", items: ["maximus"] },
  { name: "Agropecuario", slug: "agropecuario", items: ["mini-titan"] },
  { name: "Zonas Costeras", slug: "zonas-costeras", items: ["poseidon-502", "selene-701"] },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    if (cartCount > 0) { setCartBounce(true); setTimeout(() => setCartBounce(false), 500); }
  }, [cartCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { router.push(`/productos?search=${encodeURIComponent(search.trim())}`); setSearch(""); }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm border-b border-gray-100/50" : "bg-white"}`}>
      {/* Top bar */}
      <div className="bg-green-800 text-white text-[10px] md:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-1.5">
          <span className="flex items-center gap-1.5 opacity-90">🚚 Envíos a todo Panamá · +507 6287-4042</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-4">
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white font-extrabold text-lg shadow-sm shadow-green-200">I</div>
            <div className="hidden sm:block leading-tight">
              <p className="text-lg font-extrabold tracking-tight text-green-900">INTEMPERIE</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider">CERCAS PVC & MALLAS</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                  <Grid3X3 className="h-4 w-4" /> Productos <ChevronDown className="h-3 w-3 opacity-40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 animate-slide-down">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link href={`/categorias/${cat.slug}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-green-50 transition-colors">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.items.length}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" asChild className="text-sm font-medium text-gray-600 hover:text-gray-900"><Link href="/productos">Catálogo</Link></Button>
            <Button variant="ghost" asChild className="text-sm font-medium text-gray-600 hover:text-gray-900"><Link href="/calculadora">Calculadora</Link></Button>
          </nav>

          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-lg mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors peer-focus:text-green-500" />
              <Input className="peer pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-green-400/40 focus-visible:border-green-400 transition-all" placeholder="Buscar cercas, mallas, colecciones..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b"><p className="text-sm font-medium truncate">{user?.name}</p><p className="text-xs text-gray-500 truncate">{user?.email}</p></div>
                  <DropdownMenuItem asChild><Link href="/cuenta">Mi cuenta</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/cuenta/pedidos">Pedidos</Link></DropdownMenuItem>
                  {user?.role === "ADMIN" && <DropdownMenuItem asChild><Link href="/admin">Admin</Link></DropdownMenuItem>}
                  <DropdownMenuItem onClick={logout} className="text-red-600">Salir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild><Link href="/login"><User className="h-5 w-5" /></Link></Button>
            )}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/carrito">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className={`absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm ${cartBounce ? "animate-bounce-in" : ""}`}>{cartCount}</span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-white lg:hidden animate-slide-down">
          <div className="px-4 py-3 space-y-3">
            <form onSubmit={handleSearch} className="sm:hidden">
              <div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </form>
            <nav className="space-y-1">
              <Link href="/productos" className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Catálogo completo</Link>
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/categorias/${cat.slug}`} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50" onClick={() => setMobileOpen(false)}>{cat.name}</Link>
              ))}
              <Link href="/calculadora" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Calculadora de cercas</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
