import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateUser, deleteUser, listUsers, ROLES } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const fields: { nombre?: string; rol?: string; activo?: boolean; password?: string } = {};

  if (typeof body.nombre === "string" && body.nombre.trim()) fields.nombre = body.nombre.trim();
  if (typeof body.rol === "string") {
    if (!ROLES.includes(body.rol)) return NextResponse.json({ error: "Rol inválido." }, { status: 400 });
    fields.rol = body.rol;
  }
  if (typeof body.activo === "boolean") fields.activo = body.activo;
  if (typeof body.password === "string" && body.password) {
    if (body.password.length < 4)
      return NextResponse.json({ error: "La clave debe tener al menos 4 caracteres." }, { status: 400 });
    fields.password = body.password;
  }

  // Evitar que un admin se quite a sí mismo el rol o se desactive (se quedaría sin acceso).
  if (id === admin.uid && (fields.rol === "ejecutivo" || fields.activo === false)) {
    return NextResponse.json(
      { error: "No puedes quitarte tu propio rol de administrador ni desactivarte." },
      { status: 400 },
    );
  }

  await updateUser(id, fields);
  const users = await listUsers();
  return NextResponse.json({ ok: true, users });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  if (id === admin.uid) {
    return NextResponse.json({ error: "No puedes eliminar tu propio usuario." }, { status: 400 });
  }

  await deleteUser(id);
  const users = await listUsers();
  return NextResponse.json({ ok: true, users });
}
