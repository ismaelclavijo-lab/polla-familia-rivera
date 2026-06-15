"use client";

import { useState } from "react";

export interface PickDetalle {
  partidoId: string;
  flagLocal: string;
  equipoLocal: string;
  flagVisitante: string;
  equipoVisitante: string;
  pickLocal: number;
  pickVisitante: number;
  realLocal: number;
  realVisitante: number;
  points: number;
  label: "exact" | "diff" | "winner" | "miss";
}

interface Props {
  idx: number;
  nombre: string;
  email: string;
  puntos: number;
  acertados: number;
  isMe: boolean;
  detalles: PickDetalle[];
  medals: string[];
}

const BADGE: Record<string, { text: string; color: string; bg: string }> = {
  exact:  { text: "Exacto",      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  diff:   { text: "Diferencia",  color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  winner: { text: "Ganador",     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  miss:   { text: "Fallo",       color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
};

export default function RankingRow({ idx, nombre, email, puntos, acertados, isMe, detalles, medals }: Props) {
  const [open, setOpen] = useState(false);
  const pos = idx + 1;

  return (
    <div className={`border-b border-white/[0.04] last:border-0 ${isMe ? "bg-orange-500/[0.06]" : ""}`}>
      {/* Main row */}
      <button
        onClick={() => detalles.length > 0 && setOpen((o) => !o)}
        className={`w-full grid grid-cols-[3rem_1fr_4rem_4rem_2rem] items-center px-4 py-3.5 text-left transition-colors ${
          detalles.length > 0 ? "cursor-pointer hover:bg-white/[0.02]" : "cursor-default"
        }`}
      >
        <span className="text-sm">
          {medals[idx] ?? <span className="text-slate-600 font-semibold">{pos}</span>}
        </span>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isMe ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-slate-500"
          }`}>
            {nombre.charAt(0).toUpperCase()}
          </div>
          <span className={`text-sm font-medium truncate ${isMe ? "text-orange-400" : "text-slate-200"}`}>
            {nombre}
            {isMe && <span className="ml-1.5 text-xs text-orange-600">(tú)</span>}
          </span>
        </div>
        <span className="text-center text-sm text-slate-500">{acertados}</span>
        <span className={`text-right font-bold tabular-nums ${
          idx === 0 ? "text-amber-400" : puntos > 0 ? "text-slate-200" : "text-slate-600"
        }`}>
          {puntos}
        </span>
        <span className={`text-right text-slate-600 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          {detalles.length > 0 ? "▾" : ""}
        </span>
      </button>

      {/* Accordion */}
      {open && detalles.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-white/[0.04]">
          <div className="pt-3 grid grid-cols-[10px_1fr_auto_auto_auto] gap-x-3 text-[10px] text-slate-700 uppercase tracking-widest font-semibold px-1 mb-1">
            <span />
            <span>Partido</span>
            <span className="text-center w-14">Pick</span>
            <span className="text-center w-14">Real</span>
            <span className="text-right w-12">Pts</span>
          </div>
          {detalles.map((d) => {
            const badge = BADGE[d.label];
            return (
              <div key={d.partidoId} className="grid grid-cols-[10px_1fr_auto_auto_auto] gap-x-3 items-center bg-white/[0.02] rounded-xl px-3 py-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${badge.bg.replace("bg-", "bg-").split(" ")[0]}`} />
                <span className="text-xs text-slate-400 truncate">
                  {d.flagLocal} {d.equipoLocal} <span className="text-slate-700">vs</span> {d.flagVisitante} {d.equipoVisitante}
                </span>
                <span className="text-xs font-mono text-slate-400 text-center w-14">
                  {d.pickLocal}–{d.pickVisitante}
                </span>
                <span className="text-xs font-mono text-slate-300 text-center w-14">
                  {d.realLocal}–{d.realVisitante}
                </span>
                <span className={`text-xs font-bold text-right w-12 ${badge.color}`}>
                  +{d.points}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
