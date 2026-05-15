"use client";

import { useImageLoad } from "@/lib/image-load-context";

export function PageLoadingOverlay() {
  const { allLoaded } = useImageLoad();

  if (allLoaded) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-green-600 flex items-center justify-center animate-pulse">
            <span className="text-2xl font-black text-white">I</span>
          </div>
          <div className="absolute inset-0 rounded-2xl ring-4 ring-green-200 animate-ping opacity-20" />
        </div>
        <div className="w-full space-y-3 mt-6">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
        </div>
        <p className="text-sm text-gray-400 font-medium mt-2">Cargando...</p>
      </div>
    </div>
  );
}
