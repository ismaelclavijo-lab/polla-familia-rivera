/**
 * Scoring rules for Polla Mundialista Familia Rivera Arcos
 *
 * Exact score:              5 pts
 * Correct goal difference:  3 pts  (same diff, different goals)
 * Correct winner / draw:    2 pts  (correct result, wrong diff)
 * Wrong:                    0 pts
 */

export interface ScoreResult {
  points: number;
  label: "exact" | "diff" | "winner" | "miss";
}

export function calcularPuntos(
  predLocal: number,
  predVisitante: number,
  realLocal: number,
  realVisitante: number
): ScoreResult {
  if (predLocal === realLocal && predVisitante === realVisitante) {
    return { points: 5, label: "exact" };
  }

  const predDiff = predLocal - predVisitante;
  const realDiff = realLocal - realVisitante;

  if (predDiff === realDiff) {
    return { points: 3, label: "diff" };
  }

  const predResult = Math.sign(predDiff);
  const realResult = Math.sign(realDiff);

  if (predResult === realResult) {
    return { points: 2, label: "winner" };
  }

  return { points: 0, label: "miss" };
}

export const POINTS_LABELS = {
  exact: { text: "Marcador exacto", color: "text-green-400" },
  diff: { text: "Diferencia correcta", color: "text-blue-400" },
  winner: { text: "Ganador correcto", color: "text-yellow-400" },
  miss: { text: "Fallo", color: "text-red-400" },
};
