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

function ScoreLabel({ label }: { label: string }) {
  const map: Record<string, { text: string; className: string }> = {
    exact: { text: "Exacto ✦ 5 pts", className: "text-green-400 bg-green-400/10" },
    diff: { text: "Diferencia ✦ 3 pts", className: "text-blue-400 bg-blue-400/10" },
    winner: { text: "Ganador ✦ 2 pts", className: "text-yellow-400 bg-yellow-400/10" },
    miss: { text: "Fallo ✦ 0 pts", className: "text-red-400 bg-red-400/10" },
  };
  const s = map[label];
  if (!s) return null;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>
      {s.text}
    </span>
  );
}

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

  // Compute result label if match is finished
  let resultLabel: string | null = null;
  if (
    partido.terminado &&
    partido.golesLocal !== null &&
    partido.golesVisitante !== null &&
    initialPronostico !== undefined
  ) {
    const { calcularPuntos } = require("@/lib/scoring");
    const { label } = calcularPuntos(
      initialPronostico.golesLocal,
      initialPronostico.golesVisitante,
      partido.golesLocal,
      partido.golesVisitante
    );
    resultLabel = label;
  }

  const save = useCallback(async (gl: number, gv: number) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/pronosticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partidoId: partido.id, golesLocal: gl, golesVisitante: gv }),
      });
      if (res.ok) {
        setSavedAt("Guardado ✓");
        setTimeout(() => setSavedAt(null), 3000);
      } else {
        const d = await res.json();
        setError(d.error || "Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }, [partido.id]);

  // Auto-save with 800ms debounce whenever both scores are valid
  useEffect(() => {
    if (cerrado) return;
    const gl = parseInt(localScore, 10);
    const gv = parseInt(visitScore, 10);
    if (isNaN(gl) || isNaN(gv) || gl < 0 || gv < 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save(gl, gv);
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localScore, visitScore, cerrado, save]);

  const fechaDisplay = new Date(partido.fechaUTC).toLocaleString("es-EC", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Guayaquil",
  });

  return (
    <div className={`bg-[#1e293b] rounded-xl border p-4 ${cerrado ? "border-slate-700/30 opacity-80" : "border-slate-700/50"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>Grupo {partido.grupo} · {partido.fase}</span>
        <span>{fechaDisplay}</span>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between gap-3">
        {/* Local */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-2xl">{partido.flagLocal}</span>
          <span className="text-sm font-semibold text-center leading-tight">{partido.equipoLocal}</span>
        </div>

        {/* Score inputs / result */}
        <div className="flex items-center gap-2">
          {cerrado ? (
            <div className="flex items-center gap-2">
              {partido.terminado ? (
                <>
                  <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-xl font-bold text-green-400">
                    {partido.golesLocal}
                  </div>
                  <span className="text-slate-500">–</span>
                  <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-xl font-bold text-green-400">
                    {partido.golesVisitante}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center text-lg font-bold text-slate-400">
                    {localScore || "–"}
                  </div>
                  <span className="text-slate-500">–</span>
                  <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center text-lg font-bold text-slate-400">
                    {visitScore || "–"}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={30}
                value={localScore}
                onChange={(e) => { setLocalScore(e.target.value); setSavedAt(null); }}
                placeholder="0"
                className="w-12 h-12 bg-slate-700/50 border border-slate-600 rounded-lg text-center text-lg font-bold text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <span className="text-slate-500 font-bold">–</span>
              <input
                type="number"
                min={0}
                max={30}
                value={visitScore}
                onChange={(e) => { setVisitScore(e.target.value); setSavedAt(null); }}
                placeholder="0"
                className="w-12 h-12 bg-slate-700/50 border border-slate-600 rounded-lg text-center text-lg font-bold text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-2xl">{partido.flagVisitante}</span>
          <span className="text-sm font-semibold text-center leading-tight">{partido.equipoVisitante}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate">{partido.estadio}</span>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {resultLabel && <ScoreLabel label={resultLabel} />}

          {cerrado && !partido.terminado && (
            <span className="text-slate-500 italic">Partido en curso</span>
          )}

          {!cerrado && (
            <>
              {error && <span className="text-red-400">{error}</span>}
              {saving && <span className="text-slate-400 italic">Guardando…</span>}
              {savedAt && !error && !saving && <span className="text-green-400">{savedAt}</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
