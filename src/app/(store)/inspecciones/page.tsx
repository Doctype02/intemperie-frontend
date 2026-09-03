"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Send } from "lucide-react";

import { useAuthStore } from "@/lib/store/auth-store";
import { CabeceraPaso, TiraPasos } from "@/components/inspecciones/pasos";
import { PlanoEditor } from "@/components/inspecciones/plano-editor";
import { PlanoEjemplo } from "@/components/inspecciones/plano-ejemplo";
import { Button } from "@/components/ui/button";
import { whatsappHref } from "@/components/ui/icon-whatsapp";

/* Solicitud de inspección — sistema «Perímetro». PANTALLA DE CLIENTE.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * UN SOLO PÚBLICO
 *
 * Esta pantalla intentaba ser dos herramientas a la vez. El mismo archivo
 * pintaba la solicitud del cliente y la ficha interna del inspector, y las
 * separaba con ramas `isAdmin`: tres cadenas distintas en la cabecera, un
 * tercer paso que cambiaba de destino, una banda ámbar de «sólo
 * administración» y, colgando de ella, la hoja imprimible con la tabla de
 * materiales, las consultas del terreno y las firmas.
 *
 * El cliente lo vio y fue tajante: «eso no me sirve, eso no debe verlo el
 * cliente». Así que la herramienta del inspector NO se ha borrado —se ha
 * mudado a `/admin/inspecciones`, bajo el portero de rol que ya existe— y aquí
 * no queda ni una sola condición por rol. Una pantalla, un público, una
 * lectura.
 *
 * Lo que hace esta pantalla, entero: dibujar el plano del terreno con sus
 * cinco herramientas y sus once moldes, recoger los datos de contacto y sacar
 * la solicitud por WhatsApp.
 *
 * Lo que se fue a `/admin/inspecciones`: el paso «El informe», la hoja
 * imprimible, el botón de generar el PDF, el contador de inspecciones de
 * `localStorage`, la tabla de materiales, las consultas y las firmas.
 *
 * Lo que se queda aunque venga del mismo sitio: «Así se ve un plano
 * terminado». Decisión explícita del cliente, y con razón: es lo único de la
 * pantalla que le dice a alguien qué se espera que dibuje.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * EL REPARTO DEL ESPACIO
 *
 * Al vaciar lo interno había que volver a medir, porque un hueco nuevo es
 * justo la queja que esta pantalla arrastra. Medido en 1440: la columna
 * derecha —datos, envío y ejemplo— terminaba en y≈1115 y la del plano seguía
 * hasta y≈1420. Trescientos píxeles de blanco colgando al lado del ejemplo.
 *
 * El culpable no era el contenido sino la hoja: `min-h-[30rem]` le ganaba a
 * `aspect-[59/21]` y estiraba el lienzo a 480 px de alto dentro de una columna
 * de 880, o sea 880×480 donde la proporción del mapa de bits pide 880×313. No
 * sólo sobraban 167 px: el plano salía DEFORMADO —un cuadrado dibujado se
 * imprimía como un rectángulo—, que es peor que el hueco. El suelo de alto se
 * levanta desde `sm`, donde el ancho ya da de sí, y se queda en el móvil, que
 * es donde hace falta para poder dibujar con el dedo. Ver la nota del lienzo.
 */

const MEDIDA = "shell max-w-[100rem]";

const PASOS = ["Dibuja el plano", "Deja tus datos", "Envía la solicitud"] as const;

