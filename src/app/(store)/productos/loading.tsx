import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-96 mb-8" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex-1">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
