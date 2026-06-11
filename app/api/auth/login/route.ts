import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getJugadorByEmail } from "@/lib/db";
import { createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const jugador = await getJugadorByEmail(email.toLowerCase().trim());
    if (!jugador) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, jugador.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const token = await createSession({ email: jugador.email, nombre: jugador.nombre });

    const res = NextResponse.json({ ok: true, nombre: jugador.nombre });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
