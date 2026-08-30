import { MetadataRoute } from "next";
import { SITE_URL } from "./(store)/_seo/site-url";

/* Interruptor de indexacion.
 *
 * Este despliegue es un entorno de PRUEBAS que pasara a produccion, pero es
 * publicamente accesible y con TLS valido: Google puede rastrearlo hoy. Si lo
 * indexa ahora, indexa datos de relleno (instaladores con telefonos
 * secuenciales, "Desde $18.50/m" cuando el catalogo empieza en $8.50) y, si
 * el sitio definitivo acaba en otro dominio, las URLs de pruebas competiran
 * con las reales como contenido duplicado.
 *
 * Por defecto NO se indexa. Para abrir al lanzar: NEXT_PUBLIC_ALLOW_INDEXING=true
 * Es `NEXT_PUBLIC_` a proposito: se hornea en build, igual que el resto de la
 * configuracion publica del frontend. */
const INDEXABLE = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: INDEXABLE
      ? [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/", "/cuenta/", "/checkout/", "/api/", "/login", "/registro",
          // Paginas de cliente, ligadas a sesion y sin contenido unico que
          // indexar: en el primer pintado son un esqueleto vacio. Sin esto,
          // Google rastrea e indexa carritos vacios y gasta presupuesto de
          // rastreo en paginas que nunca traeran una visita.
          "/carrito", "/favoritos",
        ],
      },
        ]
      : /* Pre-lanzamiento: nada se indexa. */
        [{ userAgent: "*", disallow: "/" }],
    ...(INDEXABLE ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}),
  };
}
