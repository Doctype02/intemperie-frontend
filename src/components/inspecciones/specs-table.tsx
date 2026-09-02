"use client";

/* La tabla de materiales — sistema «Perímetro». SÓLO ADMINISTRACIÓN.
 *
 * Once columnas —cinco pares de concepto y cantidad, más puerta y portón— que
 * en la hoja impresa caben y en un teléfono no caben de ninguna manera. Antes
 * la tabla estiraba el ancho de la página entera y había que apartarla con dos
 * dedos para leer cualquier otra cosa; ahora rueda dentro de su caja y el
 * resto de la ficha se queda quieto.
 *
 * Esto es papeleo interno: cemento, postes, tapas y cerraduras con sus
 * cantidades. Un cliente que pide una inspección no tiene por qué verlo —«eso
 * no me sirve, eso no debe verlo el cliente»— y por eso vive en el módulo de
 * la ficha del inspector y no en la pantalla pública.
 *
 * EL SUELO. Medido en el navegador: la tabla pide 922 px para caber partiendo
 * etiquetas y 1167 px para no partir ninguna. El suelo estaba en 1024 —entre
 * los dos— y la caja que lo contenía daba 980, así que rodaba en horizontal en
 * todos los anchos, también en un monitor de 1920 con 704 px en blanco a los
 * lados. Desde `lg` el suelo baja a 928, justo por encima del mínimo real.
 *
 * Por debajo de `lg` el suelo se queda en 1024 a propósito. Ahí la tabla no cabe
 * de ninguna manera —en un teléfono de 390 px la caja da 358—, así que bajarle
 * el suelo no la hacía caber: sólo apretaba más las etiquetas, que pasaban a dos
 * líneas y estiraban la ficha 31 px. Se ahorraban 104 px de arrastre lateral a
 * cambio de 31 px de página; en el móvil, que es donde se rellena de pie, no
 * compensa. El suelo sube donde sirve y se queda donde no.
 *
 * Los campos miden 44 px de alto y 16 px de cuerpo. Por debajo de 16, Safari
 * en iOS hace zoom al enfocar el campo y deja la página descolocada: escribir
 * doce cantidades seguidas se convierte en doce zooms y doce reencuadres. En
 * papel se compactan con las variantes `print:`, que es donde la densidad sí
 * hace falta.
 *
 * Cada cantidad lleva `aria-label` con su grupo y su concepto —«Accesorios,
 * CERRADURAS MAGNÉTICAS, puerta»—: en una rejilla de once columnas, el nombre
 * del campo leído en voz alta es lo único que dice qué se está rellenando.
 *
 * Los conceptos, las claves y la suma de postes no se tocan.
 */
import { useState } from "react";

