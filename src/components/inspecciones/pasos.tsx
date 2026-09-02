/* Los pasos numerados — sistema «Perímetro».
 *
 * Las dos pantallas de inspección son procedimientos, no montones de piezas
 * del mismo peso: quien las abre tiene que saber qué se espera de él primero y
 * qué va a pasar al terminar. El número se repite en dos sitios —la tira de
 * arriba, que es el mapa, y la cabecera de cada sección, que es el sitio— con
 * el mismo gesto de versalitas que el precotizador ya usa («PASO 1 ·
 * CATÁLOGO»), así que no se inventa un lenguaje nuevo para esta parte del
 * sitio.
 *
 * Viven aquí porque el cliente y el inspector recorren pasos DISTINTOS con la
 * MISMA gramática: si cada pantalla se pintara sus números, en la primera
 * ronda de ajustes dejarían de parecerse.
 */
import { ChevronRight } from "lucide-react";

export function NumeroPaso({ n, tono = "activo" }: { n: number; tono?: "activo" | "apagado" }) {
  return (
    <span
      aria-hidden="true"
      className={`tabular flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        tono === "activo"
          ? "bg-primary text-primary-foreground"
          : "border border-border-strong text-muted-foreground"
      }`}
    >
      {n}
    </span>
  );
}

/* Cabecera de sección: el número, el título y, debajo, la explicación.
   El número es decorativo (`aria-hidden`) y el orden también va en el texto
   del encabezado —«Paso 1 · …»— para quien lo escuche en voz alta. */
export function CabeceraPaso({
  n, titulo, id, children, nivel = "h2",
}: {
  n: number; titulo: string; id: string;
  children?: React.ReactNode; nivel?: "h2" | "h3";
}) {
  const H = nivel;
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <NumeroPaso n={n} />
        <H id={id} className="font-heading text-xl font-bold text-foreground">
          <span className="sr-only">Paso {n}: </span>
          {titulo}
        </H>
      </div>
      {children}
    </div>
  );
}

/* La tira de pasos de la cabecera: un mapa de tres paradas.
   No es navegable —no lleva a ningún sitio— sino una lista ordenada. Apilada
   ocupaba 110 px de un teléfono para decir tres palabras; en una línea, y
   rodando si no cabe, ocupa 28 y se lee igual. */
export function TiraPasos({ pasos, id }: { pasos: readonly string[]; id: string }) {
  return (
    <div className="-mx-gutter overflow-x-auto px-gutter scrollbar-hide lg:mx-0 lg:shrink-0 lg:overflow-visible lg:px-0">
      <ol aria-labelledby={id} className="flex w-max items-center gap-x-1 lg:w-auto">
        {pasos.map((paso, i) => (
          <li key={paso} className="flex items-center gap-2.5">
            <NumeroPaso n={i + 1} tono={i === 0 ? "activo" : "apagado"} />
            <span className="whitespace-nowrap text-sm font-semibold text-foreground">{paso}</span>
            {i < pasos.length - 1 && (
              <ChevronRight className="mx-1 size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
