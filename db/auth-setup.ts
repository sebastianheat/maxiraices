/**
 * Crea la tabla `usuarios` (si no existe) y asegura el usuario administrador.
 * Idempotente: no borra datos existentes.
 *
 * Uso:  DATABASE_URL="postgres://..."  npm run auth:setup
 *
 * El admin inicial se puede sobreescribir con variables de entorno:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE
 */
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "../lib/password";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}
const sql = neon(url);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "Agricolavallesdelmaule@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "123456";
const ADMIN_NOMBRE = process.env.ADMIN_NOMBRE ?? "Maximiliano";

async function main() {
  console.log("→ Creando tabla usuarios (si no existe)…");
  await sql`create table if not exists usuarios (
    id serial primary key,
    email text unique not null,
    nombre text not null,
    rol text not null default 'ejecutivo',
    password_hash text not null,
    activo boolean not null default true,
    created_at timestamptz not null default now()
  )`;

  const hash = hashPassword(ADMIN_PASSWORD);

  // Inserta el admin; si ya existe (por email), no pisa su clave actual.
  const res = await sql`
    insert into usuarios (email, nombre, rol, password_hash)
    values (${ADMIN_EMAIL}, ${ADMIN_NOMBRE}, 'admin', ${hash})
    on conflict (email) do nothing
    returning id
  `;

  if (res.length) {
    console.log(`✓ Administrador creado: ${ADMIN_EMAIL} (clave inicial: ${ADMIN_PASSWORD})`);
  } else {
    // Ya existía: nos aseguramos de que tenga rol admin y esté activo.
    await sql`update usuarios set rol = 'admin', activo = true where lower(email) = lower(${ADMIN_EMAIL})`;
    console.log(`• El usuario ${ADMIN_EMAIL} ya existía. Se confirmó rol admin y activo (clave sin cambios).`);
  }

  console.log("✓ Listo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
