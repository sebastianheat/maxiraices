/**
 * Crea las tablas y carga datos demo en Neon.
 * Uso:  DATABASE_URL="postgres://..."  npm run db:seed
 *
 * Una vez conectada la integración de Neon en Vercel, corre este script
 * (local o desde un job) para poblar la base. Más adelante, el ETL desde
 * los Excel reemplazará estos inserts.
 */
import { neon } from "@neondatabase/serverless";
import * as demo from "../lib/demo";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL. Ej: DATABASE_URL='postgres://...' npm run db:seed");
  process.exit(1);
}

const sql = neon(url);
const AÑO = 2026;
const mesNum = (m: string) => demo.MESES.indexOf(m) + 1;

async function main() {
  console.log("→ Creando tablas…");
  await sql`drop table if exists movimientos, temporadas, produccion, costos, personal`;

  await sql`create table movimientos (
    id serial primary key,
    fecha date not null,
    tipo text not null,
    categoria text not null,
    cultivo text,
    monto numeric(14,2) not null,
    descripcion text
  )`;
  await sql`create table temporadas (
    id serial primary key,
    nombre text not null,
    cultivo text not null,
    estado text not null,
    fecha_inicio date not null,
    fecha_fin date
  )`;
  await sql`create table produccion (
    id serial primary key,
    temporada text not null,
    cultivo text not null,
    unidad text not null,
    estimado numeric(14,2) not null,
    real numeric(14,2) not null
  )`;
  await sql`create table costos (
    id serial primary key,
    fecha date not null,
    area text not null,
    faena text not null,
    monto numeric(14,2) not null
  )`;
  await sql`create table personal (
    id serial primary key,
    fecha date not null,
    cuadrilla text not null,
    trabajadores integer not null,
    horas numeric(10,1) not null
  )`;

  console.log("→ Cargando movimientos…");
  for (const m of demo.movimientosMensuales) {
    const mm = String(mesNum(m.mes)).padStart(2, "0");
    const fecha = `${AÑO}-${mm}-15`;
    await sql`insert into movimientos (fecha, tipo, categoria, monto, descripcion)
      values (${fecha}, 'ingreso', 'Ventas', ${m.ingresos}, ${"Ingresos " + m.mes})`;
    await sql`insert into movimientos (fecha, tipo, categoria, monto, descripcion)
      values (${fecha}, 'egreso', 'Operación', ${m.egresos}, ${"Egresos " + m.mes})`;
  }
  // Movimientos por cultivo (para márgenes)
  for (const c of demo.margenesPorCultivo) {
    await sql`insert into movimientos (fecha, tipo, categoria, cultivo, monto, descripcion)
      values (${`${AÑO}-02-15`}, 'ingreso', 'Ventas', ${c.cultivo}, ${c.ingresos}, ${"Venta " + c.cultivo})`;
    await sql`insert into movimientos (fecha, tipo, categoria, cultivo, monto, descripcion)
      values (${`${AÑO}-02-15`}, 'egreso', 'Costo cultivo', ${c.cultivo}, ${c.costos}, ${"Costo " + c.cultivo})`;
  }

  console.log("→ Cargando temporadas…");
  for (const t of demo.temporadasDemo) {
    await sql`insert into temporadas (nombre, cultivo, estado, fecha_inicio, fecha_fin)
      values (${t.nombre}, ${t.cultivo}, ${t.estado}, ${t.inicio}, ${t.fin})`;
  }

  console.log("→ Cargando producción…");
  for (const p of demo.produccionDemo) {
    await sql`insert into produccion (temporada, cultivo, unidad, estimado, real)
      values (${p.cultivo + " 2025-26"}, ${p.cultivo}, ${p.unidad}, ${p.estimado}, ${p.real})`;
  }

  console.log("→ Cargando costos…");
  for (const f of demo.costosPorFaena) {
    await sql`insert into costos (fecha, area, faena, monto)
      values (${`${AÑO}-01-31`}, 'Campo', ${f.faena}, ${f.monto})`;
  }

  console.log("→ Cargando personal…");
  for (const q of demo.cuadrillasDemo) {
    await sql`insert into personal (fecha, cuadrilla, trabajadores, horas)
      values (${`${AÑO}-01-20`}, ${q.cuadrilla}, ${q.trabajadores}, ${q.horas})`;
  }

  console.log("✓ Seed completo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
