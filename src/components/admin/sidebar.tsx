"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileText,
  FolderTree,
  Layers,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { href: "/admin/colecciones", label: "Colecciones", icon: Layers },
  { href: "/admin/contenido", label: "Contenido", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-green-600 text-sm font-bold">
            I
          </div>
          <span className="text-lg font-semibold">Intemperie</span>
        </Link>
        <span className="ml-auto rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="mb-3 rounded-lg bg-gray-800 p-3">
          <p className="text-xs text-gray-400">Sesión</p>
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Tienda
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:bg-red-900 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
