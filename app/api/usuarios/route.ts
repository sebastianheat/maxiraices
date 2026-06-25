import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listUsers, createUser, getUserByEmail, ROLES } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const email = (body.email ?? "").trim();
  const nombre = (body.nombre ?? "").trim();
  const rol = body.rol ?? "ejecutivo";
  const password = body.password ?? "";

  if (!email || !nombre || !password) {
    return NextResponse.json({ error: "Completa nombre, correo y clave." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "La clave debe tener al menos 4 caracteres." }, { status: 400 });
  }
  if (!ROLES.includes(rol)) {
    return NextResponse.json({ error: "Rol inválido." }, { status: 400 });
  }
  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
  }

  const user = await createUser({ email, nombre, rol, password });
  return NextResponse.json({ user }, { status: 201 });
}
