import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <Skeleton className="h-4 w-56 mb-6 hidden sm:block" />
      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {/* Gallery */}
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="w-full rounded-2xl h-56 sm:h-72 lg:h-96" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0" />
            ))}
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
