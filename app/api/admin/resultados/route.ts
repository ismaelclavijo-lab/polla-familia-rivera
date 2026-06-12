import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

const ADMIN_EMAILS = ["ismael.clavijo@xiy.com.ec"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !ADMIN_EMAILS.includes(session.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { partidoId, golesLocal, golesVisitante, cerrado } = await req.json();

  if (!partidoId || golesLocal === undefined || golesVisitante === undefined) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  await query(
    `INSERT INTO resultados (partido_id, goles_local, goles_visitante, cerrado)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (partido_id)
     DO UPDATE SET goles_local = $2, goles_visitante = $3, cerrado = $4`,
    [partidoId, golesLocal, golesVisitante, cerrado ?? false]
  );

  return NextResponse.json({ ok: true });
}
