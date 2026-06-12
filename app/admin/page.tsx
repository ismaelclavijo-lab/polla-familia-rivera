"use client";

import { useState, useEffect } from "react";
import { PARTIDOS } from "@/lib/partidos-data";
import Link from "next/link";

interface ResultadoState {
  local: string;
  visitante: string;
  cerrado: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

export default function AdminPage() {
  const ahora = new Date();

  // Only show started matches
  const startedPartidos = PARTIDOS.filter((p) => new Date(p.fechaUTC) <= ahora);

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  async function sincronizarESPN() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/sync-espn", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(`✓ ${data.synced} partido(s) sincronizados`);
        // Reload resultados from DB
        fetch("/api/resultados")
          .then((r) => r.json())
          .then((d) => {
            if (!d.resultados) return;
            setEstados((prev) => {
              const next = { ...prev };
              for (const r of d.resultados) {
                if (next[r.partidoId]) {
                  next[r.partidoId] = {
                    ...next[r.partidoId],
                    local: r.golesLocal !== null ? String(r.golesLocal) : "",
                    visitante: r.golesVisitante !== null ? String(r.golesVisitante) : "",
                    cerrado: r.cerrado ?? false,
                  };
                }
              }
              return next;
            });
          });
      } else {
        setSyncResult(`Error: ${data.error}`);
      }
    } catch {
      setSyncResult("Error de conexión");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 5000);
    }
  }

  const [estados, setEstados] = useState<Record<string, ResultadoState>>(() => {
    const init: Record<string, ResultadoState> = {};
    startedPartidos.forEach((p) => {
      init[p.id] = { local: "", visitante: "", cerrado: false, saving: false, saved: false, error: null };
    });
    return init;
  });

  // Load existing results on mount
  useEffect(() => {
    fetch("/api/pronosticos")
      .then((r) => r.json())
      .catch(() => null);

    // Load resultados
    fetch("/api/resultados")
      .then((r) => r.json())
      .then((data) => {
        if (!data.resultados) return;
        setEstados((prev) => {
          const next = { ...prev };
          for (const r of data.resultados) {
            if (next[r.partidoId]) {
              next[r.partidoId] = {
                ...next[r.partidoId],
                local: r.golesLocal !== null ? String(r.golesLocal) : "",
                visitante: r.golesVisitante !== null ? String(r.golesVisitante) : "",
                cerrado: r.cerrado ?? false,
              };
            }
          }
          return next;
        });
      })
      .catch(() => null);
  }, []);

  async function guardar(partidoId: string) {
    const est = estados[partidoId];
    const gl = parseInt(est.local, 10);
    const gv = parseInt(est.visitante, 10);
    if (isNaN(gl) || isNaN(gv)) {
      setEstados((p) => ({ ...p, [partidoId]: { ...p[partidoId], error: "Marcador inválido" } }));
      return;
    }

    setEstados((p) => ({ ...p, [partidoId]: { ...p[partidoId], saving: true, error: null } }));

    const res = await fetch("/api/admin/resultados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partidoId, golesLocal: gl, golesVisitante: gv, cerrado: est.cerrado }),
    });

    if (res.ok) {
      setEstados((p) => ({ ...p, [partidoId]: { ...p[partidoId], saving: false, saved: true, error: null } }));
      setTimeout(() => setEstados((p) => ({ ...p, [partidoId]: { ...p[partidoId], saved: false } })), 3000);
    } else {
      const d = await res.json();
      setEstados((p) => ({ ...p, [partidoId]: { ...p[partidoId], saving: false, error: d.error || "Error" } }));
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="bg-[#1e293b] border-b border-slate-700/50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚽</span>
          <span className="font-bold text-orange-400">Admin · Resultados</span>
        </div>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Volver
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">Ingresar resultados</h1>
          <div className="flex items-center gap-3">
            {syncResult && (
              <span className={`text-sm ${syncResult.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                {syncResult}
              </span>
            )}
            <button
              onClick={sincronizarESPN}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {syncing ? "⏳ Sincronizando…" : "🔄 Sincronizar ESPN"}
            </button>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Ingresa el marcador final de cada partido. Marca "Finalizado" cuando el partido terminó.
          <br />
          <span className="text-blue-400">Usa "Sincronizar ESPN" para jalar resultados automáticamente.</span>
        </p>

        {startedPartidos.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p>Aún no hay partidos iniciados.</p>
          </div>
        )}

        <div className="space-y-3">
          {startedPartidos.map((partido) => {
            const est = estados[partido.id];
            if (!est) return null;
            const fecha = new Date(partido.fechaUTC).toLocaleDateString("es", {
              weekday: "short", day: "numeric", month: "short",
            });

            return (
              <div key={partido.id} className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500">Grupo {partido.grupo} · {fecha}</p>
                    <p className="text-sm font-medium mt-0.5">
                      {partido.flagLocal} {partido.equipoLocal} vs {partido.equipoVisitante} {partido.flagVisitante}
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={est.cerrado}
                      onChange={(e) => setEstados((p) => ({ ...p, [partido.id]: { ...p[partido.id], cerrado: e.target.checked } }))}
                      className="accent-orange-500"
                    />
                    Finalizado
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    placeholder="0"
                    value={est.local}
                    onChange={(e) => setEstados((p) => ({ ...p, [partido.id]: { ...p[partido.id], local: e.target.value, saved: false } }))}
                    className="w-16 h-10 bg-slate-700/50 border border-slate-600 rounded-lg text-center text-lg font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-slate-500 font-bold text-lg">–</span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    placeholder="0"
                    value={est.visitante}
                    onChange={(e) => setEstados((p) => ({ ...p, [partido.id]: { ...p[partido.id], visitante: e.target.value, saved: false } }))}
                    className="w-16 h-10 bg-slate-700/50 border border-slate-600 rounded-lg text-center text-lg font-bold text-white focus:outline-none focus:border-orange-500"
                  />

                  <button
                    onClick={() => guardar(partido.id)}
                    disabled={est.saving || est.local === "" || est.visitante === ""}
                    className="ml-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {est.saving ? "…" : "Guardar"}
                  </button>

                  {est.saved && <span className="text-green-400 text-sm">✓ Guardado</span>}
                  {est.error && <span className="text-red-400 text-sm">{est.error}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
