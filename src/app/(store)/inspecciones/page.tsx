"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { Metadata } from "next";

/* ── types ─────────────────────────────────────────────────── */
type Tool = "pencil" | "line" | "rect" | "text" | "eraser";

interface FormData {
  inspNum: string; clientName: string; fecha: string;
  direccion: string; referencia: string; telefono: string; correo: string;
  totalPacks: string; modelo: string; totalML: string;
  sacoArena: string; sacoCemento: string; sacoPiedra: string;
  pEsquinero: string; pLiniero: string; pTope: string;
  p3way: string; pCiego: string; p3x3: string;
  canalAcople: string; canalLatticce: string; rielTapa: string;
  soportePared: string; piePoste: string; tapaDecorativa: string; orejaPerro: string;
  base4x4: string; base5x5: string; alumADR: string; kitAnclaje: string;
  tapaGotica: string; tapaInglesa: string; tapaSolar: string;
  accEst_p: string; accEst_t: string; accPas_p: string; accPas_t: string;
  accTir_p: string; accTir_t: string; accCerr2_p: string; accCerr2_t: string;
  accCerrMag_p: string; accCerrMag_t: string; accCerrSG_p: string; accCerrSG_t: string;
  accCerrSP_p: string; accCerrSP_t: string;
  instalacion: string; paseAcceso: string; terreno: string;
  aggArena: boolean; aggPiedra: boolean; aggCemento: boolean; aggNinguno: boolean;
  svcAgua: boolean; svcElec: boolean; svcNinguno: boolean;
  horaEntrada: string; horaSalida: string;
  observaciones: string; nombreCliente: string; nombreInspector: string; nombreVendedor: string;
}

const EMPTY: FormData = {
  inspNum: "0001", clientName: "", fecha: new Date().toISOString().split("T")[0],
  direccion: "", referencia: "", telefono: "", correo: "",
  totalPacks: "", modelo: "", totalML: "",
  sacoArena: "", sacoCemento: "", sacoPiedra: "",
  pEsquinero: "", pLiniero: "", pTope: "", p3way: "", pCiego: "", p3x3: "",
  canalAcople: "", canalLatticce: "", rielTapa: "",
  soportePared: "", piePoste: "", tapaDecorativa: "", orejaPerro: "",
  base4x4: "", base5x5: "", alumADR: "", kitAnclaje: "",
  tapaGotica: "", tapaInglesa: "", tapaSolar: "",
  accEst_p: "", accEst_t: "", accPas_p: "", accPas_t: "",
  accTir_p: "", accTir_t: "", accCerr2_p: "", accCerr2_t: "",
  accCerrMag_p: "", accCerrMag_t: "", accCerrSG_p: "", accCerrSG_t: "",
  accCerrSP_p: "", accCerrSP_t: "",
  instalacion: "", paseAcceso: "", terreno: "",
  aggArena: false, aggPiedra: false, aggCemento: false, aggNinguno: false,
  svcAgua: false, svcElec: false, svcNinguno: false,
  horaEntrada: "", horaSalida: "",
  observaciones: "", nombreCliente: "", nombreInspector: "", nombreVendedor: "",
};

