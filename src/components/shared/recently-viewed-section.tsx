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
    <section className="border-b border-border bg-surface py-8 sm:py-10">
      <div className="shell">
        <div className="mb-5">
          <p className="eyebrow text-brand-green-deep mb-1">
            Tu historial
          </p>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
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
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-2 border border-border">
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
                  <span aria-hidden="true" className="diagram diagram-picket absolute inset-0" />
                )}
              </div>
              <div className="mt-2 px-0.5">
                <p className="text-xs font-bold text-foreground leading-snug line-clamp-2 group-hover:text-brand-green-deep transition-colors">
                  {product.name}
                </p>
                <p className="mt-0.5 tabular text-xs text-muted-foreground">
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
