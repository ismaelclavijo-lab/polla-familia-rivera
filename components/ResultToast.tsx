"use client";

import { useEffect, useState } from "react";

interface Toast {
  id: number;
  msg: string;
}

export default function ResultToast({ prevCount, newResults }: { prevCount: number; newResults: { local: string; visitante: string; gl: number; gv: number }[] }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (newResults.length === 0) return;
    const next: Toast[] = newResults.map((r, i) => ({
      id: Date.now() + i,
      msg: `${r.local} ${r.gl} – ${r.gv} ${r.visitante}`,
    }));
    setToasts((prev) => [...prev, ...next]);
    const id = setTimeout(() => setToasts([]), 5000);
    return () => clearTimeout(id);
  }, [newResults]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 bg-slate-900/95 border border-emerald-500/30 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl shadow-black/40 animate-in slide-in-from-right-4 fade-in duration-300"
        >
          <span className="text-emerald-400 text-lg">⚽</span>
          <div>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-semibold">Resultado final</p>
            <p className="text-sm font-bold text-white">{t.msg}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
