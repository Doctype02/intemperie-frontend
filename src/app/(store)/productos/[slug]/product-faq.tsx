import type { ProductView } from "./product-view";

/* Preguntas frecuentes de la ficha.
 *
 * Las cuatro primeras se escriben con los datos reales del producto (alturas,
 * colores, garantía, material): antes había cinco respuestas genéricas sobre
 * PVC que se pintaban igual en una malla electrosoldada de acero.
 *
 * Componente de servidor y `<details>` nativo: se despliega sin una línea de
 * JavaScript, funciona antes de la hidratación y el buscador lo indexa.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export function buildFaq(product: ProductView): FaqItem[] {
  const items: FaqItem[] = [];
  const isPvc = /pvc/i.test(product.material ?? product.name);

  if (product.heights.length > 0) {
    items.push({
      q: "¿En qué alturas está disponible?",
      a: `${product.name} se fabrica en ${listar(product.heights)}. Indícanos la altura al cotizar y confirmamos disponibilidad y plazo de entrega.`,
    });
  }

  if (product.colors.length > 0) {
    items.push({
      q: "¿Qué colores puedo elegir?",
      a: `Disponible en ${listar(product.colors)}. El color se elige al confirmar el pedido, sin costo adicional sobre el precio de lista.`,
    });
  }

  if (product.material) {
    items.push({
      q: "¿De qué material está fabricado?",
      a: `${product.material}. Puedes ver el resto de datos técnicos en la ficha de esta misma página.`,
    });
  }

  if (product.warranty) {
    items.push({
      q: "¿Qué garantía tiene?",
      a: `Este modelo se entrega con ${product.warranty} de garantía. Consérvala junto con la factura del pedido.`,
    });
  }

  if (product.unit === "METRO") {
    items.push({
      q: "¿Cómo se cobra: por metro o por panel?",
      a: `El precio de $${product.price.toFixed(2)} corresponde a un metro lineal de material. El pedido mínimo es de 10 metros lineales y la instalación se cotiza aparte.`,
    });
  }

  items.push({
    q: "¿Incluye la instalación?",
    a: "La instalación se cotiza por separado según la longitud, el terreno y la ubicación. Contamos con instaladores certificados en todo Panamá; puedes solicitarla al comprar o por WhatsApp.",
  });

  items.push({
    q: "¿Hacen envíos a todo Panamá?",
    a: "Sí. Despachamos a Ciudad de Panamá, Panamá Oeste, Colón, Chiriquí y el resto de provincias. Los pedidos mayores a $50 tienen envío gratuito y la entrega tarda entre 2 y 5 días hábiles.",
  });

  if (isPvc) {
    items.push({
      q: "¿Requiere mantenimiento?",
      a: "No. El PVC no se oxida, no se pudre y no necesita pintura. Un lavado ocasional con agua y jabón neutro lo mantiene como nuevo.",
    });
  }

  return items;
}

/** «1.5m, 1.8m y 2.1m» */
function listar(values: string[]): string {
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} y ${values[values.length - 1]}`;
}

export function ProductFaq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-title" className="rounded-xl border border-hairline bg-surface">
      <div className="border-b border-hairline px-4 py-4 sm:px-5">
        <h2 id="faq-title" className="font-heading text-lg font-bold text-foreground">
          Preguntas frecuentes
        </h2>
      </div>
      <div className="divide-y divide-hairline">
        {items.map((item) => (
          <details key={item.q} className="group px-4 sm:px-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-foreground outline-none marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green">
              {item.q}
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-md border border-hairline text-muted-foreground transition-transform duration-150 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-4 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
