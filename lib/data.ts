import { db } from "./db";
import { movimientos, costos, produccion, temporadas, personal } from "./schema";
import { sql } from "drizzle-orm";
import * as demo from "./demo";

// ---------------------------------------------------------------------------
// Capa de acceso a datos.
// Cada función intenta leer de Neon (si hay DATABASE_URL); ante cualquier
// problema o ausencia de DB, cae al dataset demo. Así el dashboard SIEMPRE
// renderiza, esté o no conectada la base.
// ---------------------------------------------------------------------------

export type SerieMensual = { mes: string; ingresos: number; egresos: number };
export type Margen = { cultivo: string; ingresos: number; costos: number; margen: number };
export type ProduccionItem = { cultivo: string; unidad: string; estimado: number; real: number; cumplimiento: number };
export type Faena = { faena: string; monto: number };
export type Temporada = { nombre: string; cultivo: string; estado: string; inicio: string; fin: string | null };
export type Cuadrilla = { cuadrilla: string; trabajadores: number; horas: number };

export type Origen = "neon" | "demo";

export async function origenDatos(): Promise<Origen> {
  if (!db) return "demo";
  try {
    await db.execute(sql`select 1`);
    return "neon";
  } catch {
    return "demo";
  }
}

export async function serieMensual(): Promise<SerieMensual[]> {
  if (db) {
    try {
      const rows = await db
        .select({
          mes: sql<string>`to_char(${movimientos.fecha}, 'Mon')`,
          mnum: sql<number>`extract(month from ${movimientos.fecha})`,
          ingresos: sql<number>`coalesce(sum(case when ${movimientos.tipo} = 'ingreso' then ${movimientos.monto} else 0 end), 0)`,
          egresos: sql<number>`coalesce(sum(case when ${movimientos.tipo} = 'egreso' then ${movimientos.monto} else 0 end), 0)`,
        })
        .from(movimientos)
        .groupBy(sql`1, 2`)
        .orderBy(sql`2`);
      if (rows.length) {
        return rows.map((r) => ({
          mes: demo.MESES[Number(r.mnum) - 1] ?? r.mes,
          ingresos: Number(r.ingresos),
          egresos: Number(r.egresos),
        }));
      }
    } catch {
      /* cae a demo */
    }
  }
  return demo.movimientosMensuales;
}

export async function margenesPorCultivo(): Promise<Margen[]> {
  // Demo: ya viene con ingresos y costos por cultivo.
  if (db) {
    try {
      const rows = await db
        .select({
          cultivo: movimientos.cultivo,
          ingresos: sql<number>`coalesce(sum(case when ${movimientos.tipo} = 'ingreso' then ${movimientos.monto} else 0 end), 0)`,
          costos: sql<number>`coalesce(sum(case when ${movimientos.tipo} = 'egreso' then ${movimientos.monto} else 0 end), 0)`,
        })
        .from(movimientos)
        .where(sql`${movimientos.cultivo} is not null`)
        .groupBy(movimientos.cultivo);
      if (rows.length) {
        return rows.map((r) => ({
          cultivo: r.cultivo ?? "—",
          ingresos: Number(r.ingresos),
          costos: Number(r.costos),
          margen: Number(r.ingresos) - Number(r.costos),
        }));
      }
    } catch {
      /* cae a demo */
    }
  }
  return demo.margenesPorCultivo.map((m) => ({
    ...m,
    margen: m.ingresos - m.costos,
  }));
}

export async function produccionActual(): Promise<ProduccionItem[]> {
  if (db) {
    try {
      const rows = await db
        .select({
          cultivo: produccion.cultivo,
          unidad: produccion.unidad,
          estimado: sql<number>`sum(${produccion.estimado})`,
          real: sql<number>`sum(${produccion.real})`,
        })
        .from(produccion)
        .groupBy(produccion.cultivo, produccion.unidad);
      if (rows.length) {
        return rows.map((r) => {
          const est = Number(r.estimado);
          const real = Number(r.real);
          return {
            cultivo: r.cultivo,
            unidad: r.unidad,
            estimado: est,
            real,
            cumplimiento: est ? (real / est) * 100 : 0,
          };
        });
      }
    } catch {
      /* cae a demo */
    }
  }
  return demo.produccionDemo.map((p) => ({
    ...p,
    cumplimiento: (p.real / p.estimado) * 100,
  }));
}

export async function costosPorFaena(): Promise<Faena[]> {
  if (db) {
    try {
      const rows = await db
        .select({
          faena: costos.faena,
          monto: sql<number>`sum(${costos.monto})`,
        })
        .from(costos)
        .groupBy(costos.faena)
        .orderBy(sql`sum(${costos.monto}) desc`);
      if (rows.length) {
        return rows.map((r) => ({ faena: r.faena, monto: Number(r.monto) }));
      }
    } catch {
      /* cae a demo */
    }
  }
  return demo.costosPorFaena;
}

export async function listaTemporadas(): Promise<Temporada[]> {
  if (db) {
    try {
      const rows = await db
        .select({
          nombre: temporadas.nombre,
          cultivo: temporadas.cultivo,
          estado: temporadas.estado,
          inicio: temporadas.fechaInicio,
          fin: temporadas.fechaFin,
        })
        .from(temporadas)
        .orderBy(temporadas.fechaInicio);
      if (rows.length) return rows as Temporada[];
    } catch {
      /* cae a demo */
    }
  }
  return demo.temporadasDemo;
}

export async function listaCuadrillas(): Promise<Cuadrilla[]> {
  if (db) {
    try {
      const rows = await db
        .select({
          cuadrilla: personal.cuadrilla,
          trabajadores: sql<number>`sum(${personal.trabajadores})`,
          horas: sql<number>`sum(${personal.horas})`,
        })
        .from(personal)
        .groupBy(personal.cuadrilla);
      if (rows.length) {
        return rows.map((r) => ({
          cuadrilla: r.cuadrilla,
          trabajadores: Number(r.trabajadores),
          horas: Number(r.horas),
        }));
      }
    } catch {
      /* cae a demo */
    }
  }
  return demo.cuadrillasDemo;
}

export function ingresosAnioAnterior(): number[] {
  return demo.ingresosAnioAnterior;
}
