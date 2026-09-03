import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/* Migas de pan — patrón canónico del listado de catálogo, extraído para que
 * cada página no lo reinvente. `tone="dark"` es para bandas navy. */

export interface Crumb {
  label: string;
  /** Sin href = elemento actual (aria-current="page"). */
  href?: string;
}

export function Breadcrumbs({
  items,
  tone = "light",
  className = "",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  const listTone = dark ? "text-on-dark-soft" : "text-muted-foreground";
  const linkTone = dark ? "hover:text-brand-green" : "hover:text-brand-green-deep";
  const currentTone = dark ? "text-on-dark" : "text-foreground";

  return (
    <nav aria-label="Ruta" className={className}>
      <ol className={`flex items-center gap-1.5 text-xs ${listTone}`}>
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && (
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
            )}
            {item.href ? (
              <li>
                <Link href={item.href} className={`transition-colors ${linkTone}`}>
                  {item.label}
                </Link>
              </li>
            ) : (
              <li className={`truncate font-semibold ${currentTone}`} aria-current="page">
                {item.label}
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
