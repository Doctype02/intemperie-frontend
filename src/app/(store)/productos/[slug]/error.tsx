"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconWhatsApp } from "@/components/ui/icon-whatsapp";
import { getWhatsAppLink } from "@/lib/utils";

/**
 * Fallo al cargar la ficha (API caída, respuesta inválida).
 *
 * El visitante venía a comprar: además de reintentar, se le deja abierto el
 * canal por el que Intemperie vende de verdad. No se muestra `error.message`:
 * en producción llega ofuscado y sólo asusta.
 */
export default function ProductDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        No pudimos cargar este producto
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Ha sido un problema nuestro, no tuyo. Vuelve a intentarlo o escríbenos y te
        pasamos el precio y la disponibilidad al momento.
      </p>

      <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button onClick={reset}>Reintentar</Button>
        <Button variant="whatsapp" asChild>
          <a
            href={getWhatsAppLink("Hola Intemperie, la ficha de un producto no cargó. ¿Me pueden ayudar?")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsApp />
            Escribir por WhatsApp
          </a>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/productos">Ver el catálogo</Link>
        </Button>
      </div>
    </div>
  );
}
