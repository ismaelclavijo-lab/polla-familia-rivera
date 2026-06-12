import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPronosticos, getResultados } from "@/lib/db";
import { PARTIDOS, getCurrentWeekRange } from "@/lib/partidos-data";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PartidoCard from "@/components/PartidoCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [pronosticos, resultados] = await Promise.all([
    getPronosticos(session.email),
    getResultados(),
  ]);

  const pronosticoMap = new Map(pronosticos.map((p) => [p.partidoId, p]));
  const resultadoMap = new Map(resultados.map((r) => [r.partidoId, r]));

  const ahora = new Date();
  const { start, end, label: weekLabel } = getCurrentWeekRange();

  // Partidos esta semana que AÚN no han iniciado
  const weekPartidos = PARTIDOS.filter((p) => {
    const d = new Date(p.fechaUTC);
    return d >= start && d <= end && d > ahora;
  }).map((p) => ({
    ...p,
    golesLocal: null,
    golesVisitante: null,
    cerrado: false,
    terminado: false,
  }));

  // Cuántos partidos de esta semana ya iniciaron (para el banner)
  const partidosSemanaIniciados = PARTIDOS.filter((p) => {
    const d = new Date(p.fechaUTC);
    return d >= start && d <= end && d <= ahora;
  }).length;

  // Partidos pendientes (futuros, fuera de semana)
  const futurePartidos = PARTIDOS.filter((p) => {
    const d = new Date(p.fechaUTC);
    return d > end && d > ahora;
  }).slice(0, 8).map((p) => ({
    ...p,
    golesLocal: null,
    golesVisitante: null,
    cerrado: false,
    terminado: false,
  }));

  const completados = weekPartidos.filter((p) => pronosticoMap.has(p.id)).length;
  const total = weekPartidos.length;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar nombre={session.nombre} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Tus pronósticos de la semana</h1>
        <p className="text-slate-400 text-sm mb-6">
          Registra tu marcador antes de que empiece cada partido.
        </p>

        {/* Banner: hay partidos iniciados → ver en Mis resultados */}
        {partidosSemanaIniciados > 0 && (
          <Link href="/mis-resultados" className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-xl px-5 py-3 mb-6 hover:bg-orange-500/20 transition-colors">
            <div>
              <p className="text-sm font-medium text-orange-400">
                🔴 {partidosSemanaIniciados} partido{partidosSemanaIniciados > 1 ? "s" : ""} en curso o terminado{partidosSemanaIniciados > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Seguí el marcador en Mis resultados →</p>
            </div>
            <span className="text-orange-400 text-lg">→</span>
          </Link>
        )}

        {/* Week progress card */}
        {weekPartidos.length > 0 && (
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">TU SEMANA</p>
                <p className="font-semibold">{weekLabel}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{completados}</span>
                <span className="text-slate-400 text-sm"> de {total} listos</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: total > 0 ? `${(completados / total) * 100}%` : "0%" }}
              />
            </div>
            {completados === total && total > 0 && (
              <p className="text-green-400 text-sm mt-2">¡Excelente! Ya tienes todos los pronósticos de esta semana.</p>
            )}
          </div>
        )}

        {/* Week matches */}
        {weekPartidos.length > 0 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {weekPartidos.map((partido) => (
                <PartidoCard
                  key={partido.id}
                  partido={partido}
                  pronostico={pronosticoMap.get(partido.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming matches */}
        {futurePartidos.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-slate-300">Próximos partidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {futurePartidos.map((partido) => (
                <PartidoCard
                  key={partido.id}
                  partido={partido}
                  pronostico={pronosticoMap.get(partido.id)}
                />
              ))}
            </div>
          </section>
        )}

        {weekPartidos.length === 0 && futurePartidos.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <span className="text-4xl block mb-3">🏆</span>
            <p>No hay partidos programados por ahora.</p>
          </div>
        )}
      </main>
    </div>
  );
}
