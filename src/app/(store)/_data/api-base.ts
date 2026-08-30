/* Base de la API segun quien hace la peticion.
 *
 * El navegador y el servidor NO pueden usar la misma URL en este despliegue:
 *
 *   navegador  -> https://api.intemperie.skjoldnetsystems.com  (por Caddy)
 *   servidor   -> http://backend-a:4000                        (red interna)
 *
 * El servidor esta detras de un NAT gateway sin retorno sobre si mismo: ni el
 * host ni el contenedor de build alcanzan el dominio publico. Comprobado.
 *
 * Sin esta separacion, el `fetch` del prerenderizado fallaba durante
 * `docker build` y —con el `catch` que habia antes— publicaba una portada sin
 * un solo producto, en silencio y con el build en verde.
 *
 * INTERNAL_API_URL NO lleva prefijo NEXT_PUBLIC_ a proposito: no debe acabar
 * nunca en el bundle del navegador, que no sabria resolver `backend-a`.
 */
export const serverApiBase = (): string =>
  process.env.INTERNAL_API_URL
  ?? process.env.NEXT_PUBLIC_API_URL
  ?? "http://localhost:4000";
