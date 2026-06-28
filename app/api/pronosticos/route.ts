import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPronosticos, upsertPronostico, getResultadoByPartidoId, query } from "@/lib/db";
import { getPartidoById } from "@/lib/partidos-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const pronosticos = await getPronosticos(session.email);
  return NextResponse.json({ pronosticos });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { partidoId, golesLocal, golesVisitante } = await req.json();

  if (!partidoId || golesLocal === undefined || golesVisitante === undefined) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  if (golesLocal < 0 || golesVisitante < 0 || golesLocal > 30 || golesVisitante > 30) {
    return NextResponse.json({ error: "Marcador inválido" }, { status: 400 });
  }

  // Look up partido in hardcoded list OR partidos_extra DB
  let fechaUTC: string | null = null;
  const hardcoded = getPartidoById(partidoId);
  if (hardcoded) {
    fechaUTC = hardcoded.fechaUTC;
  } else {
    const rows = await query<{ fecha_utc: string }>(
      "SELECT fecha_utc FROM partidos_extra WHERE id = $1", [partidoId]
    );
    if (rows[0]) fechaUTC = rows[0].fecha_utc;
  }

  if (!fechaUTC) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  // Check if match is locked (started)
  const ahora = new Date();
  const fechaPartido = new Date(fechaUTC);
  if (ahora >= fechaPartido) {
    return NextResponse.json(
      { error: "El partido ya comenzó, no puedes modificar tu pronóstico" },
      { status: 403 }
    );
  }

  await upsertPronostico(session.email, partidoId, golesLocal, golesVisitante);

  return NextResponse.json({ ok: true });
}
