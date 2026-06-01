"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { ChevronDown, ChevronRight, Minus, Pencil, RectangleHorizontal, Eraser, Type, Undo2, Redo2, Grid3x3, Trash2 } from "lucide-react";

type Tool = "pencil" | "line" | "rect" | "text" | "eraser";

/* ══ DRAWING ENGINE ═════════════════════════════════════════ */
function useCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
  const tool     = useRef<Tool>("pencil");
  const color    = useRef("#1a1a2e");
  const width    = useRef(2);
  const drawing  = useRef(false);
  const last     = useRef({ x: 0, y: 0 });
  const start    = useRef({ x: 0, y: 0 });
  const snap     = useRef<ImageData | null>(null);
  const hist     = useRef<string[]>([]);
  const idx      = useRef(-1);
  const grid     = useRef(true);

  const ctx = () => ref.current?.getContext("2d") ?? null;

  const drawGrid = useCallback(() => {
    const c = ref.current; if (!c || !grid.current) return;
    const g = ctx()!;
    g.save(); g.strokeStyle = "#d1fae5"; g.lineWidth = 0.5;
    for (let x = 0; x <= c.width;  x += 20) { g.beginPath(); g.moveTo(x,0); g.lineTo(x,c.height); g.stroke(); }
    for (let y = 0; y <= c.height; y += 20) { g.beginPath(); g.moveTo(0,y); g.lineTo(c.width,y);   g.stroke(); }
    g.restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const push = useCallback(() => {
    const c = ref.current; if (!c) return;
    hist.current = hist.current.slice(0, idx.current + 1);
    hist.current.push(c.toDataURL());
    if (hist.current.length > 50) hist.current.shift();
    idx.current = hist.current.length - 1;
  }, [ref]);

  const restore = useCallback((i: number) => {
    const c = ref.current; if (!c) return;
    const g = ctx()!;
    const img = new window.Image();
    img.onload = () => { g.clearRect(0,0,c.width,c.height); drawGrid(); g.drawImage(img,0,0); };
    img.src = hist.current[i];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, drawGrid]);

  const undo  = () => { if (idx.current > 0)                       { idx.current--; restore(idx.current); } };
  const redo  = () => { if (idx.current < hist.current.length - 1) { idx.current++; restore(idx.current); } };

  const clear = useCallback(() => {
    const c = ref.current; if (!c) return;
    ctx()!.clearRect(0, 0, c.width, c.height);
    drawGrid(); push();
  }, [ref, drawGrid, push]);

  const toggleGrid = useCallback(() => {
    grid.current = !grid.current;
    if (idx.current >= 0) restore(idx.current); else clear();
    return grid.current;
  }, [restore, clear]);

  const pos = (e: MouseEvent | TouchEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    const s = "touches" in e ? e.touches[0] : e;
    return { x: s.clientX - r.left, y: s.clientY - r.top };
  };

  const init = useCallback(() => {
    const c = ref.current; if (!c) return;
    const g = ctx()!;
    drawGrid(); push();

    const down = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const p = pos(e, c);
      drawing.current = true; last.current = p; start.current = p;
      snap.current = g.getImageData(0, 0, c.width, c.height);
      if (tool.current === "text") {
        drawing.current = false;
        const t = prompt("Texto:");
        if (t) {
          g.font = `${Math.max(12, width.current * 5)}px Arial`;
          g.fillStyle = color.current;
          g.fillText(t, p.x, p.y);
          push();
        }
      }
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return; e.preventDefault();
      const { x, y } = pos(e, c);
      if (tool.current === "pencil") {
        g.beginPath(); g.moveTo(last.current.x, last.current.y); g.lineTo(x, y);
        g.strokeStyle = color.current; g.lineWidth = width.current;
        g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
        last.current = { x, y };
      } else if (tool.current === "eraser") {
        g.beginPath(); g.arc(x, y, Math.max(8, width.current * 4), 0, Math.PI * 2);
        g.fillStyle = "#ffffff"; g.fill(); last.current = { x, y };
      } else if (tool.current === "line") {
        g.putImageData(snap.current!, 0, 0);
        g.beginPath(); g.moveTo(start.current.x, start.current.y); g.lineTo(x, y);
        g.strokeStyle = color.current; g.lineWidth = width.current; g.lineCap = "round"; g.stroke();
      } else if (tool.current === "rect") {
        g.putImageData(snap.current!, 0, 0);
        g.beginPath(); g.rect(start.current.x, start.current.y, x - start.current.x, y - start.current.y);
        g.strokeStyle = color.current; g.lineWidth = width.current; g.stroke();
      }
    };

    const up = () => { if (drawing.current) { drawing.current = false; push(); } };

    c.addEventListener("mousedown",  down);
    c.addEventListener("mousemove",  move);
    c.addEventListener("mouseup",    up);
    c.addEventListener("mouseleave", up);
    c.addEventListener("touchstart", down, { passive: false });
    c.addEventListener("touchmove",  move, { passive: false });
    c.addEventListener("touchend",   up);
    return () => {
      c.removeEventListener("mousedown",  down);
      c.removeEventListener("mousemove",  move);
      c.removeEventListener("mouseup",    up);
      c.removeEventListener("mouseleave", up);
      c.removeEventListener("touchstart", down);
      c.removeEventListener("touchmove",  move);
      c.removeEventListener("touchend",   up);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, drawGrid, push]);

  return { tool, color, width, grid, undo, redo, clear, toggleGrid, init };
}

/* ══ PAGE ═══════════════════════════════════════════════════ */
export default function InspeccionesPage() {
  const { user } = useAuthStore();
  const isAdmin  = user?.role === "ADMIN";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sig1Ref   = useRef<HTMLCanvasElement | null>(null);
  const sig2Ref   = useRef<HTMLCanvasElement | null>(null);
  const draw      = useCanvas(canvasRef);

  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [color,      setColor]      = useState("#1a1a2e");
  const [strokeW,    setStrokeW]    = useState(2);
  const [gridOn,     setGridOn]     = useState(true);
  const [showForm,   setShowForm]   = useState(false);

  /* form state (auto-filled where possible) */
  const today = new Date().toISOString().split("T")[0];
  const [inspNum,     setInspNum]     = useState("0001");
  const [clientName,  setClientName]  = useState(user?.name  ?? "");
  const [telefono,    setTelefono]    = useState(user?.phone ?? "");
  const [correo,      setCorreo]      = useState(user?.email ?? "");
  const [fecha,       setFecha]       = useState(today);
  const [direccion,   setDireccion]   = useState("");
  const [referencia,  setReferencia]  = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [nombreInspector, setNombreInspector] = useState("");
  const [nombreVendedor,  setNombreVendedor]  = useState("");

  useEffect(() => {
    const n = localStorage.getItem("insp_counter");
    if (n) setInspNum(String(+n).padStart(4, "0"));
  }, []);

  useEffect(() => { if (user?.name)  setClientName(user.name);   }, [user?.name]);
  useEffect(() => { if (user?.email) setCorreo(user.email);      }, [user?.email]);

  /* init canvases */
  useEffect(() => {
    const cleanDraw = draw.init();
    return () => { cleanDraw?.(); };
  }, [draw]);

  /* init sig pads */
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
      const d = (e: MouseEvent | TouchEvent) => { e.preventDefault(); pen = true; const p = getP(e); lx=p.x; ly=p.y; g.beginPath(); g.arc(lx,ly,0.8,0,Math.PI*2); g.fillStyle="#111"; g.fill(); };
      const m = (e: MouseEvent | TouchEvent) => { if(!pen) return; e.preventDefault(); const {x,y}=getP(e); g.beginPath(); g.moveTo(lx,ly); g.lineTo(x,y); g.strokeStyle="#111"; g.lineWidth=1.5; g.lineCap="round"; g.stroke(); lx=x; ly=y; };
      const u = () => { pen=false; };
      c.addEventListener("mousedown",d); c.addEventListener("mousemove",m); c.addEventListener("mouseup",u); c.addEventListener("mouseleave",u);
      c.addEventListener("touchstart",d,{passive:false}); c.addEventListener("touchmove",m,{passive:false}); c.addEventListener("touchend",u);
      cleanups.push(() => { c.removeEventListener("mousedown",d); c.removeEventListener("mousemove",m); c.removeEventListener("mouseup",u); c.removeEventListener("mouseleave",u); c.removeEventListener("touchstart",d); c.removeEventListener("touchmove",m); c.removeEventListener("touchend",u); });
    });
    return () => cleanups.forEach(fn => fn());
  }, [showForm]);

  useEffect(() => { draw.tool.current  = activeTool; }, [activeTool, draw]);
  useEffect(() => { draw.color.current = color;       }, [color, draw]);
  useEffect(() => { draw.width.current = strokeW;     }, [strokeW, draw]);

  const TOOLS: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: "pencil",  label: "Lápiz",     icon: <Pencil className="h-3.5 w-3.5" /> },
    { id: "line",    label: "Línea",     icon: <Minus  className="h-3.5 w-3.5" /> },
    { id: "rect",    label: "Rectángulo",icon: <RectangleHorizontal className="h-3.5 w-3.5" /> },
    { id: "text",    label: "Texto",     icon: <Type   className="h-3.5 w-3.5" /> },
    { id: "eraser",  label: "Borrador",  icon: <Eraser className="h-3.5 w-3.5" /> },
  ];

  const btnBase = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border";
  const toolBtn = (t: Tool) => `${btnBase} ${activeTool === t
    ? "bg-green-700 text-white border-green-700 shadow-sm"
    : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"}`;

  const generatePDF = () => {
    const next = (+inspNum || 0) + 1;
    localStorage.setItem("insp_counter", String(next));
    setShowForm(true);
    setTimeout(() => window.print(), 300);
  };

  const inputCls = "w-full border-0 border-b border-gray-300 text-[10.5px] outline-none bg-transparent px-1 py-0.5 focus:border-green-600 font-sans";
  const qCls     = "w-10 border-0 border-b border-gray-200 text-[9.5px] text-center outline-none bg-transparent py-0.5 focus:border-green-600";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO / CANVAS SECTION ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-6">

          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold text-gray-900">Solicitar inspección</h1>
            <p className="text-sm text-gray-500 mt-1">
              Dibuja el contorno de tu propiedad para que nuestro equipo planifique tu instalación.
            </p>
          </div>

          {/* Tools */}
          <div className="flex flex-wrap items-center gap-2 mb-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => setActiveTool(t.id)} className={toolBtn(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Grosor</label>
              <input type="range" min={1} max={12} value={strokeW} onChange={e => setStrokeW(+e.target.value)} className="w-20" />
              <span className="text-xs text-gray-400 w-3">{strokeW}</span>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button onClick={draw.undo} className={`${btnBase} bg-white text-gray-600 border-gray-200 hover:border-gray-400`}>
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={draw.redo} className={`${btnBase} bg-white text-gray-600 border-gray-200 hover:border-gray-400`}>
              <Redo2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { const on = draw.toggleGrid(); setGridOn(on); }}
              className={`${btnBase} ${gridOn ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-gray-500 border-gray-200"}`}>
              <Grid3x3 className="h-3.5 w-3.5" /> Grilla
            </button>
            <button onClick={draw.clear}
              className={`${btnBase} bg-white text-red-500 border-red-200 hover:bg-red-50`}>
              <Trash2 className="h-3.5 w-3.5" /> Limpiar
            </button>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={1180}
            height={420}
            className="block w-full rounded-xl border-2 border-blue-200 bg-white touch-none shadow-sm"
            style={{ cursor: activeTool === "eraser" ? "cell" : activeTool === "text" ? "text" : "crosshair", maxHeight: "60vh" }}
          />

          <p className="text-xs text-gray-400 mt-2">
            💡 Marca los límites de tu propiedad, portones, accesos y zonas especiales.
          </p>
        </div>
      </div>

      {/* ── GENERATE BUTTON ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {isAdmin ? (
          <button onClick={generatePDF}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition-colors">
            📋 Generar informe de inspección (PDF)
          </button>
        ) : (
          <button onClick={() => alert("Tu solicitud fue enviada. Un inspector de Intemperie se contactará contigo pronto.")}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition-colors">
            ✅ Enviar solicitud de inspección
          </button>
        )}

        {isAdmin && (
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 underline">
            {showForm ? "Ocultar formulario" : "Ver formulario completo"}
            <ChevronDown className={`h-4 w-4 transition-transform ${showForm ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* ══ FULL INSPECTION FORM (admin only, collapsible + printable) ══ */}
      {(showForm || false) && isAdmin && (
        <div id="printForm" className="mx-auto bg-white shadow-lg mb-8 px-5 py-4 print:shadow-none print:m-0"
          style={{ width: "min(1020px, 100%)" }}>

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
            <h2 className="text-xl font-black tracking-widest uppercase">Control de Inspecciones</h2>
            <div className="text-right">
              <div className="text-xs">Nº inspección:&nbsp;
                <input value={inspNum} onChange={e => setInspNum(e.target.value)}
                  className="w-14 text-center font-black text-red-600 text-lg border-0 border-b-2 border-red-500 outline-none bg-transparent" maxLength={6}/>
              </div>
              <div className="text-base font-black text-blue-900 border-2 border-blue-900 px-2 inline-block mt-0.5">GRUPOVAZ</div>
            </div>
          </div>

          {/* CLIENT INFO */}
          <div className="border-b border-gray-400 pb-1 mb-2 space-y-1 text-[10.5px]">
            {[
              [["NOMBRE DEL CLIENTE:", clientName, setClientName, "text"], ["Fecha:", fecha, setFecha, "date"]],
              [["Dirección:", direccion, setDireccion, "text"], ["Pto de referencia:", referencia, setReferencia, "text"]],
              [["Teléfono:", telefono, setTelefono, "tel"], ["Correo:", correo, setCorreo, "email"]],
            ].map((row, ri) => (
              <div key={ri} className="flex gap-4">
                {row.map(([lbl, val, setter, type]) => (
                  <div key={lbl as string} className="flex items-baseline gap-1 flex-1">
                    <label className="font-bold whitespace-nowrap text-[10px]">{lbl as string}</label>
                    <input type={type as string} value={val as string} onChange={e => (setter as (v:string)=>void)(e.target.value)} className={inputCls} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* CANVAS SNAPSHOT */}
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={canvasRef.current?.toDataURL() ?? ""}
              alt="Plano de inspección"
              className="w-full border-2 border-blue-800"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* SPECS TABLE */}
          <SpecsTable qCls={qCls} />

          {/* BOTTOM */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <ConsultasBox />
            <div className="border border-gray-400">
              <div className="bg-green-800 text-white text-center text-[9.5px] font-bold py-1">OBSERVACIONES ADICIONALES</div>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                className="w-full min-h-[90px] p-2 text-[10.5px] outline-none resize-none border-0 font-sans"
                placeholder="Observaciones sobre la inspección..." />
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {([
              { title: "FIRMA DEL CLIENTE", ref: sig1Ref, nameVal: clientName, setName: setClientName, ph: "Nombre del cliente" },
              { title: "NOMBRE DEL INSPECTOR", ref: sig2Ref, nameVal: nombreInspector, setName: setNombreInspector, ph: "Inspector" },
              { title: "VENDEDOR QUE COTIZA", ref: null, nameVal: nombreVendedor, setName: setNombreVendedor, ph: "Vendedor" },
            ]).map(({ title, ref, nameVal, setName, ph }) => (
              <div key={title} className="border border-gray-400">
                <div className="bg-red-700 text-white text-center text-[8.5px] font-bold py-1 uppercase">{title}</div>
                <div className="p-2 flex flex-col items-center gap-1.5">
                  {ref ? (
                    <canvas ref={ref} width={280} height={65}
                      className="border border-dashed border-gray-300 rounded bg-gray-50 block touch-none w-full" style={{ cursor: "crosshair" }} />
                  ) : (
                    <div className="w-full h-[65px] border border-dashed border-gray-200 rounded bg-gray-50" />
                  )}
                  {ref && (
                    <button onClick={() => ref.current?.getContext("2d")?.clearRect(0,0,280,65)}
                      className="print:hidden text-[10px] text-red-500 bg-transparent border-none cursor-pointer underline self-end">
                      ✕ Limpiar
                    </button>
                  )}
                  <input value={nameVal} onChange={e => setName(e.target.value)}
                    className="w-full border-0 border-b border-gray-300 text-[10.5px] text-center outline-none bg-transparent pb-0.5"
                    placeholder={ph} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body > *:not(#printForm) { display: none !important; }
          #printForm { display: block !important; margin: 0; padding: 8px; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ══ SUB-COMPONENTS (specs + consultas, admin-form only) ════ */
function SpecsTable({ qCls }: { qCls: string }) {
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

  return (
    <table className="w-full border-collapse text-[9px]">
      <thead>
        <tr className="text-white text-center font-bold text-[9px]">
          <th colSpan={2} className="border border-gray-600 bg-green-800 py-0.5">1) ESPECIFICACIONES</th>
          <th colSpan={2} className="border border-gray-600 bg-blue-900 py-0.5">2) POSTES ADICIONALES</th>
          <th colSpan={2} className="border border-gray-600 bg-blue-900 py-0.5">3) ADICIONALES</th>
          <th colSpan={2} className="border border-gray-600 bg-red-800 py-0.5">3) ADICIONALES</th>
          <th className="border border-gray-600 bg-green-800 py-0.5">4) ACCESORIOS</th>
          <th className="border border-gray-600 bg-green-800 py-0.5">PRTA</th>
          <th className="border border-gray-600 bg-green-800 py-0.5">PRTON</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i) => (
          <tr key={i} className={i%2===0?"bg-white":"bg-slate-50"}>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px] font-semibold bg-indigo-50 whitespace-nowrap">{r.s1}</td>
            <td className="border border-gray-200 p-0.5">{r.s1k && <input type={r.s1t} value={v[r.s1k]??""} onChange={s(r.s1k)} className={qCls} />}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px]">{r.p2}</td>
            <td className="border border-gray-200 p-0.5">{r.p2k ? <input type="number" min={0} value={v[r.p2k]??""} onChange={s(r.p2k)} className={qCls} /> : <input readOnly value={totalPostes||""} className={`${qCls} bg-gray-100`} />}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px]">{r.a3}</td>
            <td className="border border-gray-200 p-0.5">{r.a3k && <input type="number" min={0} value={v[r.a3k]??""} onChange={s(r.a3k)} className={qCls} />}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px]">{r.a4}</td>
            <td className="border border-gray-200 p-0.5">{r.a4k && <input type="number" min={0} value={v[r.a4k]??""} onChange={s(r.a4k)} className={qCls} />}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px]">{r.ac}</td>
            <td className="border border-gray-200 p-0.5"><input type="number" min={0} value={v[r.ap]??""} onChange={s(r.ap)} className={qCls} /></td>
            <td className="border border-gray-200 p-0.5"><input type="number" min={0} value={v[r.at]??""} onChange={s(r.at)} className={qCls} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConsultasBox() {
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

  return (
    <div className="border border-gray-400">
      <div className="bg-blue-900 text-white text-center text-[9.5px] font-bold py-1">CONSULTAS FRECUENTES</div>
      <div className="p-2 space-y-1.5 text-[9.5px]">
        <div>
          <strong>CON INSTALACIÓN:</strong>&nbsp;
          {["si","no"].map(v => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="radio" name="inst" value={v} checked={inst===v} onChange={() => setInst(v)} />{v.toUpperCase()}</label>)}
        </div>
        {inst==="si" && (
          <div className="pl-3 border-l-2 border-green-300 space-y-1.5">
            <div><strong>PASE DE ACCESO:</strong>&nbsp;{["si","no"].map(v => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="radio" name="pase" value={v} checked={pase===v} onChange={() => setPase(v)} />{v.toUpperCase()}</label>)}</div>
            <div><strong>TIPO DE TERRENO:</strong>&nbsp;{[["optimo","ÓPTIMO"],["regular","REGULAR"],["desfavorable","DESFAVORABLE"]].map(([v,l]) => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="radio" name="ter" value={v} checked={terreno===v} onChange={() => setTerreno(v)} />{l}</label>)}</div>
            <div><strong>AGREGADOS:</strong>&nbsp;{[["arena","ARENA"],["piedra","PIEDRA"],["cemento","CEMENTO"],["ninguno","NINGUNO"]].map(([v,l]) => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="checkbox" checked={agg.includes(v)} onChange={() => toggleArr(agg, v, setAgg, "ninguno")} />{l}</label>)}</div>
            <div><strong>LUGAR CUENTA CON:</strong>&nbsp;{[["agua","AGUA"],["electrica","ELÉCTRICA"],["ninguno","NINGUNO"]].map(([v,l]) => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="checkbox" checked={svc.includes(v)} onChange={() => toggleArr(svc, v, setSvc, "ninguno")} />{l}</label>)}</div>
            <div className="flex items-center gap-2"><strong>ENTRADA:</strong><input type="time" value={entrada} onChange={e=>setEntrada(e.target.value)} className="border-0 border-b border-gray-300 text-[9.5px] outline-none bg-transparent" /><strong>SALIDA:</strong><input type="time" value={salida} onChange={e=>setSalida(e.target.value)} className="border-0 border-b border-gray-300 text-[9.5px] outline-none bg-transparent" /></div>
          </div>
        )}
      </div>
    </div>
  );
}
