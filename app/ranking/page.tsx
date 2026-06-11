import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getJugadores, getPronosticos, getResultados } from "@/lib/db";
import { calcularPuntos } from "@/lib/scoring";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [jugadores, pronosticos, resultados] = await Promise.all([
    getJugadores(),
    getPronosticos(),
    getResultados(),
  ]);

  const resultadoMap = new Map(resultados.map((r) => [r.partidoId, r]));

  const puntajeMap = new Map<string, { nombre: string; puntos: number; acertados: number; partidos: number }>();

  for (const j of jugadores) {
    puntajeMap.set(j.email, { nombre: j.nombre, puntos: 0, acertados: 0, partidos: 0 });
  }

  for (const p of pronosticos) {
    const resultado = resultadoMap.get(p.partidoId);
    if (!resultado || resultado.golesLocal === null || resultado.golesVisitante === null) continue;

    const { points } = calcularPuntos(
      p.golesLocal,
      p.golesVisitante,
      resultado.golesLocal,
      resultado.golesVisitante
    );

    const entry = puntajeMap.get(p.email);
    if (entry) {
      entry.puntos += points;
      entry.partidos++;
      if (points > 0) entry.acertados++;
    }
  }

  const ranking = Array.from(puntajeMap.entries())
    .map(([email, data]) => ({ email, ...data }))
    .sort((a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre));

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar nombre={session.nombre} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Tabla de posiciones</h1>
        <p className="text-slate-400 text-sm mb-6">El ranking se actualiza cuando termina cada partido.</p>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_4rem_4rem] px-4 py-2.5 border-b border-slate-700/50 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            <span>#</span>
            <span>Jugador</span>
            <span className="text-center">Aciertos</span>
            <span className="text-right">PTS</span>
          </div>

          {ranking.map((j, idx) => {
            const isMe = j.email === session.email;
            const pos = idx + 1;
            return (
              <div
                key={j.email}
                className={`grid grid-cols-[3rem_1fr_4rem_4rem] items-center px-4 py-3.5 border-b border-slate-700/30 last:border-0 ${
                  isMe ? "bg-orange-500/10" : ""
                }`}
              >
                <span className="text-sm font-semibold text-slate-400">
                  {medals[idx] ?? pos}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                    {j.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm font-medium ${isMe ? "text-orange-400" : "text-slate-100"}`}>
                    {j.nombre}
                    {isMe && <span className="ml-1 text-xs text-orange-500/80">(tú)</span>}
                  </span>
                </div>
                <span className="text-center text-sm text-slate-400">{j.acertados}</span>
                <span className={`text-right font-bold ${j.puntos > 0 ? "text-orange-400" : "text-slate-500"}`}>
                  {j.puntos}
                </span>
              </div>
            );
          })}

          {ranking.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">
              Aún no hay jugadores registrados.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
