"use client";

/* Consultas frecuentes del terreno — sistema «Perímetro». SÓLO ADMINISTRACIÓN.
 *
 * Son cuatro preguntas encadenadas y una franja horaria. Van en <fieldset> con
 * <legend> porque «SÍ / NO» leído en voz alta sin la pregunta delante no
 * significa nada, y cada opción es una fila pulsable de 44 px: se contestan de
 * pie, con el teléfono en una mano.
 *
 * Es lo que el inspector comprueba en el sitio —si hay pase, cómo está el
 * terreno, si hay agua y luz— y no una pregunta al cliente: por eso vive en la
 * ficha interna y no en la pantalla pública.
 *
 * Las respuestas, la exclusividad de «NINGUNO» y el desplegado condicional no
 * se tocan.
 */
import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConsultasBox() {
  const uid = useId();
  const [inst,    setInst]    = useState("");
  const [pase,    setPase]    = useState("");
  const [terreno, setTerreno] = useState("");
  const [agg,     setAgg]     = useState<string[]>([]);
  const [svc,     setSvc]     = useState<string[]>([]);
  const [entrada, setEntrada] = useState("");
  const [salida,  setSalida]  = useState("");

  const toggleArr = (arr: string[], val: string, set: (v:string[])=>void, exclusive?: string) => {
    if (val === exclusive) { set([exclusive]); return; }
    const next = arr.includes(val) ? arr.filter(x=>x!==val) : [...arr.filter(x=>x!==exclusive), val];
    set(next);
  };

  const rowCls = "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:border-border-strong has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground";
  const controlCls = "size-5 shrink-0 accent-primary";
  const legendCls = "mb-2 font-heading text-xs font-bold text-foreground";

  return (
    <section aria-labelledby={`${uid}-titulo`} className="rounded-lg border border-border">
      <h3 id={`${uid}-titulo`} className="rounded-t-[7px] bg-brand-navy px-3 py-1.5 text-center text-2xs font-bold text-on-dark">
        CONSULTAS FRECUENTES
      </h3>
      <div className="space-y-4 p-3">
        <fieldset>
          <legend className={legendCls}>¿Con instalación?</legend>
          <div className="flex flex-wrap gap-2">
            {["si","no"].map(val => (
              <label key={val} className={rowCls}>
                <input type="radio" name={`${uid}-inst`} value={val} checked={inst===val} onChange={() => setInst(val)} className={controlCls} />
                {val.toUpperCase()}
              </label>
            ))}
          </div>
        </fieldset>

        {inst==="si" && (
          <div className="space-y-4 border-l-2 border-primary pl-3">
            <fieldset>
              <legend className={legendCls}>¿Hay pase de acceso?</legend>
              <div className="flex flex-wrap gap-2">
                {["si","no"].map(val => (
                  <label key={val} className={rowCls}>
                    <input type="radio" name={`${uid}-pase`} value={val} checked={pase===val} onChange={() => setPase(val)} className={controlCls} />
                    {val.toUpperCase()}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendCls}>Tipo de terreno</legend>
              <div className="flex flex-wrap gap-2">
                {[["optimo","ÓPTIMO"],["regular","REGULAR"],["desfavorable","DESFAVORABLE"]].map(([val,lbl]) => (
                  <label key={val} className={rowCls}>
                    <input type="radio" name={`${uid}-ter`} value={val} checked={terreno===val} onChange={() => setTerreno(val)} className={controlCls} />
                    {lbl}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendCls}>Agregados</legend>
              <div className="flex flex-wrap gap-2">
                {[["arena","ARENA"],["piedra","PIEDRA"],["cemento","CEMENTO"],["ninguno","NINGUNO"]].map(([val,lbl]) => (
                  <label key={val} className={rowCls}>
                    <input type="checkbox" checked={agg.includes(val)} onChange={() => toggleArr(agg, val, setAgg, "ninguno")} className={controlCls} />
                    {lbl}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendCls}>El lugar cuenta con</legend>
              <div className="flex flex-wrap gap-2">
                {[["agua","AGUA"],["electrica","ELÉCTRICA"],["ninguno","NINGUNO"]].map(([val,lbl]) => (
                  <label key={val} className={rowCls}>
                    <input type="checkbox" checked={svc.includes(val)} onChange={() => toggleArr(svc, val, setSvc, "ninguno")} className={controlCls} />
                    {lbl}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendCls}>Horario de trabajo en sitio</legend>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label htmlFor={`${uid}-entrada`} className="mb-1.5 text-xs">Entrada</Label>
                  <Input id={`${uid}-entrada`} type="time" value={entrada} onChange={e=>setEntrada(e.target.value)} className="w-36" />
                </div>
                <div>
                  <Label htmlFor={`${uid}-salida`} className="mb-1.5 text-xs">Salida</Label>
                  <Input id={`${uid}-salida`} type="time" value={salida} onChange={e=>setSalida(e.target.value)} className="w-36" />
                </div>
              </div>
            </fieldset>
          </div>
        )}
      </div>
    </section>
  );
}
