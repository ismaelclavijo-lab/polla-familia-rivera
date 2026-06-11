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
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar nombre={session.nombre} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Así se juega</h1>
        <p className="text-slate-400 text-sm mb-8">
          Todo lo que necesitas saber para participar en la Polla Mundialista de la Familia Rivera Arcos.
        </p>

        {/* Steps */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">En cuatro pasos</h2>
          <div className="space-y-3">
            {[
              "Crea tu cuenta con tu correo y una contraseña.",
              "Completa tu perfil con tu nombre para aparecer en el ranking.",
              "Registra tu marcador antes de que empiece cada partido.",
              "Suma puntos y escala posiciones en el ranking.",
            ].map((paso, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-300">{paso}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Cuánto suma cada acierto</h2>
          <div className="space-y-3">
            {puntaje.map(({ condicion, puntos, color, bg }) => (
              <div
                key={condicion}
                className={`flex items-center justify-between p-4 rounded-xl border ${bg}`}
              >
                <p className="text-slate-300 text-sm">{condicion}</p>
                <span className={`text-2xl font-bold ml-4 ${color}`}>{puntos}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Example */}
        <div className="mb-10 bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h2 className="text-lg font-semibold mb-4">Ejemplo</h2>
          <p className="text-slate-400 text-sm mb-3">El resultado real es <strong className="text-slate-200">Argentina 3 – 1 Argelia</strong>.</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Pronóstico: <strong>3 – 1</strong></span>
              <span className="text-green-400 font-semibold">✦ 5 pts (marcador exacto)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Pronóstico: <strong>2 – 0</strong></span>
              <span className="text-blue-400 font-semibold">✦ 3 pts (diferencia +2)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Pronóstico: <strong>1 – 0</strong></span>
              <span className="text-yellow-400 font-semibold">✦ 2 pts (Argentina gana)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Pronóstico: <strong>0 – 1</strong></span>
              <span className="text-red-400 font-semibold">✦ 0 pts (resultado equivocado)</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-2 text-orange-400">⚡ Recuerda</h2>
          <ul className="space-y-1.5 text-sm text-slate-300">
            <li>• Debes registrar tu pronóstico <strong>antes de que empiece cada partido</strong>.</li>
            <li>• Una vez comenzado el partido, el pronóstico queda bloqueado.</li>
            <li>• Puedes cambiar tu pronóstico tantas veces como quieras antes del inicio.</li>
            <li>• El ranking se actualiza automáticamente cuando se ingresan los resultados.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
