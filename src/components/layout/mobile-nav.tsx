"use client";

import Link from "next/link";
import { X, Home, Package, Calculator, Compass, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store/auth-store";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/colecciones/residencial", label: "Colecciones", icon: Compass },
  { href: "/calculadora", label: "Calculadora", icon: Calculator },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { isAuthenticated, logout } = useAuthStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-green-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">I</span>
            </div>
            <span className="text-lg font-bold text-green-700">INTEMPERIE</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          <a
            href="#contacto"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Phone className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Contacto</span>
          </a>
        </nav>

        <Separator />

        <div className="p-4">
          {isAuthenticated ? (
            <div className="space-y-2">
              <Link
                href="/cuenta"
                onClick={onClose}
                className="block px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Mi Cuenta
              </Link>
              <Link
                href="/cuenta/pedidos"
                onClick={onClose}
                className="block px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Mis Pedidos
              </Link>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="block w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={onClose}
                className="block px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                onClick={onClose}
                className="block px-3 py-2.5 rounded-lg bg-green-700 text-white text-center rounded-lg hover:bg-green-800 transition-colors font-medium"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
