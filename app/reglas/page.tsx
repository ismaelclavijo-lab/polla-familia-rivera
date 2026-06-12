import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function ReglasPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const puntaje = [
    { condicion: "El marcador exacto", puntos: 5, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    { condicion: "La diferencia de goles (mismo resultado, distinto marcador)", puntos: 3, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { condicion: "Quién gana o si hay empate", puntos: 2, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar nombre={session.nombre} />

      <main className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-8">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-1">Mundial 2026</p>
          <h1 className="text-3xl font-bold text-white mb-1">Cómo jugar</h1>
          <p className="text-slate-500 text-sm">Todo lo que necesitas saber para participar.</p>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">En cuatro pasos</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="space-y-3">
            {[
              { paso: "Crea tu cuenta con tu correo y una contraseña.", icon: "👤" },
              { paso: "Completa tu perfil con tu nombre para aparecer en el ranking.", icon: "✏️" },
              { paso: "Registra tu marcador antes de que empiece cada partido.", icon: "🎯" },
              { paso: "Suma puntos y escala posiciones en el ranking.", icon: "🏆" },
            ].map(({ paso, icon }, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                  {i + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-slate-300 text-sm">{paso}</p>
                </div>
                <span className="text-xl shrink-0">{icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">Puntuación</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="space-y-2">
            {puntaje.map(({ condicion, puntos, color, bg }) => (
              <div key={condicion} className={`flex items-center justify-between p-4 rounded-2xl border ${bg}`}>
                <p className="text-slate-300 text-sm">{condicion}</p>
                <span className={`text-2xl font-bold ml-4 shrink-0 ${color}`}>{puntos} <span className="text-sm font-normal">pts</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Example */}
        <div className="mb-8 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-3">Ejemplo</p>
          <p className="text-slate-400 text-sm mb-4">El resultado real es <strong className="text-slate-200">Argentina 3 – 1 Argelia</strong>.</p>
          <div className="space-y-2.5 text-sm">
            {[
              { pick: "3 – 1", pts: "+5", label: "marcador exacto", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { pick: "2 – 0", pts: "+3", label: "diferencia +2", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { pick: "1 – 0", pts: "+2", label: "Argentina gana", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              { pick: "0 – 1", pts: "0", label: "resultado equivocado", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
            ].map(({ pick, pts, label, color, bg }) => (
              <div key={pick} className="flex items-center justify-between">
                <span className="text-slate-500">Pronóstico: <strong className="text-slate-300">{pick}</strong></span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${color} ${bg}`}>{pts} pts · {label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-orange-500/[0.06] border border-orange-500/20 rounded-2xl p-5">
          <p className="text-xs text-orange-600 uppercase tracking-widest font-medium mb-3">⚡ Recuerda</p>
          <div className="space-y-2 text-sm text-slate-400">
            <p>Debes registrar tu pronóstico <strong className="text-slate-300">antes de que empiece cada partido</strong>.</p>
            <p>Una vez comenzado el partido, el pronóstico queda bloqueado.</p>
            <p>Puedes cambiar tu pronóstico tantas veces como quieras antes del inicio.</p>
            <p>El ranking se actualiza automáticamente cuando terminan los partidos.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
