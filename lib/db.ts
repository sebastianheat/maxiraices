import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

// Cliente Neon crudo (tagged templates) — usado por la capa de usuarios/auth.
const client = url ? neon(url) : null;
export const sqlClient = client;

// Si Neon está conectado (DATABASE_URL presente) usamos Postgres real.
// Si no, `db` es null y la capa de datos cae al dataset demo.
export const db = client ? drizzle(client, { schema }) : null;

export const hasDb = Boolean(url);
