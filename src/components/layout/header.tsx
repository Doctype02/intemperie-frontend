"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight,
  Phone, Clock, Mail,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useCartStore } from "@/lib/store/cart-store";

/* ── Inline SVG social icons (lucide-react v1.14 doesn't ship these) ─────── */
function IconFacebook() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

/* ── Nav data ─────────────────────────────────────────────────────────────── */
const pvcResidencial = [
  { name: "Oceanides 101",       slug: "cerca-pvc-oceanides-101" },
  { name: "Super Oceanides 103", slug: "cerca-pvc-super-oceanides-103" },
  { name: "Pandora 201",         slug: "cerca-pvc-pandora-201" },
  { name: "Pandora 204",         slug: "cerca-pvc-pandora-204" },
  { name: "Afrodita 401",        slug: "cerca-pvc-afrodita-401" },
];
const pvcIndustrial = [
  { name: "Atlas",      slug: "cerca-pvc-atlas" },
  { name: "Atenea 303", slug: "cerca-pvc-atenea-303" },
  { name: "Atenea 305", slug: "cerca-pvc-atenea-305" },
  { name: "Vesta 601",  slug: "cerca-pvc-vesta-601" },
];
const pvcCosteras = [
  { name: "Poseidón 502", slug: "cerca-pvc-poseidon-502" },
  { name: "Selene 701",   slug: "cerca-pvc-selene-701" },
];
const mallas = [
  { name: "Mini Titan",  slug: "malla-electrosoldada-mini-titan" },
  { name: "Titan",       slug: "malla-electrosoldada-titan" },
  { name: "Super Titan", slug: "malla-electrosoldada-super-titan" },
  { name: "Maximus",     slug: "malla-electrosoldada-maximus" },
];
const colecciones = [
  { name: "Residencial",    slug: "residencial" },
  { name: "Industrial",     slug: "industrial" },
  { name: "Zonas Costeras", slug: "zonas-costeras" },
  { name: "Gubernamental",  slug: "gubernamental" },
  { name: "Agropecuario",   slug: "agropecuario" },
];

/* ── Small dropdown wrapper ───────────────────────────────────────────────── */
interface SimpleDropdownProps {
  label: string;
  children: React.ReactNode;
}
function SimpleDropdown({ label, children }: SimpleDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-full px-3 py-2 text-[13px] font-semibold text-gray-700 hover:text-green-700 hover:bg-gray-100 rounded transition-colors whitespace-nowrap"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Mega dropdown for Cercas PVC ─────────────────────────────────────────── */
function CercasMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-[620px] rounded-xl border border-gray-100 bg-white shadow-2xl">
      <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100">
        {/* Col 1 */}
        <div className="p-4">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
            Línea Residencial
          </p>
          {pvcResidencial.map((p) => (
            <Link
              key={p.slug}
              href={`/productos/${p.slug}`}
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
            >
              <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-green-500 shrink-0" />
              {p.name}
            </Link>
          ))}
        </div>
        {/* Col 2 */}
        <div className="p-4">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
            Línea Industrial
          </p>
          {pvcIndustrial.map((p) => (
            <Link
              key={p.slug}
              href={`/productos/${p.slug}`}
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
            >
              <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-green-500 shrink-0" />
              {p.name}
            </Link>
          ))}
        </div>
        {/* Col 3 */}
        <div className="p-4">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
            Zonas Costeras
          </p>
          {pvcCosteras.map((p) => (
            <Link
              key={p.slug}
              href={`/productos/${p.slug}`}
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
            >
              <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-green-500 shrink-0" />
              {p.name}
            </Link>
          ))}
        </div>
      </div>
      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-3">
        <Link
          href="/productos"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 hover:text-green-800 transition-colors"
        >
          Ver todo el catálogo <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* ── Mobile accordion section ─────────────────────────────────────────────── */
function MobileSection({
  title, children,
}: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-bold text-gray-800"
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-2 px-2">{children}</div>}
    </div>
  );
}

