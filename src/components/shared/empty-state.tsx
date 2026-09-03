import type { ReactNode } from "react";

/* Estado vacío con salida — el patrón del EmptyState local de /productos,
 * generalizado. `diagram` pinta el alzado CSS del sistema (cero coste de red)
 * en lugar del icono. */

export function EmptyState({
  icon,
  diagram,
  title,
  body,
  children,
}: {
  icon?: ReactNode;
  diagram?: "mesh" | "picket";
  title: string;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-8 text-center sm:px-8 sm:py-12">
      {diagram ? (
        <div aria-hidden="true" className={`diagram diagram-${diagram} mx-auto h-16 w-28 rounded-md`} />
      ) : (
        icon && (
          <div className="mx-auto mb-1 flex size-16 items-center justify-center rounded-full bg-surface-2">
            {icon}
          </div>
        )
      )}
      <h2 className="mt-4 text-lg font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {children && <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2">{children}</div>}
    </div>
  );
}
