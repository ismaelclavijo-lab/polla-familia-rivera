import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getJugadores, getPronosticos, getResultados, getPartidosExtra } from "@/lib/db";
import { calcularPuntos } from "@/lib/scoring";
import { PARTIDOS } from "@/lib/partidos-data";
import Navbar from "@/components/Navbar";
import RankingRow, { PickDetalle } from "@/components/RankingRow";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [jugadores, pronosticos, resultados, partidos_extra] = await Promise.all([
    getJugadores(),
    getPronosticos(),
    getResultados(),
    getPartidosExtra(),
  ]);

  const resultadoMap = new Map(resultados.map((r) => [r.partidoId, r]));
  const TODOS = [...PARTIDOS, ...partidos_extra.map((p) => ({ ...p, jornada: 0 }))];
  const partidoMap = new Map(TODOS.map((p) => [p.id, p]));

  // Build per-player data
  const playerMap = new Map<string, {
    nombre: string;
    puntos: number;
    acertados: number;
    detalles: PickDetalle[];
  }>();

  for (const j of jugadores) {
    playerMap.set(j.email, { nombre: j.nombre, puntos: 0, acertados: 0, detalles: [] });
  }

  for (const p of pronosticos) {
    const resultado = resultadoMap.get(p.partidoId);
    if (!resultado || resultado.golesLocal === null || resultado.golesVisitante === null) continue;

    const partido = partidoMap.get(p.partidoId);
    if (!partido) continue;

    const { points, label } = calcularPuntos(
      p.golesLocal,
      p.golesVisitante,
      resultado.golesLocal,
      resultado.golesVisitante
    );

    const entry = playerMap.get(p.email);
    if (entry) {
      entry.puntos += points;
      if (points > 0) entry.acertados++;
      entry.detalles.push({
        partidoId: p.partidoId,
        flagLocal: partido.flagLocal,
        equipoLocal: partido.equipoLocal,
        flagVisitante: partido.flagVisitante,
        equipoVisitante: partido.equipoVisitante,
        pickLocal: p.golesLocal,
        pickVisitante: p.golesVisitante,
        realLocal: resultado.golesLocal,
        realVisitante: resultado.golesVisitante,
        points,
        label,
      });
    }
  }

  const ranking = Array.from(playerMap.entries())
    .map(([email, data]) => ({ email, ...data }))
    .sort((a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre));

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar nombre={session.nombre} />

      <main className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-8">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-1">Mundial 2026</p>
          <h1 className="text-3xl font-bold text-white mb-1">Ranking</h1>
          <p className="text-slate-500 text-sm">Se actualiza cuando termina cada partido. Toca un nombre para ver sus picks.</p>
        </div>

        {/* Top 3 podium */}
        {ranking.length >= 1 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[ranking[1], ranking[0], ranking[2]].map((j, visualIdx) => {
              if (!j) return <div key={visualIdx} />;
              const realIdx = ranking.indexOf(j);
              const podiumStyle = realIdx === 0
                ? "border-amber-400/30 bg-amber-500/5 scale-105"
                : "border-white/[0.07] bg-white/[0.03]";
              const ptColor = realIdx === 0 ? "text-amber-400" : realIdx === 1 ? "text-slate-300" : "text-orange-700";
              const avatarBg = realIdx === 0
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                : "bg-white/10 text-slate-400";
              const isMe = j.email === session.email;
              return (
                <div key={j.email} className={`relative rounded-2xl border p-4 text-center transition-all ${podiumStyle}`}>
                  {realIdx === 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 mt-1 ${avatarBg}`}>
                    {j.nombre.charAt(0).toUpperCase()}
                  </div>
                  <p className={`text-xs font-semibold truncate ${isMe ? "text-orange-400" : "text-slate-300"}`}>
                    {j.nombre}{isMe ? " 👈" : ""}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${ptColor}`}>{j.puntos}</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">pts</p>
                  <p className="text-[10px] text-slate-700 mt-0.5">{medals[realIdx]}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_4rem_4rem_2rem] px-4 py-3 border-b border-white/5 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
            <span>#</span>
            <span>Jugador</span>
            <span className="text-center">Aciertos</span>
            <span className="text-right">PTS</span>
            <span />
          </div>

          {ranking.map((j, idx) => (
            <RankingRow
              key={j.email}
              idx={idx}
              nombre={j.nombre}
              email={j.email}
              puntos={j.puntos}
              acertados={j.acertados}
              isMe={j.email === session.email}
              detalles={j.detalles}
              medals={medals}
            />
          ))}

          {ranking.length === 0 && (
            <div className="py-16 text-center text-slate-600 text-sm">
              Aún no hay jugadores registrados.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
