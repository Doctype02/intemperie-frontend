"use client";

import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed";

const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIxAAAQMEAgMBAAAAAAAAAAAAAQIDBAAFERIhMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmtOkbddS1UqMhqIhWXnFnCU+SThI+T5PnXJd7lPkykOSX1u7UhIKjnATgD8CiigH/2Q==";

export function RecentlyViewedSection() {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-1">
            Tu historial
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight">
            Vistos recientemente
          </h2>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/productos/${product.slug}`}
              className="group flex-none w-[160px] sm:w-[180px] snap-start"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="180px"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-2xl font-black text-gray-300">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 px-0.5">
                <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  ${Number(product.basePrice).toFixed(2)}{product.unit === "PANEL" ? "/panel" : "/m"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
