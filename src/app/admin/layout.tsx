"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen p-4 pt-16 lg:ml-64 lg:p-8 lg:pt-8">{children}</main>
    </div>
  );
}
