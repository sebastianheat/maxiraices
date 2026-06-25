import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

// Si Neon está conectado (DATABASE_URL presente) usamos Postgres real.
// Si no, `db` es null y la capa de datos cae al dataset demo.
export const db = url ? drizzle(neon(url), { schema }) : null;

export const hasDb = Boolean(url);
