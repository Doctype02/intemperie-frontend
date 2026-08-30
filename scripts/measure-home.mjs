/*
 * Mide la portada con un navegador real. Se ejecuta contra `next start`.
 *
 *   node scripts/measure-home.mjs <url> <etiqueta>
 *
 * Lo que se mide y por que:
 *  - Imagenes del primer viewport: el requisito es UNA sola imagen inicial.
 *    Se cuentan las peticiones de tipo imagen emitidas antes de `load` + 1 s,
 *    sin haber hecho scroll.
 *  - Tareas largas (>50 ms) y TBT: el requisito es CERO tareas largas.
 *  - LCP y CLS: que la densidad de secciones no cueste estabilidad.
 *  - JS descargado: cuanto codigo tiene que ejecutar el movil.
 *
 * Se emula un movil de gama media (4x CPU throttle, 375x812) porque es el
 * dispositivo real del cliente panameno, no un portatil de oficina.
 */
import pw from "/home/nothing/career-ops/node_modules/playwright/index.js";
const { chromium } = pw;

const url = process.argv[2] ?? "http://localhost:3311/";
const label = process.argv[3] ?? "run";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36",
});

const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const reqs = [];
page.on("response", async (res) => {
  const req = res.request();
  let size = 0;
  try {
    size = Number((await res.headerValue("content-length")) ?? 0);
    if (!size) size = (await res.body()).length;
  } catch {}
  reqs.push({ type: req.resourceType(), url: res.url(), size });
});

await page.addInitScript(() => {
  window.__long = [];
  window.__cls = 0;
  window.__lcp = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__long.push(e.duration);
  }).observe({ type: "longtask", buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__lcp = e.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
});

await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2500);

const m = await page.evaluate(() => ({
  long: window.__long,
  cls: window.__cls,
  lcp: window.__lcp,
  dcl: performance.getEntriesByType("navigation")[0]?.domContentLoadedEventEnd ?? 0,
  domNodes: document.getElementsByTagName("*").length,
}));

const imgs = reqs.filter((r) => r.type === "image");
const js = reqs.filter((r) => r.type === "script");
const sum = (a) => a.reduce((s, r) => s + r.size, 0);
const kb = (n) => (n / 1024).toFixed(1) + " kB";
const long = m.long.filter((d) => d > 50);
const tbt = long.reduce((s, d) => s + (d - 50), 0);

console.log(`\n── ${label} ── ${url}`);
console.log(`imagenes sin scroll : ${imgs.length}  (${kb(sum(imgs))})`);
for (const i of imgs) console.log(`    ${kb(i.size).padStart(9)}  ${i.url.slice(0, 110)}`);
console.log(`js                  : ${js.length} ficheros (${kb(sum(js))})`);
console.log(`peticiones totales  : ${reqs.length}  (${kb(sum(reqs))})`);
console.log(`tareas largas >50ms : ${long.length}  ${long.map((d) => Math.round(d) + "ms").join(" ")}`);
console.log(`TBT                 : ${Math.round(tbt)} ms`);
console.log(`LCP                 : ${Math.round(m.lcp)} ms`);
console.log(`CLS                 : ${m.cls.toFixed(4)}`);
console.log(`nodos DOM           : ${m.domNodes}`);

await browser.close();