/* ══ CANVAS HOOK ════════════════════════════════════════════ */
function useDrawCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
  const toolRef       = useRef<Tool>("pencil");
  const colorRef      = useRef("#1a1a2e");
  const widthRef      = useRef(2);
  const drawingRef    = useRef(false);
  const lastRef       = useRef({ x: 0, y: 0 });
  const startRef      = useRef({ x: 0, y: 0 });
  const snapshotRef   = useRef<ImageData | null>(null);
  const historyRef    = useRef<string[]>([]);
  const histIdxRef    = useRef(-1);
  const gridRef       = useRef(true);

  const getCtx = () => ref.current?.getContext("2d") ?? null;

  const drawGrid = useCallback(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = getCtx()!;
    if (!gridRef.current) return;
    ctx.save();
    ctx.strokeStyle = "#c8e6c9";
    ctx.lineWidth   = 0.5;
    const CELL = 20;
    for (let x = 0; x <= canvas.width; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += CELL) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    ctx.restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const saveHistory = useCallback(() => {
    const canvas = ref.current; if (!canvas) return;
    historyRef.current = historyRef.current.slice(0, histIdxRef.current + 1);
    historyRef.current.push(canvas.toDataURL());
    if (historyRef.current.length > 40) historyRef.current.shift();
    histIdxRef.current = historyRef.current.length - 1;
  }, [ref]);

  const restoreHistory = useCallback((idx: number) => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = getCtx()!;
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      ctx.drawImage(img, 0, 0);
    };
    img.src = historyRef.current[idx];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, drawGrid]);

  const undo  = () => { if (histIdxRef.current > 0) { histIdxRef.current--; restoreHistory(histIdxRef.current); } };
  const redo  = () => { if (histIdxRef.current < historyRef.current.length - 1) { histIdxRef.current++; restoreHistory(histIdxRef.current); } };

  const clear = useCallback(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = getCtx()!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    saveHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, drawGrid, saveHistory]);

  const toggleGrid = useCallback(() => {
    gridRef.current = !gridRef.current;
    if (histIdxRef.current >= 0) restoreHistory(histIdxRef.current);
    else clear();
  }, [restoreHistory, clear]);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const r   = canvas.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  const init = useCallback(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx    = getCtx()!;

    drawGrid();
    saveHistory();

    const onDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const { x, y } = getPos(e, canvas);
      drawingRef.current = true;
      lastRef.current    = { x, y };
      startRef.current   = { x, y };
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (toolRef.current === "text") {
        drawingRef.current = false;
        const txt = prompt("Texto:");
        if (txt) {
          ctx.font      = `${Math.max(12, widthRef.current * 5)}px Arial`;
          ctx.fillStyle = colorRef.current;
          ctx.fillText(txt, x, y);
          saveHistory();
        }
      }
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const { x, y } = getPos(e, canvas);
      const tool = toolRef.current;

      if (tool === "pencil") {
        ctx.beginPath();
        ctx.moveTo(lastRef.current.x, lastRef.current.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = colorRef.current;
        ctx.lineWidth   = widthRef.current;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.stroke();
        lastRef.current = { x, y };
      } else if (tool === "eraser") {
        ctx.beginPath();
        ctx.arc(x, y, Math.max(8, widthRef.current * 4), 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        lastRef.current = { x, y };
      } else if (tool === "line") {
        ctx.putImageData(snapshotRef.current!, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startRef.current.x, startRef.current.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = colorRef.current;
        ctx.lineWidth   = widthRef.current;
        ctx.lineCap     = "round";
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.putImageData(snapshotRef.current!, 0, 0);
        ctx.beginPath();
        ctx.rect(startRef.current.x, startRef.current.y, x - startRef.current.x, y - startRef.current.y);
        ctx.strokeStyle = colorRef.current;
        ctx.lineWidth   = widthRef.current;
        ctx.stroke();
      }
    };

    const onUp = () => { if (drawingRef.current) { drawingRef.current = false; saveHistory(); } };

    canvas.addEventListener("mousedown",  onDown);
    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("mouseup",    onUp);
    canvas.addEventListener("mouseleave", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove",  onMove, { passive: false });
    canvas.addEventListener("touchend",   onUp);

    return () => {
      canvas.removeEventListener("mousedown",  onDown);
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("mouseup",    onUp);
      canvas.removeEventListener("mouseleave", onUp);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchmove",  onMove);
      canvas.removeEventListener("touchend",   onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, drawGrid, saveHistory]);

  return { toolRef, colorRef, widthRef, gridRef, undo, redo, clear, toggleGrid, init };
}

/* ══ SIGNATURE PAD HOOK ═════════════════════════════════════ */
function useSigPad(ref: React.RefObject<HTMLCanvasElement | null>) {
  const drawing = useRef(false);
  const last    = useRef({ x: 0, y: 0 });

  const init = useCallback(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx    = canvas.getContext("2d")!;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const r   = canvas.getBoundingClientRect();
      const src = "touches" in e ? e.touches[0] : e;
      return { x: src.clientX - r.left, y: src.clientY - r.top };
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      drawing.current = true;
      const p = getPos(e); last.current = p;
      ctx.beginPath(); ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = "#111"; ctx.fill();
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return; e.preventDefault();
      const { x, y } = getPos(e);
      ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(x, y);
      ctx.strokeStyle = "#111"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.stroke();
      last.current = { x, y };
    };
    const onUp = () => { drawing.current = false; };

    canvas.addEventListener("mousedown",  onDown);
    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("mouseup",    onUp);
    canvas.addEventListener("mouseleave", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove",  onMove, { passive: false });
    canvas.addEventListener("touchend",   onUp);

    return () => {
      canvas.removeEventListener("mousedown",  onDown);
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("mouseup",    onUp);
      canvas.removeEventListener("mouseleave", onUp);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchmove",  onMove);
      canvas.removeEventListener("touchend",   onUp);
    };
  }, [ref]);

  const clear = () => {
    const c = ref.current; if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  };

  return { init, clear };
}

/* ══ MAIN COMPONENT ═════════════════════════════════════════ */
export default function InspeccionesPage() {
  const [form,      setForm]      = useState<FormData>({ ...EMPTY });
  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [drawColor, setDrawColor] = useState("#1a1a2e");
  const [strokeW,   setStrokeW]   = useState(2);
  const [gridOn,    setGridOn]    = useState(true);

  const drawRef = useRef<HTMLCanvasElement | null>(null);
  const sig1Ref = useRef<HTMLCanvasElement | null>(null);
  const sig2Ref = useRef<HTMLCanvasElement | null>(null);
  const sig3Ref = useRef<HTMLCanvasElement | null>(null);

  const draw = useDrawCanvas(drawRef);
  const sig1 = useSigPad(sig1Ref);
  const sig2 = useSigPad(sig2Ref);
  const sig3 = useSigPad(sig3Ref);

  /* init canvases */
  useEffect(() => {
    const cleanDraw = draw.init();
    const cleanS1   = sig1.init();
    const cleanS2   = sig2.init();
    const cleanS3   = sig3.init();
    return () => { cleanDraw?.(); cleanS1?.(); cleanS2?.(); cleanS3?.(); };
  }, [draw, sig1, sig2, sig3]);

  /* sync tool/color/width to refs */
  useEffect(() => { draw.toolRef.current  = activeTool; }, [activeTool, draw]);
  useEffect(() => { draw.colorRef.current = drawColor;  }, [drawColor, draw]);
  useEffect(() => { draw.widthRef.current = strokeW;    }, [strokeW, draw]);

  /* init inspection number from localStorage */
  useEffect(() => {
    const n = localStorage.getItem("insp_counter");
    if (n) setForm(f => ({ ...f, inspNum: String(+n).padStart(4, "0") }));
  }, []);

  /* auto total postes */
  const totalPostes = ["pEsquinero","pLiniero","pTope","p3way","pCiego","p3x3"]
    .reduce((s, k) => s + (+form[k as keyof FormData] || 0), 0);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const setChk = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.checked }));

  /* ── save ── */
  const saveData = () => {
    const data: Record<string, unknown> = { ...form };
    if (drawRef.current) data.drawCanvas  = drawRef.current.toDataURL();
    if (sig1Ref.current) data.sigCliente  = sig1Ref.current.toDataURL();
    if (sig2Ref.current) data.sigInspector = sig2Ref.current.toDataURL();
    if (sig3Ref.current) data.sigVendedor = sig3Ref.current.toDataURL();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inspeccion-${form.inspNum}.json`;
    a.click();
    URL.revokeObjectURL(a.href);

    const next = (+form.inspNum || 0) + 1;
    localStorage.setItem("insp_counter", String(next));
  };

  /* ── load ── */
  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setForm(f => ({ ...f, ...data }));
        (["drawCanvas","sigCliente","sigInspector","sigVendedor"] as const).forEach((key, i) => {
          if (!data[key]) return;
          const canvas = [drawRef, sig1Ref, sig2Ref, sig3Ref][i].current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d")!;
          const img = new window.Image();
          img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
          img.src = data[key];
        });
      } catch { alert("Archivo JSON inválido."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ── shared class strings ── */
  const navLinkClass = "flex items-center h-full px-3 py-1 text-[13px] font-semibold text-gray-600 hover:text-green-700 transition-colors whitespace-nowrap";
  const inputClass = "flex-1 border-0 border-b border-gray-400 text-[11px] outline-none bg-transparent px-1 py-0.5 focus:border-green-600";
  const qtyClass   = "w-10 border-0 border-b border-gray-300 text-[10px] text-center outline-none bg-transparent py-0.5 focus:border-green-600";
  const toolBtn    = (t: Tool) =>
    `flex items-center gap-1 px-2 py-1 text-[11px] rounded border transition-all cursor-pointer ${
      activeTool === t ? "bg-green-700 text-white border-green-700" : "bg-white border-gray-300 hover:border-green-500 hover:text-green-700"
    }`;

  return (
    <div className="min-h-screen bg-gray-100 pb-8">

      {/* ── PAGE ACTIONS ─────────────────────────────────────────────── */}
      <div className="no-print sticky top-0 z-20 bg-slate-800 text-white flex items-center gap-2 flex-wrap px-4 py-2 text-xs">
        <span className="font-bold text-teal-300 mr-2">Control de Inspecciones</span>
        <button onClick={() => window.print()}
          className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-xs font-semibold transition-colors">
          🖨 Imprimir / PDF
        </button>
        <button onClick={saveData}
          className="bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded text-xs font-semibold transition-colors">
          💾 Guardar JSON
        </button>
        <label className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors">
          📂 Cargar JSON
          <input type="file" accept=".json" className="hidden" onChange={loadFile} />
        </label>
        <button onClick={() => { if (confirm("¿Nueva inspección?")) { setForm({...EMPTY}); draw.clear(); sig1.clear(); sig2.clear(); sig3.clear(); }}}
          className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-xs font-semibold transition-colors">
          ➕ Nueva
        </button>
      </div>

      {/* ══ FORM PAGE ═══════════════════════════════════════════════════ */}
      <div className="mx-auto bg-white shadow-lg mt-4 p-4 print:mt-0 print:shadow-none" style={{ width: "min(1020px, 100%)" }}>

        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg width="44" height="44" viewBox="0 0 60 60">
              <polygon points="30,5 55,52 5,52" fill="none" stroke="#1a6b2e" strokeWidth="3"/>
              <polygon points="30,18 44,42 16,42" fill="#1a6b2e"/>
            </svg>
            <div className="leading-tight">
              <div className="text-sm font-black text-green-800">INTEMPERIE</div>
              <div className="text-[10px] text-gray-500">ESPECIALISTAS EN CERCAS</div>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-widest uppercase">Control de Inspecciones</h1>
          </div>
          <div className="text-right">
            <div className="text-xs">Nº de inspección:&nbsp;
              <input value={form.inspNum} onChange={set("inspNum")}
                className="w-16 text-center font-black text-red-600 text-lg border-0 border-b-2 border-red-500 outline-none bg-transparent"
                maxLength={6}
              />
            </div>
            <div className="text-base font-black text-blue-900 border-2 border-blue-900 px-2 py-0.5 inline-block mt-1">GRUPOVAZ</div>
          </div>
        </div>

        {/* CLIENT INFO */}
        <div className="border-b border-gray-400 pb-1 mb-2 space-y-1">
          {[
            [["NOMBRE DEL CLIENTE:", "clientName", "text", 2], ["Fecha:", "fecha", "date", 1]],
            [["Dirección:", "direccion", "text", 2], ["Pto de referencia:", "referencia", "text", 2]],
            [["Teléfono:", "telefono", "tel", 1], ["Correo:", "correo", "email", 2]],
          ].map((row, ri) => (
            <div key={ri} className="flex gap-4">
              {row.map(([label, key, type, flex]) => (
                <div key={key as string} className="flex items-baseline gap-1" style={{ flex: flex as number }}>
                  <label className="text-[10.5px] font-bold whitespace-nowrap">{label as string}</label>
                  <input type={type as string} value={form[key as keyof FormData] as string}
                    onChange={set(key as keyof FormData)}
                    className={inputClass} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* DRAWING AREA */}
        <div className="mb-2">
          <div className="no-print flex flex-wrap items-center gap-1.5 bg-gray-50 border border-gray-200 border-b-0 px-2 py-1.5">
            <span className="text-[10px] text-gray-500 mr-1">Herramienta:</span>
            {(["pencil","line","rect","text","eraser"] as Tool[]).map((t) => (
              <button key={t} onClick={() => setActiveTool(t)} className={toolBtn(t)}>
                {{ pencil: "✏️ Lápiz", line: "📏 Línea", rect: "⬜ Rect", text: "🔤 Texto", eraser: "🧹 Borrador" }[t]}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <label className="text-[10px] text-gray-500">Color:</label>
            <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)}
              className="w-7 h-6 rounded border border-gray-300 cursor-pointer p-0.5" />
            <label className="text-[10px] text-gray-500">Grosor:</label>
            <input type="range" min={1} max={12} value={strokeW} onChange={e => setStrokeW(+e.target.value)}
              className="w-16" />
            <span className="text-[10px] w-4">{strokeW}</span>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button onClick={draw.undo}       className="text-[11px] bg-white border border-gray-300 px-2 py-0.5 rounded hover:border-green-500 cursor-pointer">↩ Deshacer</button>
            <button onClick={draw.redo}       className="text-[11px] bg-white border border-gray-300 px-2 py-0.5 rounded hover:border-green-500 cursor-pointer">↪ Rehacer</button>
            <button onClick={() => { draw.toggleGrid(); setGridOn(g => !g); }}
              className={`text-[11px] px-2 py-0.5 rounded border cursor-pointer ${gridOn ? "bg-green-700 text-white border-green-700" : "bg-white border-gray-300"}`}>
              ⊞ Grilla
            </button>
            <button onClick={draw.clear}      className="text-[11px] bg-white border border-red-300 text-red-600 px-2 py-0.5 rounded hover:bg-red-50 cursor-pointer">🗑 Limpiar</button>
          </div>
          <canvas ref={drawRef} width={988} height={300}
            className="block border-2 border-blue-800 bg-white touch-none w-full"
            style={{ cursor: activeTool === "eraser" ? "cell" : activeTool === "text" ? "text" : "crosshair" }}
          />
        </div>

        {/* SPECS TABLE */}
        <table className="w-full border-collapse text-[9.5px]">
          <colgroup>
            <col style={{width:"94px"}} /><col style={{width:"34px"}} />
            <col style={{width:"116px"}} /><col style={{width:"34px"}} />
            <col style={{width:"140px"}} /><col style={{width:"34px"}} />
            <col style={{width:"140px"}} /><col style={{width:"34px"}} />
            <col /><col style={{width:"30px"}} /><col style={{width:"30px"}} />
          </colgroup>
          <thead>
            <tr className="text-white text-center font-bold text-[9.5px]">
              <th colSpan={2} className="border border-gray-700 bg-green-800 py-1">1) ESPECIFICACIONES</th>
              <th colSpan={2} className="border border-gray-700 bg-blue-900 py-1">2) POSTES ADICIONALES</th>
              <th colSpan={2} className="border border-gray-700 bg-blue-900 py-1">3) ADICIONALES</th>
              <th colSpan={2} className="border border-gray-700 bg-red-800 py-1">3) ADICIONALES</th>
              <th className="border border-gray-700 bg-green-800 py-1">4) ACCESORIOS</th>
              <th className="border border-gray-700 bg-green-800 py-1">PRTA</th>
              <th className="border border-gray-700 bg-green-800 py-1">PRTON</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                s1l:"TOTAL PACKS", s1k:"totalPacks" as keyof FormData, s1type:"number",
                p2l:"☑ P. ESQUINERO", p2k:"pEsquinero",
                a3l:"CANALETA DE ACOPLE", a3k:"canalAcople",
                a4l:"BASES ALUMINIO 4x4", a4k:"base4x4",
                ac:"ESTÁNDAR S/ MODELO", acp:"accEst_p", act:"accEst_t",
              },
              {
                s1l:"MODELO", s1k:"modelo" as keyof FormData, s1type:"text",
                p2l:"/ P. LINIERO", p2k:"pLiniero",
                a3l:"CANALETA DE LATTICCE", a3k:"canalLatticce",
                a4l:"BASES ALUMINIO 5x5", a4k:"base5x5",
                ac:"PASADOR DE PISO", acp:"accPas_p", act:"accPas_t",
              },
              {
                s1l:"TOTAL ML", s1k:"totalML" as keyof FormData, s1type:"number",
                p2l:"■ P. TOPE", p2k:"pTope",
                a3l:"RIEL TAPA LUZ 7/8 X1.5\"", a3k:"rielTapa",
                a4l:"ALUMINIO ADR", a4k:"alumADR",
                ac:"TIRADOR SENCILLO", acp:"accTir_p", act:"accTir_t",
              },
              {
                s1l:"ARENA (sacos)", s1k:"sacoArena" as keyof FormData, s1type:"number",
                p2l:"3 P. 3WAY", p2k:"p3way",
                a3l:"SOPORTE DE PARED", a3k:"soportePared",
                a4l:"KIT ANCLAJE (CABILLA)", a4k:"kitAnclaje",
                ac:"CERRADURAS 2 CARAS", acp:"accCerr2_p", act:"accCerr2_t",
              },
              {
                s1l:"CEMENTO (sacos)", s1k:"sacoCemento" as keyof FormData, s1type:"number",
                p2l:"P. CIEGO", p2k:"pCiego",
                a3l:"PIE DE POSTE", a3k:"piePoste",
                a4l:"TAPA GÓTICA", a4k:"tapaGotica",
                ac:"CERRADURAS MAGNÉTICAS", acp:"accCerrMag_p", act:"accCerrMag_t",
              },
              {
                s1l:"PIEDRA (sacos)", s1k:"sacoPiedra" as keyof FormData, s1type:"number",
                p2l:"P. 3X3", p2k:"p3x3",
                a3l:"TAPA DECORATIVA", a3k:"tapaDecorativa",
                a4l:"TAPA INGLESA", a4k:"tapaInglesa",
                ac:"CERRADURAS SENC. GRANDE", acp:"accCerrSG_p", act:"accCerrSG_t",
              },
              {
                s1l:"", s1k:null, s1type:"",
                p2l:"TOTAL POSTES", p2k:null,
                a3l:"OREJA DE PERRO", a3k:"orejaPerro",
                a4l:"TAPA SOLAR", a4k:"tapaSolar",
                ac:"CERRADURAS SENC. PEQUEÑA", acp:"accCerrSP_p", act:"accCerrSP_t",
              },
            ].map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="border border-gray-300 px-1 py-0.5 font-semibold text-[9.5px] bg-indigo-50">{row.s1l}</td>
                <td className="border border-gray-300 p-0.5">
                  {row.s1k && <input type={row.s1type} value={form[row.s1k] as string} onChange={set(row.s1k)} className={qtyClass} />}
                </td>
                <td className="border border-gray-300 px-1 py-0.5 text-[9.5px]">{row.p2l}</td>
                <td className="border border-gray-300 p-0.5">
                  {row.p2k
                    ? <input type="number" min={0} value={form[row.p2k as keyof FormData] as string} onChange={set(row.p2k as keyof FormData)} className={qtyClass} />
                    : <input type="number" min={0} value={totalPostes || ""} readOnly className={`${qtyClass} bg-gray-100`} />
                  }
                </td>
                <td className="border border-gray-300 px-1 py-0.5 text-[9.5px]">{row.a3l}</td>
                <td className="border border-gray-300 p-0.5">
                  {row.a3k && <input type="number" min={0} value={form[row.a3k as keyof FormData] as string} onChange={set(row.a3k as keyof FormData)} className={qtyClass} />}
                </td>
                <td className="border border-gray-300 px-1 py-0.5 text-[9.5px]">{row.a4l}</td>
                <td className="border border-gray-300 p-0.5">
                  {row.a4k && <input type="number" min={0} value={form[row.a4k as keyof FormData] as string} onChange={set(row.a4k as keyof FormData)} className={qtyClass} />}
                </td>
                <td className="border border-gray-300 px-1 py-0.5 text-[9.5px]">{row.ac}</td>
                <td className="border border-gray-300 p-0.5">
                  <input type="number" min={0} value={form[row.acp as keyof FormData] as string} onChange={set(row.acp as keyof FormData)} className={qtyClass} />
                </td>
                <td className="border border-gray-300 p-0.5">
                  <input type="number" min={0} value={form[row.act as keyof FormData] as string} onChange={set(row.act as keyof FormData)} className={qtyClass} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* BOTTOM: CONSULTAS + OBSERVACIONES */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {/* CONSULTAS FRECUENTES */}
          <div className="border border-gray-400">
            <div className="bg-blue-900 text-white text-center text-[9.5px] font-bold py-1">CONSULTAS FRECUENTES</div>
            <div className="p-2 space-y-1.5 text-[10px]">
              <div>
                <strong>CON INSTALACIÓN:</strong>&nbsp;
                {["si","no"].map(v => (
                  <label key={v} className="inline-flex items-center gap-1 mr-3 cursor-pointer">
                    <input type="radio" name="instalacion" value={v}
                      checked={form.instalacion === v}
                      onChange={() => setForm(f => ({...f, instalacion: v}))} />
                    {v.toUpperCase()}
                  </label>
                ))}
                <span className="text-gray-500 text-[9.5px]">De ser afirmativo responder:</span>
              </div>

              {form.instalacion === "si" && (
                <div className="pl-3 space-y-1.5 border-l-2 border-green-300">
                  <div>
                    <strong>PASE DE ACCESO:</strong>&nbsp;
                    {["si","no"].map(v => (
                      <label key={v} className="inline-flex items-center gap-1 mr-3 cursor-pointer">
                        <input type="radio" name="paseAcceso" value={v}
                          checked={form.paseAcceso === v}
                          onChange={() => setForm(f => ({...f, paseAcceso: v}))} />
                        {v.toUpperCase()}
                      </label>
                    ))}
                  </div>
                  <div>
                    <strong>TIPO DE TERRENO:</strong>&nbsp;
                    {[["optimo","ÓPTIMO"],["regular","REGULAR"],["desfavorable","DESFAVORABLE"]].map(([v,l]) => (
                      <label key={v} className="inline-flex items-center gap-1 mr-3 cursor-pointer">
                        <input type="radio" name="terreno" value={v}
                          checked={form.terreno === v}
                          onChange={() => setForm(f => ({...f, terreno: v}))} />
                        {l}
                      </label>
                    ))}
                  </div>
                  <div>
                    <strong>¿CLIENTE TIENE AGREGADOS?</strong>&nbsp;
                    {([["aggArena","ARENA"],["aggPiedra","PIEDRA"],["aggCemento","CEMENTO"],["aggNinguno","NINGUNO"]] as const).map(([k,l]) => (
                      <label key={k} className="inline-flex items-center gap-1 mr-2 cursor-pointer">
                        <input type="checkbox" checked={form[k] as boolean}
                          onChange={e => {
                            if (k === "aggNinguno" && e.target.checked)
                              setForm(f => ({...f, aggArena:false, aggPiedra:false, aggCemento:false, aggNinguno:true}));
                            else if (k !== "aggNinguno" && e.target.checked)
                              setForm(f => ({...f, [k]: true, aggNinguno: false}));
                            else setChk(k)(e);
                          }} />
                        {l}
                      </label>
                    ))}
                  </div>
                  <div>
                    <strong>LUGAR CUENTA CON:</strong>&nbsp;
                    {([["svcAgua","TOMA DE AGUA"],["svcElec","ENERGÍA ELÉCTRICA"],["svcNinguno","NINGUNO"]] as const).map(([k,l]) => (
                      <label key={k} className="inline-flex items-center gap-1 mr-2 cursor-pointer">
                        <input type="checkbox" checked={form[k] as boolean}
                          onChange={e => {
                            if (k === "svcNinguno" && e.target.checked)
                              setForm(f => ({...f, svcAgua:false, svcElec:false, svcNinguno:true}));
                            else if (k !== "svcNinguno" && e.target.checked)
                              setForm(f => ({...f, [k]: true, svcNinguno: false}));
                            else setChk(k)(e);
                          }} />
                        {l}
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>ENTRADA:</strong>
                    <input type="time" value={form.horaEntrada} onChange={set("horaEntrada")}
                      className="border-0 border-b border-gray-400 text-[10px] outline-none bg-transparent" />
                    <strong>SALIDA:</strong>
                    <input type="time" value={form.horaSalida} onChange={set("horaSalida")}
                      className="border-0 border-b border-gray-400 text-[10px] outline-none bg-transparent" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div className="border border-gray-400">
            <div className="bg-green-800 text-white text-center text-[9.5px] font-bold py-1">OBSERVACIONES ADICIONALES</div>
            <textarea value={form.observaciones} onChange={set("observaciones")}
              className="w-full h-full min-h-[90px] p-2 text-[10.5px] outline-none resize-none border-0 font-sans"
              placeholder="Observaciones sobre la inspección..." />
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {([
            { title: "FIRMA DEL CLIENTE CONFORME CON LA INSPECCIÓN", ref: sig1Ref, clear: sig1.clear, nameKey: "nombreCliente" as keyof FormData, label: "Nombre del cliente" },
            { title: "NOMBRE DEL INSPECTOR", ref: sig2Ref, clear: sig2.clear, nameKey: "nombreInspector" as keyof FormData, label: "Nombre del inspector" },
            { title: "NOMBRE DEL VENDEDOR QUE COTIZA", ref: sig3Ref, clear: sig3.clear, nameKey: "nombreVendedor" as keyof FormData, label: "Nombre del vendedor" },
          ]).map(({ title, ref, clear: sigClear, nameKey, label }) => (
            <div key={nameKey} className="border border-gray-400">
              <div className="bg-red-700 text-white text-center text-[8.5px] font-bold py-1 uppercase">{title}</div>
              <div className="p-2 flex flex-col items-center gap-1.5">
                <canvas ref={ref} width={280} height={70}
                  className="border border-dashed border-gray-300 rounded bg-gray-50 block touch-none w-full"
                  style={{ cursor: "crosshair" }}
                />
                <button onClick={sigClear}
                  className="no-print text-[10px] text-red-600 bg-transparent border-none cursor-pointer underline self-end">
                  ✕ Limpiar
                </button>
                <input value={form[nameKey] as string} onChange={set(nameKey)}
                  className="w-full border-0 border-b border-gray-400 text-[10.5px] text-center outline-none bg-transparent pb-0.5"
                  placeholder={label} />
              </div>
            </div>
          ))}
        </div>

      </div>{/* /page */}

      {/* PRINT BUTTON at bottom */}
      <div className="no-print flex justify-center gap-3 mt-4">
        <button onClick={() => window.print()}
          className="bg-green-700 hover:bg-green-800 text-white px-7 py-2.5 rounded-lg font-bold text-sm transition-colors">
          🖨 Imprimir / Guardar como PDF
        </button>
        <button onClick={saveData}
          className="bg-blue-800 hover:bg-blue-900 text-white px-7 py-2.5 rounded-lg font-bold text-sm transition-colors">
          💾 Guardar JSON
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          canvas { cursor: default !important; }
          input, textarea { border-color: transparent !important; }
        }
      `}</style>
    </div>
  );
}
