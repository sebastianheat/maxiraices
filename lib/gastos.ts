import { sqlClient } from "./db";

// Consultas agregadas sobre los gastos reales sincronizados desde el Drive.

export type SerieGasto = { etiqueta: string; total: number };
export type ResumenGastos = {
  total: number;
  registros: number;
  proyectos: number;
  gastoMes: number;
  etiquetaMes: string;
  porMes: SerieGasto[];
  porProyecto: SerieGasto[];
  porCentro: SerieGasto[];
  porArea: SerieGasto[];
  hayDatos: boolean;
};

const MESES_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function etiquetaMes(iso: string): string {
  // iso: 'YYYY-MM-01'
  const [y, m] = iso.split("-");
  return `${MESES_ES[Number(m) - 1]} ${y.slice(2)}`;
}

export async function resumenGastos(): Promise<ResumenGastos> {
  const vacio: ResumenGastos = {
    total: 0, registros: 0, proyectos: 0, gastoMes: 0, etiquetaMes: "",
    porMes: [], porProyecto: [], porCentro: [], porArea: [], hayDatos: false,
  };
  if (!sqlClient) return vacio;

  try {
    const tot = (await sqlClient`
      select coalesce(sum(total),0)::float8 total,
             count(*)::int registros,
             count(distinct proyecto)::int proyectos
      from gastos`) as { total: number; registros: number; proyectos: number }[];

    if (!tot[0] || tot[0].registros === 0) return vacio;

    const mesRows = (await sqlClient`
      select to_char(date_trunc('month', fecha), 'YYYY-MM-01') mes,
             sum(total)::float8 total
      from gastos where fecha is not null
      group by 1 order by 1`) as { mes: string; total: number }[];

    const porMes = mesRows.slice(-12).map((r) => ({
      etiqueta: etiquetaMes(r.mes),
      total: r.total,
    }));
    const ultimo = mesRows[mesRows.length - 1];

    const porProyecto = (await sqlClient`
      select coalesce(proyecto,'(sin proyecto)') etiqueta, sum(total)::float8 total
      from gastos group by 1 order by 2 desc limit 10`) as SerieGasto[];

    const porCentro = (await sqlClient`
      select coalesce(centro_costo,'(sin centro)') etiqueta, sum(total)::float8 total
      from gastos group by 1 order by 2 desc limit 8`) as SerieGasto[];

    const porArea = (await sqlClient`
      select coalesce(area,'(sin área)') etiqueta, sum(total)::float8 total
      from gastos group by 1 order by 2 desc`) as SerieGasto[];

    return {
      total: tot[0].total,
      registros: tot[0].registros,
      proyectos: tot[0].proyectos,
      gastoMes: ultimo?.total ?? 0,
      etiquetaMes: ultimo ? etiquetaMes(ultimo.mes) : "",
      porMes,
      porProyecto,
      porCentro,
      porArea,
      hayDatos: true,
    };
  } catch {
    return vacio;
  }
}
