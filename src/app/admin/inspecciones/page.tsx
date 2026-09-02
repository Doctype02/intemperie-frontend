"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ClipboardList, Lock } from "lucide-react";

import { useAuthStore } from "@/lib/store/auth-store";
import { CabeceraPaso, TiraPasos } from "@/components/inspecciones/pasos";
import { ConsultasBox } from "@/components/inspecciones/consultas-box";
import { PlanoEditor } from "@/components/inspecciones/plano-editor";
import { SpecsTable } from "@/components/inspecciones/specs-table";
import { PLANO_H, PLANO_W } from "@/components/inspecciones/use-canvas";
import { readPlanPalette } from "@/components/inspecciones/plan-palette";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* Ficha de inspección — sistema «Perímetro». SÓLO ADMINISTRACIÓN.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DE DÓNDE VIENE ESTA PANTALLA
 *
 * Vivía dentro de `/inspecciones`, escondida tras una banda ámbar y un botón
 * de «Ver la hoja interna», compartiendo archivo con la solicitud del cliente
 * y separada de ella por ramas `isAdmin`. El cliente lo vio y fue tajante:
 * «eso no me sirve, eso no debe verlo el cliente». Así que la herramienta del
 * inspector no se ha borrado: se ha mudado aquí, bajo el layout de `/admin`,
 * que ya trae barra lateral y portero de rol —y el `middleware` ya ha
 * validado la cookie antes de que esto llegue a renderizarse—.
 *
 * Se muda ENTERA y tal cual: el plano con sus cinco herramientas y sus once
 * moldes, los datos del cliente, la tabla de materiales, las consultas del
 * terreno, las observaciones, las firmas, el contador de inspecciones y el
 * informe imprimible.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * UN SOLO LIENZO, NO DOS COPIAS
 *
 * El plano NO se ha duplicado. `PlanoEditor` —con el motor de dibujo, la
 * paleta del papel, la botonera y los moldes— es el mismo componente que monta
 * la pantalla del cliente. Esta pantalla sólo le pasa su `canvasRef` para
 * poder sacar el mapa de bits al informe. Dos copias del lienzo divergirían en
 * cuanto alguien tocara una, y la que se quedaría atrás sería justo ésta, que
 * es la que se usa a diario.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LA HOJA ES EL FORMULARIO
 *
 * En el archivo viejo los seis campos del cliente estaban DOS veces: una en la
 * tarjeta de arriba y otra dentro de la hoja imprimible plegada. Aquí la hoja
 * no se pliega —es el trabajo de esta pantalla, no un anexo— y por tanto los
 * campos salen una sola vez, dentro de ella. Se rellena lo que se va a
 * imprimir, que es lo que se lleva a la obra.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * QUÉ NO SE ARREGLA AQUÍ (y va en el informe)
 *
 *   · El bitmap del plano es fijo, 1180×420.
 *   · `draw.init()` se rehace en cada render (vive en `PlanoEditor`).
 *   · La tercera casilla de firma —«VENDEDOR QUE COTIZA»— no tiene lienzo: se
 *     firma a mano sobre el papel una vez impreso.
 *
 * Todos se mudan tal cual, sin agravarse. La única regla que ha habido que
 * reescribir es la de impresión, y no por gusto: ver la nota al pie.
 */

/* Los tres momentos del trabajo del inspector, que no son los del cliente:
   aquí se LEVANTA la inspección en el terreno, no se pide. */
const PASOS = ["Levanta el plano", "Datos del cliente", "Genera el informe"] as const;

