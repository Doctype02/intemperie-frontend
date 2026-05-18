"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSearch = searchParams.get("search") || "";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const input = form.elements.namedItem("search") as HTMLInputElement;
        const sp = new URLSearchParams(searchParams.toString());
        if (input.value.trim()) {
          sp.set("search", input.value.trim());
        } else {
          sp.delete("search");
        }
        sp.delete("page");
        router.push(`/productos?${sp.toString()}`);
      }}
    >
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          name="search"
          className="pl-10 h-10 bg-white border-gray-200 rounded-lg focus-visible:ring-green-500 text-sm placeholder:text-gray-400"
          placeholder="Buscar cercas PVC, mallas electrosoldadas…"
          defaultValue={currentSearch}
        />
      </div>
    </form>
  );
}
