"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Partido } from "@/lib/partidos-data";

interface Pronostico {
  golesLocal: number;
  golesVisitante: number;
}

interface Resultado {
  golesLocal: number | null;
  golesVisitante: number | null;
  cerrado: boolean;
  terminado: boolean;
}

interface Props {
  partido: Partido & Resultado;
  pronostico?: Pronostico;
}

const LABEL_MAP: Record<string, { text: string; color: string; bg: string }> = {
  exact:  { text: "Exacto · 5 pts",     color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  diff:   { text: "Diferencia · 3 pts", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  winner: { text: "Ganador · 2 pts",    color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  miss:   { text: "Fallo · 0 pts",      color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
};

export default function PartidoCard({ partido, pronostico: initialPronostico }: Props) {
  const [localScore, setLocalScore] = useState<string>(
    initialPronostico !== undefined ? String(initialPronostico.golesLocal) : ""
  );
  const [visitScore, setVisitScore] = useState<string>(
    initialPronostico !== undefined ? String(initialPronostico.golesVisitante) : ""
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(initialPronostico ? "Guardado" : null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cerrado = partido.cerrado;

  let resultLabel: string | null = null;
  if (partido.terminado && partido.golesLocal !== null && partido.golesVisitante !== null && initialPronostico !== undefined) {
    const { calcularPuntos } = require("@/lib/scoring");
    const { label } = calcularPuntos(
      initialPronostico.golesLocal, initialPronostico.golesVisitante,
      partido.golesLocal, partido.golesVisitante
    );
    resultLabel = label;
  }

  const save = useCallback(async (gl: number, gv: number) => {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/pronosticos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partidoId: partido.id, golesLocal: gl, golesVisitante: gv }),
      });
      if (res.ok) { setSavedAt("Guardado ✓"); setTimeout(() => setSavedAt(null), 3000); }
      else { const d = await res.json(); setError(d.error || "Error al guardar"); }
    } catch { setError("Error de conexión"); } finally { setSaving(false); }
  }, [partido.id]);

  useEffect(() => {
    if (cerrado) return;
    const gl = parseInt(localScore, 10), gv = parseInt(visitScore, 10);
    if (isNaN(gl) || isNaN(gv) || gl < 0 || gv < 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(gl, gv), 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [localScore, visitScore, cerrado, save]);

  const fechaDisplay = new Date(partido.fechaUTC).toLocaleString("es-EC", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Guayaquil",
  });

  const lbl = resultLabel ? LABEL_MAP[resultLabel] : null;

  return (
    <div className={`relative group rounded-2xl border transition-all duration-300 overflow-hidden ${
      cerrado
        ? "bg-white/[0.02] border-white/[0.06]"
        : "bg-white/[0.04] border-white/[0.08] hover:border-orange-500/30 hover:bg-white/[0.06]"
    }`}>
      {!cerrado && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <span className="bg-white/5 text-slate-500 px-2 py-0.5 rounded-full">Grupo {partido.grupo}</span>
          <span className="text-slate-600">{fechaDisplay}</span>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <span className="text-3xl drop-shadow-sm">{partido.flagLocal}</span>
            <span className="text-xs font-semibold text-slate-300 text-center leading-tight truncate w-full text-center">
              {partido.equipoLocal}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 px-2">
            {cerrado ? (
              <div className="flex items-center gap-2">
                {partido.terminado ? (
                  <>
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-400">
                      {partido.golesLocal}
                    </div>
                    <span className="text-slate-600 font-bold text-lg">–</span>
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-400">
                      {partido.golesVisitante}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-slate-400">
                      {localScore || "–"}
                    </div>
                    <span className="text-slate-600 font-bold">–</span>
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-slate-400">
                      {visitScore || "–"}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number" min={0} max={30} value={localScore}
                  onChange={(e) => { setLocalScore(e.target.value); setSavedAt(null); }}
                  placeholder="0"
                  className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-bold text-white focus:outline-none focus:border-orange-500/60 focus:bg-white/8 transition-all"
                />
                <span className="text-slate-600 font-bold text-lg">–</span>
                <input
                  type="number" min={0} max={30} value={visitScore}
                  onChange={(e) => { setVisitScore(e.target.value); setSavedAt(null); }}
                  placeholder="0"
                  className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-bold text-white focus:outline-none focus:border-orange-500/60 focus:bg-white/8 transition-all"
                />
              </div>
            )}
            <span className="text-xs text-slate-700 font-medium tracking-widest">PICK</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <span className="text-3xl drop-shadow-sm">{partido.flagVisitante}</span>
            <span className="text-xs font-semibold text-slate-300 text-center leading-tight truncate w-full text-center">
              {partido.equipoVisitante}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
          <span className="text-slate-700 truncate">{partido.estadio}</span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {lbl && (
              <span className={`px-2 py-0.5 rounded-full border font-medium ${lbl.color} ${lbl.bg}`}>
                {lbl.text}
              </span>
            )}
            {cerrado && !partido.terminado && (
              <span className="text-slate-600 italic">En curso</span>
            )}
            {!cerrado && (
              <>
                {error && <span className="text-red-400">{error}</span>}
                {saving && <span className="text-slate-600 italic">Guardando…</span>}
                {savedAt && !error && !saving && <span className="text-emerald-500">{savedAt}</span>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