export default function AdminInspeccionesPage() {
  const { user } = useAuthStore();

  const uid = useId();
  const planoTituloId = `${uid}-plano`;
  const planoAyudaId = `${uid}-plano-ayuda`;
  const planoAlternativaId = `${uid}-plano-alternativa`;
  const fichaTituloId = `${uid}-ficha`;
  const inspNumId = `${uid}-numero`;
  const datosId = `${uid}-datos`;
  const planoFichaId = `${uid}-plano-ficha`;
  const materialesId = `${uid}-materiales`;
  const observacionesId = `${uid}-observaciones`;
  const observacionesCampoId = `${uid}-observaciones-campo`;
  const firmasId = `${uid}-firmas`;
  const informeTituloId = `${uid}-informe`;
  const pasosId = `${uid}-pasos`;

  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const planoImgRef = useRef<HTMLImageElement | null>(null);
  const sig1Ref    = useRef<HTMLCanvasElement | null>(null);
  const sig2Ref    = useRef<HTMLCanvasElement | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [inspNum,    setInspNum]    = useState("0001");
  /* Los datos del cliente NO se rellenan con la sesión, y es un cambio a
     propósito. En el archivo viejo la ficha era la misma para los dos públicos,
     así que «Nombre del cliente» se rellenaba con `user.name`: al cliente le
     ponía el suyo, que es lo correcto, y al inspector le ponía EL DEL
     INSPECTOR en la casilla del cliente, que es un dato falso en una hoja que
     se imprime y se lleva a la obra. Separadas las dos pantallas, aquí se
     escriben los datos de OTRA persona y se empieza en blanco. Lo que sí
     hereda la sesión es la casilla que le corresponde: el nombre del inspector,
     más abajo, en las firmas. */
  const [clientName, setClientName] = useState("");
  const [telefono,   setTelefono]   = useState("");
  const [correo,     setCorreo]     = useState("");
  const [fecha,      setFecha]      = useState(today);
  const [direccion,  setDireccion]  = useState("");
  const [referencia, setReferencia] = useState("");
  const [observaciones,   setObservaciones]   = useState("");
  const [nombreInspector, setNombreInspector] = useState("");
  const [nombreVendedor,  setNombreVendedor]  = useState("");

  /* Los dos avisos del compilador de React que vienen a continuación son
     correctos: son estados que se fijan desde un efecto y encadenan un render
     de más. Quitarlos es rehacer el contador de inspecciones y la manera en
     que la ficha hereda la sesión, o sea, lógica —y este encargo es de diseño
     y usabilidad—. Se silencian uno a uno, señalados. Están en el informe. */
  useEffect(() => {
    const n = localStorage.getItem("insp_counter");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- el contador vive en localStorage y sólo puede leerse ya hidratado
    if (n) setInspNum(String(+n).padStart(4, "0"));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- la sesión llega tarde y firma quien está usando la herramienta
  useEffect(() => { if (user?.name) setNombreInspector(user.name); }, [user?.name]);

  /* Arranque de los recuadros de firma. Se mantienen con eventos de ratón y
     tacto tal cual estaban: las firmas quedaban explícitamente fuera del
     encargo y sólo se les ha cambiado el color de la tinta.

     Este código, a diferencia del plano, NO convierte la posición del dedo a
     píxeles del mapa de bits: resta la posición de la caja y ya. Mientras la
     caja mida lo mismo que el mapa de bits (280 px) eso da igual; en cuanto se
     estira, la tinta se separa del dedo en la misma proporción. Por eso el
     recuadro se topa en 280 px —su tamaño natural, que además es el 1:1— para
     no agravar algo que no toca arreglar aquí.

     En papel el tope se levanta. Ahí no hay dedo que valga: el recuadro se
     rellena con un bolígrafo y cuanto más ancho, mejor. */
  useEffect(() => {
    const pads = [sig1Ref, sig2Ref];
    const cleanups: (() => void)[] = [];
    pads.forEach(ref => {
      const c = ref.current; if (!c) return;
      const g = c.getContext("2d")!;
      let pen = false, lx = 0, ly = 0;
      const getP = (e: MouseEvent | TouchEvent) => {
        const r = c.getBoundingClientRect();
        const s = "touches" in e ? e.touches[0] : e;
        return { x: s.clientX - r.left, y: s.clientY - r.top };
      };
      const d = (e: MouseEvent | TouchEvent) => { e.preventDefault(); pen = true; const p = getP(e); lx=p.x; ly=p.y; g.beginPath(); g.arc(lx,ly,0.8,0,Math.PI*2); g.fillStyle=readPlanPalette().ink; g.fill(); };
      const m = (e: MouseEvent | TouchEvent) => { if(!pen) return; e.preventDefault(); const {x,y}=getP(e); g.beginPath(); g.moveTo(lx,ly); g.lineTo(x,y); g.strokeStyle=readPlanPalette().ink; g.lineWidth=1.5; g.lineCap="round"; g.stroke(); lx=x; ly=y; };
      const u = () => { pen=false; };
      c.addEventListener("mousedown",d); c.addEventListener("mousemove",m); c.addEventListener("mouseup",u); c.addEventListener("mouseleave",u);
      c.addEventListener("touchstart",d,{passive:false}); c.addEventListener("touchmove",m,{passive:false}); c.addEventListener("touchend",u);
      cleanups.push(() => { c.removeEventListener("mousedown",d); c.removeEventListener("mousemove",m); c.removeEventListener("mouseup",u); c.removeEventListener("mouseleave",u); c.removeEventListener("touchstart",d); c.removeEventListener("touchmove",m); c.removeEventListener("touchend",u); });
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  /* La instantánea del plano para la hoja impresa se recoge después de pintar
     y no durante el render: leer un ref mientras se renderiza no es seguro.
     Sin lista de dependencias a propósito —se recogía en cada render antes y
     se sigue recogiendo igual—, para que quien siga dibujando vea el trazo
     nuevo en la hoja. */
  useEffect(() => {
    const img = planoImgRef.current;
    const data = canvasRef.current?.toDataURL();
    if (img && data) img.src = data;
  });

  const generatePDF = () => {
    const next = (+inspNum || 0) + 1;
    localStorage.setItem("insp_counter", String(next));
    setTimeout(() => window.print(), 300);
  };

  /* Los datos del cliente, en el orden en que se preguntan de pie en un
     terreno. Cada uno con su etiqueta, su tipo y su autocompletado: en un
     móvil, `tel` abre el teclado numérico y `email` el que trae la arroba. */
  const DATOS: {
    id: string; label: string; value: string; set: (v: string) => void;
    type: string; autoComplete: string; inputMode?: "tel" | "email";
  }[] = [
    { id: `${uid}-nombre`,     label: "Nombre del cliente",  value: clientName, set: setClientName, type: "text",  autoComplete: "name" },
    { id: `${uid}-fecha`,      label: "Fecha",               value: fecha,      set: setFecha,      type: "date",  autoComplete: "off" },
    { id: `${uid}-direccion`,  label: "Dirección",           value: direccion,  set: setDireccion,  type: "text",  autoComplete: "street-address" },
    { id: `${uid}-referencia`, label: "Punto de referencia", value: referencia, set: setReferencia, type: "text",  autoComplete: "off" },
    { id: `${uid}-telefono`,   label: "Teléfono",            value: telefono,   set: setTelefono,   type: "tel",   autoComplete: "tel",   inputMode: "tel" },
    { id: `${uid}-correo`,     label: "Correo",              value: correo,     set: setCorreo,     type: "email", autoComplete: "email", inputMode: "email" },
  ];

  return (
    <div className="min-w-0">

      {/* ── Rótulo de la pantalla ───────────────────────────────────────
          El layout de `/admin` ya pone el canalón y el ancho, así que aquí no
          se vuelve a envolver en `.shell`: se sumarían dos rellenos.

          `print:hidden` en todo lo que es interfaz: en papel sólo va la hoja. */}
      <div className="print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-1.5 text-brand-green">
              <Lock className="size-3.5" aria-hidden="true" />
              Administración · inspección en sitio
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">Ficha de inspección</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Levanta el plano del terreno, anota los datos del cliente y los
              materiales, recoge las firmas y genera el informe para imprimir.
              Quien pide la inspección desde la web no ve nada de esto.
            </p>
          </div>

          <h2 id={pasosId} className="sr-only">Cómo funciona</h2>
          <TiraPasos pasos={PASOS} id={pasosId} />
        </div>
      </div>

      {/* ── Paso 1: el plano ────────────────────────────────────────────
          El MISMO `PlanoEditor` que monta la pantalla del cliente. A lo ancho
          y no en dos columnas: aquí el layout ya se queda 256 px de barra
          lateral, y con los ~1120 px que restan en 1440 la botonera cabe en
          sus dos columnas —el corte está en 1024 px de contenedor— y el lienzo
          sale a 398 px de alto guardando su proporción 59:21. */}
      <section aria-labelledby={planoTituloId} className="mt-6 min-w-0 print:hidden">
        <CabeceraPaso n={1} id={planoTituloId} titulo="Plano del terreno">
          <p id={planoAyudaId} className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Marca los límites del terreno, los portones y los accesos. Los tramos,
            las esquinas, los portones y los postes tienen molde: se colocan tocando
            la hoja y salen siempre iguales, sin dibujarlos a pulso.
          </p>
        </CabeceraPaso>

        <div className="mt-4">
          <PlanoEditor
            canvasRef={canvasRef}
            describedBy={`${planoAyudaId} ${planoAlternativaId}`}
          />
        </div>

        <p id={planoAlternativaId} className="mt-3 text-sm text-muted-foreground">
          El plano se dibuja con el dedo o con el ratón y no tiene equivalente con
          teclado; los moldes tampoco, porque hay que decir en qué punto de la hoja
          va cada pieza. Lo que se dibuja aquí se pega solo en la hoja de abajo.
        </p>
      </section>

      {/* ══ LA HOJA DE LA INSPECCIÓN (pasos 2 y 3) ════════════════════
          Ya no se pliega tras un botón: es el trabajo de esta pantalla. Y como
          no se pliega, los seis campos del cliente salen UNA vez —dentro de la
          hoja— en lugar de las dos que había en el archivo viejo. Se rellena
          exactamente lo que se va a imprimir. */}
      <section
        id="printForm"
        aria-labelledby={fichaTituloId}
        className="mt-8 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5 print:m-0 print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >

        {/* ── Cabecera de la hoja ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* El triángulo del logotipo hereda el color del texto: así el
                sistema decide la tinta y no el atributo `fill`. */}
            <svg width="44" height="44" viewBox="0 0 60 60" aria-hidden="true" className="text-brand-green-deep">
              <polygon points="30,5 55,52 5,52" fill="none" stroke="currentColor" strokeWidth="3" />
              <polygon points="30,18 44,42 16,42" fill="currentColor" />
            </svg>
            <div className="leading-tight">
              <p className="font-heading text-sm font-bold text-brand-green-deep">INTEMPERIE</p>
              <p className="text-2xs text-muted-foreground">ESPECIALISTAS EN CERCAS</p>
            </div>
          </div>

          <h2 id={fichaTituloId} className="font-heading text-xl font-bold uppercase tracking-widest text-foreground">
            Control de inspecciones
          </h2>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <Label htmlFor={inspNumId} className="whitespace-nowrap text-xs">Nº inspección</Label>
              <Input
                id={inspNumId}
                value={inspNum}
                onChange={e => setInspNum(e.target.value)}
                maxLength={6}
                inputMode="numeric"
                className="w-24 text-center font-bold text-brand-amber-deep"
              />
            </div>
            <p className="inline-block border-2 border-brand-navy px-2 font-heading text-base font-bold text-brand-navy">
              GRUPOVAZ
            </p>
          </div>
        </div>

        {/* ── Paso 2: datos del cliente ───────────────────────────────── */}
        <section aria-labelledby={datosId} className="mt-5 border-t border-border pt-4">
          <h3 id={datosId} className="eyebrow text-muted-foreground">Datos del cliente</h3>
          {/* Seis campos. En dos columnas son tres filas; desde `xl` caben tres
              columnas —más que de sobra para una dirección—, o sea dos filas.
              No se pliegan ni se esconden: son lo primero que se rellena. */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {DATOS.map(f => (
              <div key={f.id} className="min-w-0">
                <Label htmlFor={f.id} className="mb-1.5">{f.label}</Label>
                <Input
                  id={f.id}
                  type={f.type}
                  inputMode={f.inputMode}
                  autoComplete={f.autoComplete}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── El plano, tal y como se imprime ─────────────────────────── */}
        <section aria-labelledby={planoFichaId} className="mt-5 border-t border-border pt-4">
          <h3 id={planoFichaId} className="eyebrow text-muted-foreground">Plano del terreno</h3>
          {/* `width` y `height` en el atributo: el navegador reserva la caja
              antes de tener la imagen y la hoja no da el salto al cargarla.
              El `src` lo pone el efecto, ya con el lienzo pintado. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={planoImgRef}
            width={PLANO_W}
            height={PLANO_H}
            alt="Plano del terreno dibujado a mano para esta inspección."
            /* Tope al tamaño natural del mapa de bits (1180 px). Ampliar un
               mapa de bits no añade información, sólo alto y pixelado, y justo
               encima está el lienzo que muestra lo mismo. En papel manda la
               hoja, así que ahí el tope se levanta. */
            className="mt-2 block w-full max-w-[1180px] border-2 border-border-strong bg-plan-paper print:max-w-none"
            style={{ imageRendering: "pixelated" }}
          />
        </section>

        {/* ── Materiales ──────────────────────────────────────────────── */}
        <section aria-labelledby={materialesId} className="mt-5 border-t border-border pt-4">
          <h3 id={materialesId} className="eyebrow text-muted-foreground">Materiales y especificaciones</h3>
          <SpecsTable />
        </section>

        {/* ── Consultas y observaciones ───────────────────────────────── */}
        <div className="mt-5 grid gap-3 border-t border-border pt-4 md:grid-cols-2">
          <ConsultasBox />
          <section aria-labelledby={observacionesId} className="rounded-lg border border-border">
            <h3 id={observacionesId} className="rounded-t-[7px] bg-brand-green-deep px-3 py-1.5 text-center text-2xs font-bold text-on-dark">
              OBSERVACIONES ADICIONALES
            </h3>
            <div className="p-3">
              <Label htmlFor={observacionesCampoId} className="sr-only">Observaciones adicionales</Label>
              <Textarea
                id={observacionesCampoId}
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Qué se encontró en el terreno, qué falta, qué hay que tener en cuenta el día del montaje."
                className="min-h-28"
              />
            </div>
          </section>
        </div>

        {/* ── Firmas ──────────────────────────────────────────────────── */}
        <section aria-labelledby={firmasId} className="mt-5 border-t border-border pt-4">
          <h3 id={firmasId} className="eyebrow text-muted-foreground">Firmas</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {([
              { title: "FIRMA DEL CLIENTE",    ref: sig1Ref, nameVal: clientName,      setName: setClientName,      ph: "Nombre del cliente" },
              { title: "NOMBRE DEL INSPECTOR", ref: sig2Ref, nameVal: nombreInspector, setName: setNombreInspector, ph: "Inspector" },
              { title: "VENDEDOR QUE COTIZA",  ref: null,    nameVal: nombreVendedor,  setName: setNombreVendedor,  ph: "Vendedor" },
            ]).map(({ title, ref, nameVal, setName, ph }, fi) => (
              <div key={title} className="rounded-lg border border-border">
                <p className="rounded-t-[7px] bg-brand-navy px-2 py-1.5 text-center text-2xs font-bold uppercase text-on-dark">
                  {title}
                </p>
                <div className="flex flex-col gap-2 p-3">
                  {ref ? (
                    <canvas
                      ref={ref}
                      width={280}
                      height={65}
                      aria-label={`Recuadro para firmar: ${title.toLowerCase()}`}
                      className="block w-full max-w-[280px] touch-none rounded-md border border-dashed border-border-strong bg-plan-paper print:max-w-none"
                      style={{ cursor: "crosshair" }}
                    >
                      Se firma con el dedo o con el ratón dentro de este recuadro.
                    </canvas>
                  ) : (
                    /* Sin lienzo: esta casilla se rellena a mano sobre el
                       papel una vez impresa. Se declara para que no parezca
                       un recuadro roto. Es un fallo conocido y se muda tal
                       cual: no se arregla aquí. */
                    <div
                      className="h-[65px] w-full max-w-[280px] rounded-md border border-dashed border-border bg-surface-2 print:max-w-none"
                      role="img"
                      aria-label="Espacio para firmar a mano sobre la hoja impresa"
                    />
                  )}
                  {ref && (
                    <Button
                      type="button"
                      variant="link"
                      className="min-h-tap self-end text-destructive decoration-destructive/35 hover:decoration-destructive print:hidden"
                      onClick={() => ref.current?.getContext("2d")?.clearRect(0, 0, 280, 65)}
                    >
                      Limpiar firma
                    </Button>
                  )}
                  <div>
                    <Label htmlFor={`${uid}-firma-${fi}`} className="mb-1.5 text-xs">{ph}</Label>
                    <Input
                      id={`${uid}-firma-${fi}`}
                      value={nameVal}
                      onChange={e => setName(e.target.value)}
                      placeholder={ph}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* ── Paso 3: el informe ──────────────────────────────────────────
          Al final y no arriba: se pulsa cuando la hoja ya está rellena, que es
          justo aquí abajo. Ficha con el borde de la marca porque es la acción
          que cierra el trabajo de la pantalla. */}
      <section
        aria-labelledby={informeTituloId}
        className="mt-6 rounded-xl border-2 border-primary/30 bg-surface p-4 shadow-sm sm:p-5 print:hidden"
      >
        <CabeceraPaso n={3} id={informeTituloId} nivel="h2" titulo="Generar el informe" />
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Lanza la impresión del navegador con la hoja de arriba y el plano ya
          pegado. El número de inspección sube uno.
        </p>
        <Button type="button" size="lg" className="mt-4 w-full sm:w-auto" onClick={generatePDF}>
          <ClipboardList className="size-4" aria-hidden="true" />
          Generar informe de inspección (PDF)
        </Button>
      </section>

      {/* ── La regla de impresión ────────────────────────────────────────
          Es lo ÚNICO que no se ha podido mudar literalmente, y conviene decir
          por qué. La regla vieja era:

            body > *:not(#printForm) { display: none }

          o sea, «esconde a todos los hermanos de la hoja», y daba por hecho que
          la hoja cuelga directamente de <body>. Aquí no cuelga: el layout de
          `/admin` la mete dentro de un <div> y un <main>. Copiada tal cual, esa
          regla escondería el contenedor que CONTIENE la hoja y el papel saldría
          en blanco garantizado.

          Se reescribe con `visibility`, que no depende de dónde esté colgada la
          hoja: se apaga todo, se vuelve a encender la hoja y su contenido, y se
          la lleva al origen para que no herede el hueco de la barra lateral.
          `visibility` en vez de `display` a propósito: los ancestros siguen
          maquetando, así que la hoja conserva su ancho y no se colapsa.

          NOTA PARA EL INFORME: el fallo conocido de «el PDF sale en blanco»
          apunta justo a este selector —en la tienda la hoja tampoco colgaba de
          <body>—, así que es probable que este cambio lo resuelva de paso. No
          se ha comprobado con una impresión real y NO se declara arreglado:
          queda anotado para que alguien lo confirme con papel delante. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printForm, #printForm * { visibility: visible; }
          #printForm {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 8px;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