export function SpecsTable() {
  type Vals = Record<string, string>;
  const [v, setV] = useState<Vals>({});
  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setV(p => ({ ...p, [k]: e.target.value }));
  const totalPostes = ["pEsq","pLin","pTop","p3w","pCie","p3x3"].reduce((acc,k) => acc + (+v[k]||0), 0);

  const rows = [
    { s1:"TOTAL PACKS",    s1k:"packs",  s1t:"number", p2:"☑ P. ESQUINERO",    p2k:"pEsq", a3:"CANALETA ACOPLE",       a3k:"cAcp", a4:"BASES ALUM. 4x4",    a4k:"b4x4", ac:"ESTÁNDAR S/MODELO",      ap:"aEsp",  at:"aEst" },
    { s1:"MODELO",         s1k:"modelo", s1t:"text",   p2:"/ P. LINIERO",      p2k:"pLin", a3:"CANALETA LATTICCE",    a3k:"cLat", a4:"BASES ALUM. 5x5",    a4k:"b5x5", ac:"PASADOR DE PISO",        ap:"aPasp", at:"aPast" },
    { s1:"TOTAL ML",       s1k:"ml",     s1t:"number", p2:"■ P. TOPE",         p2k:"pTop", a3:"RIEL TAPA LUZ 7/8\"", a3k:"rTap", a4:"ALUMINIO ADR",        a4k:"aAdr", ac:"TIRADOR SENCILLO",       ap:"aTirp", at:"aTirt" },
    { s1:"ARENA (sacos)",  s1k:"sAre",   s1t:"number", p2:"3 P. 3WAY",         p2k:"p3w",  a3:"SOPORTE DE PARED",     a3k:"sPar", a4:"KIT ANCLAJE CABILLA", a4k:"kAnc", ac:"CERRADURAS 2 CARAS",     ap:"aCr2p", at:"aCr2t" },
    { s1:"CEMENTO (sacos)",s1k:"sCem",   s1t:"number", p2:"P. CIEGO",          p2k:"pCie", a3:"PIE DE POSTE",         a3k:"pPos", a4:"TAPA GÓTICA",         a4k:"tGot", ac:"CERRADURAS MAGNÉTICAS",  ap:"aMgp",  at:"aMgt" },
    { s1:"PIEDRA (sacos)", s1k:"sPie",   s1t:"number", p2:"P. 3X3",            p2k:"p3x3", a3:"TAPA DECORATIVA",      a3k:"tDec", a4:"TAPA INGLESA",        a4k:"tIng", ac:"CERRADURAS SENC. GRANDE",ap:"aSGp",  at:"aSGt" },
    { s1:"",               s1k:"",       s1t:"",       p2:"TOTAL POSTES",      p2k:null,   a3:"OREJA DE PERRO",       a3k:"oPer", a4:"TAPA SOLAR",          a4k:"tSol", ac:"CERRADURAS SENC. PEQUEÑA",ap:"aSPp", at:"aSPt" },
  ];

  const qCls = [
    "h-11 w-16 rounded-md border border-input bg-surface px-1",
    "text-center text-[1rem] tabular-nums text-foreground",
    "transition-colors outline-none hover:border-foreground/35 focus-visible:border-ring",
    "print:h-6 print:w-12 print:text-xs",
  ].join(" ");
  const labelCell = "border border-border px-2 py-1 text-xs font-semibold text-foreground";
  const inputCell = "border border-border p-1";
  const headCell = "border border-border-strong px-2 py-1 text-2xs font-bold";

  return (
    <>
      {/* El aviso sólo aparece donde la tabla rueda de verdad. Desde 1024 px
          cabe entera —el suelo bajó de 1024 a 928 y la caja da 960— y dejarlo
          puesto sería mandar a arrastrar una tabla que no se mueve. `lg:hidden`
          y no un estado: la condición es el ancho, y el ancho ya lo sabe CSS. */}
      <p className="mt-2 text-xs text-muted-foreground print:hidden lg:hidden">
        La tabla rueda en horizontal: arrástrala con el dedo para llegar a las
        últimas columnas.
      </p>
      <div className="mt-2 overflow-x-auto print:overflow-visible">
        <table className="w-full min-w-[64rem] border-collapse text-xs print:min-w-0 lg:min-w-[58rem]">
          <caption className="sr-only">
            Materiales y accesorios de la inspección, en cinco bloques: especificaciones,
            postes adicionales, dos de adicionales y accesorios con su cantidad en puerta y portón.
          </caption>
          <thead>
            <tr className="text-center">
              <th colSpan={2} scope="colgroup" className={`${headCell} bg-brand-green-deep text-on-dark`}>1) ESPECIFICACIONES</th>
              <th colSpan={2} scope="colgroup" className={`${headCell} bg-brand-navy text-on-dark`}>2) POSTES ADICIONALES</th>
              <th colSpan={2} scope="colgroup" className={`${headCell} bg-brand-navy text-on-dark`}>3) ADICIONALES</th>
              <th colSpan={2} scope="colgroup" className={`${headCell} bg-brand-amber-deep text-on-dark`}>3) ADICIONALES</th>
              <th scope="col" className={`${headCell} bg-brand-green-deep text-on-dark`}>4) ACCESORIOS</th>
              <th scope="col" className={`${headCell} bg-brand-green-deep text-on-dark`}>PRTA</th>
              <th scope="col" className={`${headCell} bg-brand-green-deep text-on-dark`}>PRTON</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={i} className={i%2===0 ? "bg-surface" : "bg-surface-2"}>
                <td className={`${labelCell} whitespace-nowrap bg-brand-navy-soft`}>{r.s1}</td>
                <td className={inputCell}>{r.s1k && <input type={r.s1t} value={v[r.s1k]??""} onChange={s(r.s1k)} aria-label={`Especificaciones, ${r.s1}`} className={qCls} />}</td>
                <td className={labelCell}>{r.p2}</td>
                <td className={inputCell}>{r.p2k
                  ? <input type="number" min={0} value={v[r.p2k]??""} onChange={s(r.p2k)} aria-label={`Postes adicionales, ${r.p2}`} className={qCls} />
                  : <input readOnly value={totalPostes||""} aria-label="Total de postes, calculado" className={`${qCls} bg-surface-sunk`} />}</td>
                <td className={labelCell}>{r.a3}</td>
                <td className={inputCell}>{r.a3k && <input type="number" min={0} value={v[r.a3k]??""} onChange={s(r.a3k)} aria-label={`Adicionales, ${r.a3}`} className={qCls} />}</td>
                <td className={labelCell}>{r.a4}</td>
                <td className={inputCell}>{r.a4k && <input type="number" min={0} value={v[r.a4k]??""} onChange={s(r.a4k)} aria-label={`Adicionales, ${r.a4}`} className={qCls} />}</td>
                <td className={labelCell}>{r.ac}</td>
                <td className={inputCell}><input type="number" min={0} value={v[r.ap]??""} onChange={s(r.ap)} aria-label={`Accesorios, ${r.ac}, puerta`} className={qCls} /></td>
                <td className={inputCell}><input type="number" min={0} value={v[r.at]??""} onChange={s(r.at)} aria-label={`Accesorios, ${r.ac}, portón`} className={qCls} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
