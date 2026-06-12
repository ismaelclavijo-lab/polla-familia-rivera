import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPronosticos, getResultados } from "@/lib/db";
import { PARTIDOS } from "@/lib/partidos-data";
import { calcularPuntos } from "@/lib/scoring";
import { syncFromESPN } from "@/lib/espn-sync";
import Navbar from "@/components/Navbar";
import AutoRefresh from "@/components/AutoRefresh";

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
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar nombre={session.nombre} />

      <AutoRefresh intervalMs={hayEnVivo ? 30_000 : 60_000} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Mis resultados</h1>
        <p className="text-slate-400 text-sm mb-6">
          Tus pronósticos cerrados y cómo quedaron frente al marcador real.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#1e293b] rounded-xl p-4 text-center border border-slate-700/50">
            <div className="text-2xl font-bold text-orange-400">{conPronostico.length}</div>
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
          {cerrados.map(({ partido, pronostico, resultado, tieneResultado, sinPronostico, points, label, enVivo }) => {
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
                  <div className="flex items-center gap-2">
                    {enVivo && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-400 animate-pulse">
                        🔴 EN VIVO
                      </span>
                    )}
                    {tieneResultado && points !== null ? (
                      <span className={`text-sm font-bold ${ptsColor}`}>
                        {points > 0 ? "+" : ""}{points} pts{label ? ` · ${label}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Esperando resultado…
                      </span>
                    )}
                  </div>
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
                      <div className={`rounded-lg px-3 py-1.5 font-bold text-lg min-w-[3rem] ${sinPronostico ? "bg-slate-700/50 text-slate-500" : "bg-slate-800 text-white"}`}>
                        {sinPronostico ? "–" : `${pronostico!.golesLocal}–${pronostico!.golesVisitante}`}
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
