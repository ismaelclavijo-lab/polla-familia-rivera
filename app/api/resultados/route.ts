import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getResultados } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const resultados = await getResultados();
  return NextResponse.json({ resultados });
}
