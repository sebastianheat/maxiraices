import { sqlClient } from "./db";
import { hashPassword } from "./password";

export type Usuario = {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  created_at: string;
};

export type UsuarioConHash = Usuario & { password_hash: string };

export const ROLES = ["admin", "ejecutivo"] as const;
export type Rol = (typeof ROLES)[number];

export const ROL_LABEL: Record<string, string> = {
  admin: "Administrador",
  ejecutivo: "Ejecutivo comercial",
};

function db() {
  if (!sqlClient) throw new Error("Base de datos no disponible (falta DATABASE_URL).");
  return sqlClient;
}

export async function getUserByEmail(email: string): Promise<UsuarioConHash | null> {
  const rows = (await db()`
    select id, email, nombre, rol, activo, created_at, password_hash
    from usuarios where lower(email) = lower(${email}) limit 1
  `) as UsuarioConHash[];
  return rows[0] ?? null;
}

export async function listUsers(): Promise<Usuario[]> {
  return (await db()`
    select id, email, nombre, rol, activo, created_at
    from usuarios order by created_at asc
  `) as Usuario[];
}

export async function createUser(input: {
  email: string;
  nombre: string;
  rol: string;
  password: string;
}): Promise<Usuario> {
  const hash = hashPassword(input.password);
  const rows = (await db()`
    insert into usuarios (email, nombre, rol, password_hash)
    values (${input.email.trim()}, ${input.nombre.trim()}, ${input.rol}, ${hash})
    returning id, email, nombre, rol, activo, created_at
  `) as Usuario[];
  return rows[0];
}

export async function updateUser(
  id: number,
  fields: { nombre?: string; rol?: string; activo?: boolean; password?: string },
): Promise<void> {
  const c = db();
  if (fields.nombre !== undefined)
    await c`update usuarios set nombre = ${fields.nombre} where id = ${id}`;
  if (fields.rol !== undefined)
    await c`update usuarios set rol = ${fields.rol} where id = ${id}`;
  if (fields.activo !== undefined)
    await c`update usuarios set activo = ${fields.activo} where id = ${id}`;
  if (fields.password)
    await c`update usuarios set password_hash = ${hashPassword(fields.password)} where id = ${id}`;
}

export async function deleteUser(id: number): Promise<void> {
  await db()`delete from usuarios where id = ${id}`;
}

export async function countUsers(): Promise<number> {
  const rows = (await db()`select count(*)::int as n from usuarios`) as { n: number }[];
  return rows[0]?.n ?? 0;
}
