"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className="fixed bottom-24 right-6 z-40 size-11 rounded-full bg-surface border border-border shadow-md flex items-center justify-center hover:bg-surface-2 transition-colors"
    >
      <ChevronUp className="h-4 w-4 text-foreground" />
    </button>
  );
}
