import { MetadataRoute } from "next";
import { SITE_URL } from "./(store)/_seo/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
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
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
