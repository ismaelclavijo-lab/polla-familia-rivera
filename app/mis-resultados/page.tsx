import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPronosticos, getResultados } from "@/lib/db";
import { PARTIDOS } from "@/lib/partidos-data";
import { calcularPuntos } from "@/lib/scoring";
import Navbar from "@/components/Navbar";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function MisResultadosPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [pronosticos, resultados] = await Promise.all([
    getPronosticos(session.email),
    getResultados(),
  ]);

  const resultadoMap = new Map(resultados.map((r) => [r.partidoId, r]));
  const ahora = new Date();

  // Closed matches = match time has passed and user made a prediction
  const cerrados = pronosticos
    .map((p) => {
      const partido = PARTIDOS.find((pa) => pa.id === p.partidoId);
      if (!partido) return null;
      const fechaPartido = new Date(partido.fechaUTC);
      if (ahora < fechaPartido) return null; // not started yet

      const resultado = resultadoMap.get(p.partidoId) ?? null;
      const tieneResultado =
        resultado !== null &&
        resultado.golesLocal !== null &&
        resultado.golesVisitante !== null;

      const { points, label } = tieneResultado
        ? calcularPuntos(
            p.golesLocal,
            p.golesVisitante,
            resultado!.golesLocal as number,
            resultado!.golesVisitante as number
          )
        : { points: null as number | null, label: null as string | null };

      return { partido, pronostico: p, resultado, tieneResultado, points, label };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort(
      (a, b) =>
        new Date(a.partido.fechaUTC).getTime() -
        new Date(b.partido.fechaUTC).getTime()
    );

  const yaJugados = cerrados.filter((c) => c.tieneResultado);
  const totalPuntos = yaJugados.reduce((sum, c) => sum + (c.points ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar nombre={session.nombre} />

      <AutoRefresh intervalMs={60_000} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Mis resultados</h1>
        <p className="text-slate-400 text-sm mb-6">
          Tus pronósticos cerrados y cómo quedaron frente al marcador real.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-slate-700/50">
            <div className="text-2xl font-bold text-orange-400">{cerrados.length}</div>
            <div className="text-xs text-slate-400 mt-1">Picks cerrados</div>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-slate-700/50">
            <div className="text-2xl font-bold text-white">{yaJugados.length}</div>
            <div className="text-xs text-slate-400 mt-1">Ya jugados</div>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-slate-700/50">
            <div className="text-2xl font-bold text-green-400">{totalPuntos}</div>
            <div className="text-xs text-slate-400 mt-1">Puntos sumados</div>
          </div>
        </div>

        {cerrados.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <span className="text-4xl block mb-3">⏳</span>
            <p>Aún no hay partidos cerrados.</p>
            <p className="text-sm mt-1">Los partidos aparecen aquí cuando ya han iniciado.</p>
          </div>
        )}

        <div className="space-y-3">
          {cerrados.map(({ partido, pronostico, resultado, tieneResultado, points, label }) => {
            const fecha = new Date(partido.fechaUTC);
            const fechaStr = fecha.toLocaleDateString("es", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            const horaStr = fecha.toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const ptsColor =
              points === null
                ? ""
                : points === 5
                ? "text-green-400"
                : points >= 2
                ? "text-orange-400"
                : "text-red-400";

            const realBg =
              points === null
                ? ""
                : points === 5
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : points >= 2
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30";

            return (
              <div
                key={partido.id}
                className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-4"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Grupo {partido.grupo} · {partido.estadio}
                    </p>
                    <p className="text-xs text-slate-500">
                      {fechaStr} · {horaStr}
                    </p>
                  </div>
                  {tieneResultado && points !== null ? (
                    <span className={`text-sm font-bold ${ptsColor}`}>
                      {points > 0 ? "+" : ""}
                      {points} pts{label ? ` · ${label}` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Esperando resultado…
                    </span>
                  )}
                </div>

                {/* Teams + scores */}
                <div className="flex items-center gap-3">
                  {/* Local */}
                  <div className="flex-1 text-center">
                    <div className="text-3xl mb-1">{partido.flagLocal}</div>
                    <div className="text-sm font-medium text-slate-200 leading-tight">
                      {partido.equipoLocal}
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-2">
                    {/* Pick */}
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1">PICK</div>
                      <div className="bg-slate-800 rounded-lg px-3 py-1.5 font-bold text-white text-lg min-w-[3rem]">
                        {pronostico.golesLocal}–{pronostico.golesVisitante}
                      </div>
                    </div>

                    {/* Real */}
                    {tieneResultado && resultado && (
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">REAL</div>
                        <div
                          className={`rounded-lg px-3 py-1.5 font-bold text-lg min-w-[3rem] ${realBg}`}
                        >
                          {resultado.golesLocal}–{resultado.golesVisitante}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visitante */}
                  <div className="flex-1 text-center">
                    <div className="text-3xl mb-1">{partido.flagVisitante}</div>
                    <div className="text-sm font-medium text-slate-200 leading-tight">
                      {partido.equipoVisitante}
                    </div>
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
