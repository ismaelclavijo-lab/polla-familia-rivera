import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getJugadores, getPronosticos, getResultados } from "@/lib/db";
import { calcularPuntos } from "@/lib/scoring";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [jugadores, pronosticos, resultados] = await Promise.all([
    getJugadores(),
    getPronosticos(),
    getResultados(),
  ]);

  const resultadoMap = new Map(resultados.map((r) => [r.partidoId, r]));

  // Calculate points per jugador
  const puntajeMap = new Map<string, { nombre: string; puntos: number; acertados: number }>();

  for (const j of jugadores) {
    puntajeMap.set(j.email, { nombre: j.nombre, puntos: 0, acertados: 0 });
  }

  for (const p of pronosticos) {
    const resultado = resultadoMap.get(p.partidoId);
    if (!resultado || resultado.golesLocal === null || resultado.golesVisitante === null) {
      continue; // match not played yet
    }

    const { points } = calcularPuntos(
      p.golesLocal,
      p.golesVisitante,
      resultado.golesLocal,
      resultado.golesVisitante
    );

    const entry = puntajeMap.get(p.email);
    if (entry) {
      entry.puntos += points;
      if (points > 0) entry.acertados++;
    } else {
      // User exists in pronosticos but not in jugadores (edge case)
      puntajeMap.set(p.email, {
        nombre: p.email,
        puntos: points,
        acertados: points > 0 ? 1 : 0,
      });
    }
  }

  const ranking = Array.from(puntajeMap.entries())
    .map(([email, data]) => ({ email, ...data }))
    .sort((a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre));

  return NextResponse.json({ ranking });
}