export default function InspeccionesPage() {
  const { user } = useAuthStore();

  /* Identificadores propios de esta instancia: los mismos que cosen cada
     etiqueta con su campo y el lienzo con su alternativa de texto. */
  const uid = useId();
  const planoTituloId = `${uid}-plano`;
  const planoAyudaId = `${uid}-plano-ayuda`;
  const planoAlternativaId = `${uid}-plano-alternativa`;
  const datosTituloId = `${uid}-datos-titulo`;
  const envioTituloId = `${uid}-envio`;
  const guiaTituloId = `${uid}-guia`;
  const pasosId = `${uid}-pasos`;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* Los datos de contacto. Los que ya se saben por la sesión llegan puestos. */
  const today = new Date().toISOString().split("T")[0];
  const [clientName, setClientName] = useState(user?.name ?? "");
  const [telefono,   setTelefono]   = useState(user?.phone ?? "");
  const [correo,     setCorreo]     = useState(user?.email ?? "");
  const [fecha,      setFecha]      = useState(today);
  const [direccion,  setDireccion]  = useState("");
  const [referencia, setReferencia] = useState("");

  /* Los dos avisos del compilador de React que vienen a continuación son
     correctos: son estados que se fijan desde un efecto y encadenan un render
     de más. Quitarlos es rehacer la manera en que la ficha se rellena con la
     sesión, o sea, lógica —y este encargo es de diseño y usabilidad—. Se
     silencian uno a uno, señalados, en vez de dejarlos sueltos. Están en el
     informe. */
  // eslint-disable-next-line react-hooks/set-state-in-effect -- la sesión llega tarde y rellena la ficha; no se rehace aquí
  useEffect(() => { if (user?.name)  setClientName(user.name); }, [user?.name]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- ídem
  useEffect(() => { if (user?.email) setCorreo(user.email);    }, [user?.email]);

  /* Los datos de contacto, en el orden en que se preguntan de pie en un
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
    <div className="bg-background">

      {/* ── Encabezado de la página ─────────────────────────────────────
          Esto es una herramienta de trabajo, no una página de contenido: la
          cabecera es el rótulo de la máquina, no su portada. Apilada
          —antetítulo, título, entrada y debajo los tres pasos— medía 278 px
          en 1440 y los gastaba en la mitad izquierda: de x≈700 a x≈1400 no
          había absolutamente nada, y el lienzo, que es a lo que se viene,
          arrancaba fuera del primer viewport de un portátil.

          Repartida a lo ancho —el rótulo a la izquierda, el mapa de pasos a
          la derecha, en la MISMA banda— ocupa el hueco que ya estaba vacío en
          vez de pedir alto nuevo. No se quita ni una palabra: se deja de
          apilar lo que cabía al lado. */}
      <div className="border-b border-border bg-surface">
        <div className={`${MEDIDA} flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-5`}>
          <div className="min-w-0">
            <p className="eyebrow text-brand-green">Inspección en sitio</p>
            {/* `text-2xl` en móvil, `text-3xl` sólo desde `sm:` (escala del
                sistema): en pantalla estrecha el titular no debe competir con
                el lienzo; con más ancho ya hay sitio para ambos. */}
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Solicitar inspección</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Dibuja el contorno de tu propiedad y déjanos cómo localizarte. Un
              inspector de Intemperie levanta el plano en sitio.
            </p>
          </div>

          <h2 id={pasosId} className="sr-only">Cómo funciona</h2>
          <TiraPasos pasos={PASOS} id={pasosId} />
        </div>
      </div>

      {/* ══ EL CUERPO: LA HERRAMIENTA Y LA SOLICITUD ══════════════════
          Dos columnas desde `lg` y en el orden en que se trabaja: a la
          izquierda se dibuja, a la derecha se entrega. Antes el botón de
          enviar caía suelto al final de la página, a media pantalla del último
          campo que había que rellenar. Metiendo el paso 3 en la misma columna
          que el paso 2 las dos columnas terminan a la vez y no sobra hueco en
          ninguna.

          En móvil se apilan en el mismo orden —plano, datos, enviar—, que es
          además el orden en que se hace de pie en un terreno.

          `pt-8` y no `py-section-sm`: la cabecera de arriba ya cierra con su
          propio relleno y los dos se sumaban. En escritorio eran 112 px de
          hueco entre el título de la página y «Plano del terreno», con el
          cambio de fondo ya marcando la separación. */}
      <div className={`${MEDIDA} grid items-start gap-x-8 gap-y-section-sm pt-8 pb-section-sm lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]`}>

        {/* ── Paso 1: el plano ──────────────────────────────────────────── */}
        <section aria-labelledby={planoTituloId} className="min-w-0">
          <CabeceraPaso n={1} id={planoTituloId} titulo="Plano del terreno">
            {/* Seis líneas en un teléfono, y cuatro de ellas repetían la lista
                de «Así se ve un plano terminado». Queda lo que la lista no
                dice: que hay moldes. */}
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

          {/* Alternativa honesta: un dibujo a mano no se puede describir, así que
              no se finge una descripción. Se dice qué es, para qué sirve y por
              dónde se hace lo mismo sin dibujar. Está a la vista de todos y no
              escondida en un sr-only, porque a quien dibuja con el dedo en una
              pantalla de 5 pulgadas también le sirve saberlo. */}
          <p id={planoAlternativaId} className="mt-3 text-sm text-muted-foreground">
            El plano se dibuja con el dedo o con el ratón y no tiene equivalente con
            teclado; los moldes tampoco, porque hay que decir en qué punto de la hoja
            va cada pieza. Si no puedes dibujarlo, descríbelo por escrito al pedir la
            inspección: un inspector de Intemperie levanta el plano en sitio.
          </p>
        </section>

        {/* ══ LA COLUMNA DE LA SOLICITUD (pasos 2 y 3) ══════════════════
            Los datos y el envío son el mismo trabajo —entregar la solicitud— y
            por eso van juntos y en fichas seguidas, no a media pantalla de
            distancia. Se rellena y se envía sin mover la vista. */}
        <div className="flex min-w-0 flex-col gap-5">

          {/* ── Paso 2: los datos ───────────────────────────────────────── */}
          <section aria-labelledby={datosTituloId} className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <CabeceraPaso n={2} id={datosTituloId} nivel="h2" titulo="Sus datos">
              <p className="mt-2 text-sm text-muted-foreground">
                Para poder responderle y saber a dónde ir.
              </p>
            </CabeceraPaso>
            {/* Seis campos en una sola columna son 456 px de alto, y en 768 px de
                pantalla —donde la ficha ocupa el ancho entero— sobraban 350 px a
                la derecha de cada campo. En dos columnas son tres filas. Desde
                `lg` la ficha vuelve a ser una columna estrecha al lado del plano,
                y desde `xl` vuelve a haber ancho para dos. */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {DATOS.map((f) => (
                <p key={f.id}>
                  <label htmlFor={f.id} className="mb-1 block text-xs font-semibold text-foreground">
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    inputMode={f.inputMode}
                    autoComplete={f.autoComplete}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="min-h-tap w-full rounded-md border border-border-strong bg-surface px-3 text-base text-foreground"
                  />
                </p>
              ))}
            </div>
          </section>

          {/* ── Paso 3: qué pasa al enviar ──────────────────────────────
              El botón estaba solo en medio de la página y no decía a dónde
              llevaba. Ahora va en una ficha con el borde de la marca —es la
              acción principal de la pantalla y se ve que lo es— y debajo, en
              una línea, lo que ocurre al pulsarlo. No se promete nada nuevo:
              es literalmente lo que el botón ya hacía —abrir WhatsApp con los
              datos escritos— y el plano sigue sin viajar por el enlace, que es
              la única letra pequeña que había que contar y no se contaba. */}
          <section aria-labelledby={envioTituloId} className="rounded-xl border-2 border-primary/30 bg-surface p-4 shadow-sm sm:p-5">
            <CabeceraPaso n={3} id={envioTituloId} nivel="h2" titulo="Enviar la solicitud" />
            <p className="mt-2 text-sm text-muted-foreground">
              Se abre WhatsApp con tus datos ya escritos; sólo tienes que
              darle a enviar. El plano no viaja por el enlace: lo enseñas
              desde esta misma pantalla cuando te contesten.
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-4 w-full"
              /* Antes esto era un `alert()` y nada mas: la solicitud no salia
                 de la pantalla. WhatsApp es el canal que esta tienda ya usa en
                 el cotizador y en instaladores, y `whatsappHref` codifica una
                 sola vez. El plano no viaja por un enlace de WhatsApp, asi que
                 se dice en el mensaje en vez de fingir que va adjunto. */
              onClick={() => {
                const l = (t: string, v: string) => (v.trim() ? [`• ${t}: ${v.trim()}`] : [])
                window.open(
                  whatsappHref(
                    [
                      "Hola Intemperie, quiero solicitar una inspeccion.",
                      "",
                      ...l("Nombre", clientName),
                      ...l("Telefono", telefono),
                      ...l("Correo", correo),
                      ...l("Direccion", direccion),
                      ...l("Punto de referencia", referencia),
                      ...l("Fecha deseada", fecha),
                      "",
                      "Tengo el plano dibujado en la web y se lo enseno cuando me escriban.",
                    ].join("\n"),
                  ),
                  "_blank",
                  "noopener,noreferrer",
                )
              }}
            >
              <Send className="size-4" aria-hidden="true" />
              Enviar solicitud de inspección
            </Button>
          </section>

          {/* ── Qué se espera que salga de aquí ───────────────────────────
              SE QUEDA por decisión explícita del cliente, y es la correcta: es
              lo único de la pantalla que le dice a alguien qué se espera que
              dibuje. Una hoja en blanco no lo dice.

              El ejemplo NO es un dibujo aparte: sale de las mismas piezas y de
              la misma función que pinta el plano de verdad (`moldes.ts`), así
              que promete exactamente lo que la herramienta entrega.

              Vive en la columna derecha y no bajo el lienzo: aquí acompaña a
              los datos y cierra la columna corta; bajo el plano estiraría la
              larga y volvería a abrir el hueco que este reparto cierra. */}
          <section aria-labelledby={guiaTituloId} className="rounded-xl border border-border bg-surface-2 p-3 sm:p-4">
            <h3 id={guiaTituloId} className="eyebrow text-muted-foreground">
              Así se ve un plano terminado
            </h3>
            {/* En paralelo mientras la ficha es ancha: apilados en un teléfono,
                la muestra y la lista sumaban 330 px. La muestra encoge, que
                para eso es una muestra.

                Desde `lg` se apilan, y no por gusto: ahí la ficha pasa a ser la
                columna estrecha al lado del plano, y esa columna terminaba
                153 px antes que la del lienzo —el hueco que había que cerrar—.
                Apilada, la muestra deja de ser una miniatura de 236 px y ocupa
                el ancho de la ficha, que es justo lo que faltaba: el hueco se
                llena con el ejemplo más grande y legible en vez de con aire, y
                las dos columnas terminan a la par. */}
            <div className="mt-3 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-start gap-3 sm:gap-4 lg:grid-cols-1">
              <PlanoEjemplo className="lg:max-w-none" />
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {[
                  "Los límites del terreno, lado por lado.",
                  "Dónde va el portón de carro y dónde la puerta de persona.",
                  "Los accesos y las zonas especiales que haya que tener en cuenta.",
                  "No hace falta que esté a escala ni que salga bonito.",
                ].map(linea => (
                  <li key={linea} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {linea}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
