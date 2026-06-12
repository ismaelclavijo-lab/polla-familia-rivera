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
    <div className="min-h-screen bg-slate-950">
      <Navbar nombre={session.nombre} />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero header */}
        <div className="mb-8">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-1">Mundial 2026</p>
          <h1 className="text-3xl font-bold text-white mb-1">Tus pronósticos</h1>
          <p className="text-slate-500 text-sm">Registra tu marcador antes de que empiece cada partido.</p>
        </div>

        {/* Banner EN VIVO */}
        {partidosSemanaIniciados > 0 && (
          <Link href="/mis-resultados" className="group flex items-center justify-between bg-orange-500/8 border border-orange-500/20 rounded-2xl px-5 py-4 mb-6 hover:bg-orange-500/12 hover:border-orange-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-orange-400">
                  {partidosSemanaIniciados} partido{partidosSemanaIniciados > 1 ? "s" : ""} en curso o terminado{partidosSemanaIniciados > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Ver resultados y puntos →</p>
              </div>
            </div>
            <span className="text-orange-500 text-xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        )}

        {/* Progress card */}
        {weekPartidos.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-0.5">Esta semana</p>
                <p className="font-semibold text-slate-200">{weekLabel}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-white">{completados}</span>
                <span className="text-slate-500 text-sm"> / {total}</span>
                <p className="text-xs text-slate-600 mt-0.5">listos</p>
              </div>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: total > 0 ? `${(completados / total) * 100}%` : "0%" }}
              />
            </div>
            {completados === total && total > 0 && (
              <p className="text-emerald-400 text-sm mt-2 font-medium">✓ Todos los pronósticos de la semana completados</p>
            )}
          </div>
        )}

        {/* Week matches */}
        {weekPartidos.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Partidos de la semana</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weekPartidos.map((partido) => (
                <PartidoCard key={partido.id} partido={partido} pronostico={pronosticoMap.get(partido.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {futurePartidos.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Próximos partidos</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {futurePartidos.map((partido) => (
                <PartidoCard key={partido.id} partido={partido} pronostico={pronosticoMap.get(partido.id)} />
              ))}
            </div>
          </section>
        )}

        {weekPartidos.length === 0 && futurePartidos.length === 0 && (
          <div className="text-center py-20 text-slate-600">
            <span className="text-5xl block mb-4">🏆</span>
            <p className="font-medium">No hay partidos programados por ahora.</p>
          </div>
        )}
      </main>
    </div>
  );
}
