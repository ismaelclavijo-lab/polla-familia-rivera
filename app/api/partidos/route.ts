import { NextResponse } from "next/server";
import { PARTIDOS } from "@/lib/partidos-data";
import { getResultados } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const resultados = await getResultados();
  const resultadoMap = new Map(resultados.map((r) => [r.partidoId, r]));

  const partidos = PARTIDOS.map((p) => {
    const r = resultadoMap.get(p.id);
    const ahora = new Date();
    const fechaPartido = new Date(p.fechaUTC);
    const cerradoPorTiempo = ahora >= fechaPartido;

    return {
      ...p,
      golesLocal: r?.golesLocal ?? null,
      golesVisitante: r?.golesVisitante ?? null,
      cerrado: r?.cerrado ?? cerradoPorTiempo,
      terminado: r?.golesLocal !== null && r?.golesVisitante !== null,
    };
  });

  return NextResponse.json({ partidos });
}
