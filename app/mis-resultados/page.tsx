import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPronosticos, getResultados } from "@/lib/db";
import { PARTIDOS } from "@/lib/partidos-data";
import { calcularPuntos } from "@/lib/scoring";
import { syncFromESPN } from "@/lib/espn-sync";
import Navbar from "@/components/Navbar";
import ResultsWatcher from "@/components/ResultsWatcher";

export const dynamic = "force-dynamic";

export default async function MisResultadosPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  // Sync live/finished matches from ESPN before fetching results
  await syncFromESPN();

  const [pronosticos, resultados] = await Promise.all([
    getPronosticos(session.email),
    getResultados(),
  ]);

  const resultadoMap = new Map(resultados.map((r) => [r.partidoId, r]));
  const pronosticoMap = new Map(pronosticos.map((p) => [p.partidoId, p]));
  const ahora = new Date();

  // All started matches (whether or not the user predicted them)
  const cerrados = PARTIDOS
    .filter((partido) => new Date(partido.fechaUTC) <= ahora)
    .map((partido) => {
      const pronostico = pronosticoMap.get(partido.id) ?? null;
      const resultado = resultadoMap.get(partido.id) ?? null;

      const tieneResultado =
        resultado !== null &&
        resultado.golesLocal !== null &&
        resultado.golesVisitante !== null;

      const sinPronostico = pronostico === null;

      const { points, label } =
        !sinPronostico && tieneResultado
          ? calcularPuntos(
              pronostico!.golesLocal,
              pronostico!.golesVisitante,
              resultado!.golesLocal as number,
              resultado!.golesVisitante as number
            )
          : { points: sinPronostico ? 0 : (null as number | null), label: sinPronostico ? "Sin pronóstico" : (null as string | null) };

      // En vivo: started within last 115 min and not yet cerrado
      const fechaPartido = new Date(partido.fechaUTC);
      const finEstimado = new Date(fechaPartido.getTime() + 115 * 60 * 1000);
      const enVivo = ahora >= fechaPartido && ahora <= finEstimado && !resultado?.cerrado;

      return { partido, pronostico, resultado, tieneResultado, sinPronostico, points, label, enVivo };
    })
    .sort(
      (a, b) =>
        new Date(a.partido.fechaUTC).getTime() -
        new Date(b.partido.fechaUTC).getTime()
    );

  const hayEnVivo = cerrados.some((c) => c.enVivo);
  const conPronostico = cerrados.filter((c) => !c.sinPronostico);
  const yaJugados = cerrados.filter((c) => c.tieneResultado);
  const totalPuntos = conPronostico.reduce((sum, c) => sum + (c.points ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar nombre={session.nombre} />
      <ResultsWatcher intervalMs={hayEnVivo ? 30_000 : 60_000} />

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-1">Mundial 2026</p>
          <h1 className="text-3xl font-bold text-white mb-1">Mis resultados</h1>
          <p className="text-slate-500 text-sm">Tus pronósticos cerrados vs. el marcador real.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-0.5">{conPronostico.length}</div>
            <div className="text-xs text-slate-600 uppercase tracking-wider">Picks cerrados</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-200 mb-0.5">{yaJugados.length}</div>
            <div className="text-xs text-slate-600 uppercase tracking-wider">Ya jugados</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-0.5">{totalPuntos}</div>
            <div className="text-xs text-slate-600 uppercase tracking-wider">Puntos</div>
          </div>
        </div>

        {cerrados.length === 0 && (
          <div className="text-center py-20 text-slate-600">
            <span className="text-5xl block mb-4">⏳</span>
            <p className="font-medium">Aún no hay partidos cerrados.</p>
            <p className="text-sm mt-1 text-slate-700">Los partidos aparecen aquí cuando ya han iniciado.</p>
          </div>
        )}

        <div className="space-y-3">
          {cerrados.map(({ partido, pronostico, resultado, tieneResultado, sinPronostico, points, label, enVivo }) => {
            const fecha = new Date(partido.fechaUTC);
            const fechaStr = fecha.toLocaleDateString("es", {
              weekday: "short", day: "numeric", month: "short",
              timeZone: "America/Guayaquil",
            });
            const horaStr = fecha.toLocaleTimeString("es", {
              hour: "2-digit", minute: "2-digit",
              timeZone: "America/Guayaquil",
            });

            const ptsBadge =
              points === null ? null
              : points === 5 ? { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
              : points === 3 ? { color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" }
              : points === 2 ? { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" }
              :                { color: "text-red-400",      bg: "bg-red-500/10 border-red-500/20" };

            const realBg =
              points === null ? "bg-white/5 border-white/10 text-slate-300"
              : points === 5 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : points >= 2  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              :                "bg-red-500/10 border-red-500/20 text-red-400";

            return (
              <div key={partido.id} className="relative group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 overflow-hidden">
                {enVivo && (
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-600">Grupo {partido.grupo} · {partido.estadio}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{fechaStr} · {horaStr}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {enVivo && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                        EN VIVO
                      </span>
                    )}
                    {tieneResultado && ptsBadge && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ptsBadge.color} ${ptsBadge.bg}`}>
                        {points! > 0 ? "+" : ""}{points} pts{label ? ` · ${label}` : ""}
                      </span>
                    )}
                    {!tieneResultado && !sinPronostico && (
                      <span className="text-xs text-slate-600 italic">Esperando resultado…</span>
                    )}
                    {sinPronostico && (
                      <span className="text-xs text-slate-700 italic">Sin pronóstico</span>
                    )}
                  </div>
                </div>

                {/* Teams + scores */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-center min-w-0">
                    <div className="text-3xl mb-1">{partido.flagLocal}</div>
                    <div className="text-xs font-semibold text-slate-400 leading-tight truncate">{partido.equipoLocal}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Pick */}
                    <div className="text-center">
                      <div className="text-[10px] text-slate-700 uppercase tracking-widest mb-1.5">Pick</div>
                      <div className={`rounded-xl px-3 py-1.5 font-bold text-base border ${sinPronostico ? "bg-white/[0.02] border-white/5 text-slate-600" : "bg-white/5 border-white/10 text-white"}`}>
                        {sinPronostico ? "–" : `${pronostico!.golesLocal}–${pronostico!.golesVisitante}`}
                      </div>
                    </div>

                    {tieneResultado && resultado && (
                      <>
                        <div className="text-slate-700 text-sm">vs</div>
                        {/* Real */}
                        <div className="text-center">
                          <div className="text-[10px] text-slate-700 uppercase tracking-widest mb-1.5">Real</div>
                          <div className={`rounded-xl px-3 py-1.5 font-bold text-base border ${realBg}`}>
                            {resultado.golesLocal}–{resultado.golesVisitante}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex-1 text-center min-w-0">
                    <div className="text-3xl mb-1">{partido.flagVisitante}</div>
                    <div className="text-xs font-semibold text-slate-400 leading-tight truncate">{partido.equipoVisitante}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
