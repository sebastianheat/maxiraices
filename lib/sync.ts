import * as XLSX from "xlsx";
import { downloadXlsx } from "./drive";
import { db, sqlClient } from "./db";
import { gastos } from "./schema";

// ---------------------------------------------------------------------------
// Motor de sincronización Drive → Neon.
// Piloto: "2. PLANILLA GASTOS", hoja BBDD (maestra limpia, ~1.250 registros).
// Diseñado para extenderse: agregar más fuentes = agregar más funciones map/upsert.
// ---------------------------------------------------------------------------

const GASTOS_FILE_ID = "1hRddc_rO0ckt6TFmCLsVl1wDBr1NyIvA";
const GASTOS_SHEET = "BBDD";
const GASTOS_FUENTE = "2. PLANILLA GASTOS · BBDD";

// Serial de Excel → 'YYYY-MM-DD' (base 1899-12-30).
function excelDateToISO(v: unknown): string | null {
  if (typeof v === "number" && v > 59) {
    const ms = Math.round((v - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }
  if (typeof v === "string") {
    const s = v.trim();
    // dd/mm/yyyy o dd-mm-yyyy
    const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (m) {
      const [, d, mo, y] = m;
      const yy = y.length === 2 ? "20" + y : y;
      return `${yy}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    const iso = s.match(/^\d{4}-\d{2}-\d{2}/);
    if (iso) return s.slice(0, 10);
  }
  return null;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return isFinite(n) ? n : NaN;
}

function toInt(v: unknown): number | null {
  const n = parseInt(String(v ?? "").replace(/[^0-9-]/g, ""), 10);
  return isFinite(n) ? n : null;
}

function str(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

async function ensureTables() {
  if (!sqlClient) throw new Error("Sin base de datos.");
  await sqlClient`create table if not exists gastos (
    id serial primary key,
    fecha date, mes integer, semana integer,
    item text, area text, proyecto text, comprador text,
    centro_costo text, tipo_doc text, n_doc text, proveedor text,
    detalle text, total numeric(14,2),
    banco text, medio_pago text, quien_pago text, solicitante text
  )`;
  await sqlClient`create table if not exists sync_log (
    id serial primary key,
    fuente text not null,
    estado text not null,
    origen text,
    filas integer not null default 0,
    mensaje text,
    iniciado timestamptz not null default now(),
    finalizado timestamptz
  )`;
}

type GastoRow = typeof gastos.$inferInsert;

function mapGastos(rows: unknown[][]): GastoRow[] {
  const header = (rows[0] ?? []).map((h) => String(h).trim().toUpperCase());
  const find = (...alts: string[]) =>
    header.findIndex((h) => alts.some((a) => h === a));

  const c = {
    fecha: find("FECHA"),
    mes: find("MES"),
    semana: find("SEMANA"),
    item: find("ITEM"),
    area: find("SUBITEM"),
    proyecto: find("PROYECTO"),
    comprador: find("COMPRADOR"),
    centro: find("CENTRO DE COSTO INTERNO", "CENTRO DE COSTO IN", "CENTRO DE COSTO"),
    tipoDoc: find("TIPO DOC", "TIPO DE DOCUMENTO"),
    nDoc: find("Nº DOCUMENTO", "N° DOCUMENTO", "NÚMERO DOCUMENTO"),
    proveedor: find("PROVEEDOR"),
    detalle: find("DETALLE"),
    total: find("TOTAL", "MONTO TOTAL", "MONTO"),
    banco: find("BANCO"),
    medio: find("MEDIO DE PAGO"),
    quien: find("QUIÉN PAGÓ", "QUIEN PAGO"),
    solicitante: find("SOLICITANTE"),
  };

  const out: GastoRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    const fecha = excelDateToISO(r[c.fecha]);
    const total = toNumber(r[c.total]);
    if (!fecha || !isFinite(total) || total === 0) continue;
    out.push({
      fecha,
      mes: c.mes >= 0 ? toInt(r[c.mes]) : null,
      semana: c.semana >= 0 ? toInt(r[c.semana]) : null,
      item: str(r[c.item]),
      area: str(r[c.area]),
      proyecto: str(r[c.proyecto]),
      comprador: str(r[c.comprador]),
      centroCosto: str(r[c.centro]),
      tipoDoc: str(r[c.tipoDoc]),
      nDoc: str(r[c.nDoc]),
      proveedor: str(r[c.proveedor]),
      detalle: str(r[c.detalle]),
      total: total.toFixed(2),
      banco: str(r[c.banco]),
      medioPago: str(r[c.medio]),
      quienPago: str(r[c.quien]),
      solicitante: str(r[c.solicitante]),
    });
  }
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

export type SyncResult = { ok: boolean; filas: number; fuente: string; mensaje?: string };

export async function runSync(origen: "manual" | "cron" = "manual"): Promise<SyncResult> {
  if (!db || !sqlClient) throw new Error("Base de datos no disponible (falta DATABASE_URL).");
  await ensureTables();
  const iniciado = new Date().toISOString();

  try {
    const buf = await downloadXlsx(GASTOS_FILE_ID);
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[GASTOS_SHEET];
    if (!ws) throw new Error(`No se encontró la hoja "${GASTOS_SHEET}".`);
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      blankrows: false,
      defval: "",
    });
    const records = mapGastos(rows);

    // Refresco completo desde la maestra (idempotente).
    await sqlClient`delete from gastos`;
    for (const c of chunk(records, 400)) {
      await db.insert(gastos).values(c);
    }

    await sqlClient`insert into sync_log (fuente, estado, origen, filas, mensaje, iniciado, finalizado)
      values (${GASTOS_FUENTE}, 'ok', ${origen}, ${records.length},
              ${"Sincronización correcta"}, ${iniciado}, now())`;
    return { ok: true, filas: records.length, fuente: GASTOS_FUENTE };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sqlClient`insert into sync_log (fuente, estado, origen, filas, mensaje, iniciado, finalizado)
      values (${GASTOS_FUENTE}, 'error', ${origen}, 0, ${msg}, ${iniciado}, now())`;
    throw e;
  }
}

export type UltimaSync = {
  estado: string;
  origen: string | null;
  filas: number;
  mensaje: string | null;
  finalizado: string | null;
} | null;

export async function ultimaSync(): Promise<UltimaSync> {
  if (!sqlClient) return null;
  try {
    const rows = (await sqlClient`
      select estado, origen, filas, mensaje, finalizado
      from sync_log order by id desc limit 1
    `) as UltimaSync[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