/* ── Main Header ──────────────────────────────────────────────────────────── */
export function Header() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [cercasOpen,   setCercasOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [cartBounce,   setCartBounce]   = useState(false);

  const cercasRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  /* Scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Cart bounce */
  useEffect(() => {
    if (cartCount > 0) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 400);
    }
  }, [cartCount]);

  /* Close Cercas mega on outside click */
  useEffect(() => {
    if (!cercasOpen) return;
    function handler(e: MouseEvent) {
      if (cercasRef.current && !cercasRef.current.contains(e.target as Node)) {
        setCercasOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cercasOpen]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/productos?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const closeAll = () => {
    setMobileOpen(false);
    setCercasOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? "shadow-md" : ""}`}>

      {/* ── Tier 1: Announcement bar ──────────────────────────────────────── */}
      <div className="bg-green-800 text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-8">
          <p className="font-semibold truncate text-[11px]">
            🚚&nbsp;Envío gratis en pedidos mayores a $50 — Panamá y provincias
          </p>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <a
              href="tel:+50762874042"
              className="flex items-center gap-1.5 text-[11px] font-medium hover:text-green-200 transition-colors"
            >
              <Phone className="h-3 w-3" />
              +507 6287-4042
            </a>
            <div className="flex items-center gap-2.5">
              <a
                href="https://facebook.com/intemperie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-green-200 transition-colors"
              >
                <IconFacebook />
              </a>
              <a
                href="https://instagram.com/intemperie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-green-200 transition-colors"
              >
                <IconInstagram />
              </a>
              <a
                href="https://youtube.com/@intemperie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:text-green-200 transition-colors"
              >
                <IconYoutube />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier 2: Main bar (logo + search + actions) ─────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center gap-3">

            {/* Mobile hamburger */}
            <button
              className="lg:hidden -ml-1 p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={closeAll}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white font-black text-xl shadow-sm select-none">
                I
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-[15px] font-black tracking-tight text-gray-900 leading-none">
                  INTEMPERIE
                </p>
                <p className="text-[9px] font-bold text-gray-400 tracking-[0.15em] uppercase leading-none mt-0.5">
                  Cercas PVC &amp; Mallas
                </p>
              </div>
            </Link>

            {/* Search — desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex flex-1 mx-4 lg:mx-8"
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  className="h-10 w-full rounded-full border-0 bg-gray-100 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  placeholder="Buscar cercas PVC, mallas electrosoldadas…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-1">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Mi cuenta"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden lg:block text-xs font-semibold max-w-[80px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-50">
                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        {[
                          { label: "Mi cuenta",    href: "/cuenta" },
                          { label: "Mis pedidos",  href: "/cuenta/pedidos" },
                          ...(user?.role === "ADMIN"
                            ? [{ label: "Panel Admin", href: "/admin" }]
                            : []),
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="mt-1 w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                  className="flex items-center gap-1.5 p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Ingresar"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden lg:block text-xs font-semibold">Ingresar</span>
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/carrito"
                className="relative flex items-center gap-1.5 p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-black text-white transition-transform ${
                      cartBounce ? "scale-125" : "scale-100"
                    }`}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
                <span className="hidden lg:block text-xs font-semibold">Carrito</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile search panel */}
        {searchOpen && (
          <div className="sm:hidden border-t border-gray-100 px-4 py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="search"
                  className="h-10 w-full rounded-full bg-gray-100 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all border-0"
                  placeholder="Buscar cercas, mallas…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Tier 3: Navigation bar (desktop) ──────────────────────────────── */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center h-10">

            {/* Cercas PVC mega dropdown */}
            <div ref={cercasRef} className="relative h-full flex items-center">
              <button
                onClick={() => setCercasOpen((v) => !v)}
                className={`flex items-center gap-1 h-full px-3 text-[13px] font-bold transition-colors ${
                  cercasOpen
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700 hover:bg-gray-100"
                }`}
              >
                Cercas PVC
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${cercasOpen ? "rotate-180" : ""}`} />
              </button>
              {cercasOpen && (
                <CercasMegaMenu onClose={() => setCercasOpen(false)} />
              )}
            </div>

            {/* Mallas dropdown */}
            <SimpleDropdown label="Mallas Electrosoldadas">
              {mallas.map((p) => (
                <Link
                  key={p.slug}
                  href={`/productos/${p.slug}`}
                  className="flex items-center gap-2 mx-1 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                >
                  <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-green-500 shrink-0" />
                  {p.name}
                </Link>
              ))}
              <div className="mx-1 border-t border-gray-100 mt-1 pt-1">
                <Link
                  href="/productos?category=industrial"
                  className="block px-3 py-2 text-[13px] font-bold text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
            </SimpleDropdown>

            {/* Colecciones dropdown */}
            <SimpleDropdown label="Colecciones">
              {colecciones.map((c) => (
                <Link
                  key={c.slug}
                  href={`/productos?category=${c.slug}`}
                  className="flex items-center gap-2 mx-1 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                >
                  <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-green-500 shrink-0" />
                  {c.name}
                </Link>
              ))}
            </SimpleDropdown>

            {/* Direct links */}
            <Link href="/calculadora"
              className="flex items-center h-full px-3 text-[13px] font-semibold text-gray-700 hover:text-green-700 hover:bg-gray-100 transition-colors whitespace-nowrap">
              Calculadora
            </Link>
            <Link href="/nosotros#instaladores"
              className="flex items-center h-full px-3 text-[13px] font-semibold text-gray-700 hover:text-green-700 hover:bg-gray-100 transition-colors whitespace-nowrap">
              Instaladores
            </Link>
            <Link href="/nosotros"
              className="flex items-center h-full px-3 text-[13px] font-semibold text-gray-700 hover:text-green-700 hover:bg-gray-100 transition-colors whitespace-nowrap">
              Nosotros
            </Link>
            <a href="https://wa.me/50762874042"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center h-full px-3 text-[13px] font-semibold text-gray-700 hover:text-green-700 hover:bg-gray-100 transition-colors whitespace-nowrap">
              Contacto
            </a>

            {/* Right info */}
            <div className="ml-auto flex items-center gap-3 text-gray-400 text-[12px] shrink-0">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span className="text-gray-500 font-medium">Lun–Sáb 8:00–18:00</span>
              </div>
              <span className="text-gray-300">|</span>
              <a
                href="mailto:ventas@intemperie.com"
                className="flex items-center gap-1.5 text-gray-500 hover:text-green-700 transition-colors font-medium"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                ventas@intemperie.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile full-panel menu ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(2rem+4rem)] z-40 flex flex-col bg-white overflow-y-auto border-t border-gray-200 shadow-2xl">
          {/* Mobile search */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  className="h-10 w-full rounded-full bg-white border border-gray-200 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  placeholder="Buscar productos…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Cercas PVC section */}
          <MobileSection title="Cercas PVC">
            <p className="px-2 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              Línea Residencial
            </p>
            {pvcResidencial.map((p) => (
              <Link key={p.slug} href={`/productos/${p.slug}`} onClick={closeAll}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                {p.name}
              </Link>
            ))}
            <p className="px-2 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              Línea Industrial
            </p>
            {pvcIndustrial.map((p) => (
              <Link key={p.slug} href={`/productos/${p.slug}`} onClick={closeAll}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                {p.name}
              </Link>
            ))}
            <p className="px-2 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              Zonas Costeras
            </p>
            {pvcCosteras.map((p) => (
              <Link key={p.slug} href={`/productos/${p.slug}`} onClick={closeAll}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                {p.name}
              </Link>
            ))}
            <Link href="/productos" onClick={closeAll}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors mt-1">
              Ver todo el catálogo →
            </Link>
          </MobileSection>

          {/* Mallas section */}
          <MobileSection title="Mallas Electrosoldadas">
            {mallas.map((p) => (
              <Link key={p.slug} href={`/productos/${p.slug}`} onClick={closeAll}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                {p.name}
              </Link>
            ))}
            <Link href="/productos?category=industrial" onClick={closeAll}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors mt-1">
              Ver todos →
            </Link>
          </MobileSection>

          {/* Colecciones section */}
          <MobileSection title="Colecciones">
            {colecciones.map((c) => (
              <Link key={c.slug} href={`/productos?category=${c.slug}`} onClick={closeAll}
                className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors">
                {c.name}
              </Link>
            ))}
          </MobileSection>

          {/* Direct links */}
          <div className="border-b border-gray-100">
            <Link href="/calculadora" onClick={closeAll}
              className="block px-4 py-3.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
              Calculadora
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href="/nosotros#instaladores" onClick={closeAll}
              className="block px-4 py-3.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
              Instaladores
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link href="/nosotros" onClick={closeAll}
              className="block px-4 py-3.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
              Nosotros
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <a href="https://wa.me/50762874042" target="_blank" rel="noopener noreferrer"
              onClick={closeAll}
              className="block px-4 py-3.5 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors">
              Contacto por WhatsApp
            </a>
          </div>

          {/* Contact info bottom */}
          <div className="px-4 py-5 bg-gray-50 space-y-2 mt-auto">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-green-600 shrink-0" />
              <span>Lun–Sáb 8:00–18:00</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-green-600 shrink-0" />
              <a href="tel:+50762874042" className="hover:text-green-700 transition-colors">
                +507 6287-4042
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-green-600 shrink-0" />
              <a href="mailto:ventas@intemperie.com" className="hover:text-green-700 transition-colors">
                ventas@intemperie.com
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
