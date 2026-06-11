import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createJugador, getJugadorByEmail, initDB } from "@/lib/db";
import { createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, nombre, password } = await req.json();

    if (!email || !nombre || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    await initDB();
    const existing = await getJugadorByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await createJugador(email.toLowerCase().trim(), nombre.trim(), passwordHash);

    const token = await createSession({ email: email.toLowerCase().trim(), nombre: nombre.trim() });

    const res = NextResponse.json({ ok: true, nombre: nombre.trim() });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
