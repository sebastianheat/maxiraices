import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import {
  signToken,
  COOKIE_NAME,
  SESSION_MAX_AGE,
  type SessionPayload,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Servidor sin AUTH_SECRET." }, { status: 500 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Ingresa correo y clave." }, { status: 400 });
  }

  const user = await getUserByEmail(email).catch(() => null);
  if (!user || !user.activo || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
  }

  const payload: SessionPayload = {
    uid: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const token = await signToken(payload, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
