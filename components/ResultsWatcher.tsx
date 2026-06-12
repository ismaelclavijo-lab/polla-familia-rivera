"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Toast { id: number; texto: string }

export default function ResultsWatcher({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const seenRef = useRef<Set<string>>(new Set());
  const firstRun = useRef(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/resultados");
        if (!res.ok) return;
        const data = await res.json();
        const resultados: { partidoId: string; golesLocal: number | null; golesVisitante: number | null; cerrado: boolean }[] =
          data.resultados ?? [];

        const nuevos: string[] = [];
        for (const r of resultados) {
          if (!r.cerrado || r.golesLocal === null || r.golesVisitante === null) continue;
          const key = `${r.partidoId}-${r.golesLocal}-${r.golesVisitante}`;
          if (!seenRef.current.has(key)) {
            if (!firstRun.current) nuevos.push(key);
            seenRef.current.add(key);
          }
        }

        firstRun.current = false;

        if (nuevos.length > 0) {
          router.refresh();
          // pequeño delay para que el refresh traiga los nombres
          setTimeout(async () => {
            const res2 = await fetch("/api/resultados");
            if (!res2.ok) return;
            const d2 = await res2.json();
            const msgs: Toast[] = (d2.resultados ?? [])
              .filter((r: { partidoId: string; golesLocal: number | null; golesVisitante: number | null; cerrado: boolean }) => {
                const k = `${r.partidoId}-${r.golesLocal}-${r.golesVisitante}`;
                return nuevos.includes(k);
              })
              .map((r: { golesLocal: number; golesVisitante: number }, i: number) => ({
                id: Date.now() + i,
                texto: `Resultado: ${r.golesLocal} – ${r.golesVisitante}`,
              }));
            if (msgs.length > 0) {
              setToasts((prev) => [...prev, ...msgs]);
              setTimeout(() => setToasts([]), 6000);
            }
          }, 500);
        }
      } catch { /* ignore */ }
    }

    const id = setInterval(check, intervalMs);
    check(); // run immediately to populate seenRef
    return () => clearInterval(id);
  }, [router, intervalMs]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-slate-900/95 border border-emerald-500/30 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl shadow-black/50"
          style={{ animation: "slideIn 0.3s ease" }}
        >
          <span className="text-2xl">⚽</span>
          <div>
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-semibold mb-0.5">Resultado actualizado</p>
            <p className="text-sm font-bold text-white">{t.texto}</p>
          </div>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(1rem); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
