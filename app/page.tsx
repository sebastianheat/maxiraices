import KpiCard from "@/components/KpiCard";
import PageHeader from "@/components/PageHeader";
import { ComparativoChart, IngresosEgresosChart } from "@/components/Charts";
import {
  serieMensual,
  ingresosAnioAnterior,
  margenesPorCultivo,
  produccionActual,
  origenDatos,
} from "@/lib/data";
import { clp, clpCompacto, pct } from "@/lib/format";
import { MESES } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [serie, margenes, prod, origen] = await Promise.all([
    serieMensual(),
    margenesPorCultivo(),
    produccionActual(),
    origenDatos(),
  ]);
  const anterior = ingresosAnioAnterior();

  // Mes actual (acotado al rango disponible).
  const hoy = new Date();
  const idx = Math.min(hoy.getMonth(), serie.length - 1);
  const mesNombre = MESES[idx] ?? serie[idx]?.mes ?? "";

  const ingresosMes = serie[idx]?.ingresos ?? 0;
  const egresosMes = serie[idx]?.egresos ?? 0;
  const utilidadMes = ingresosMes - egresosMes;
  const ingAnt = anterior[idx] ?? ingresosMes;
  const deltaIngresos = ingAnt ? ((ingresosMes - ingAnt) / ingAnt) * 100 : 0;
  const margenMes = ingresosMes ? (utilidadMes / ingresosMes) * 100 : 0;

  // YTD
  const ytdIngresos = serie.slice(0, idx + 1).reduce((a, m) => a + m.ingresos, 0);
  const ytdEgresos = serie.slice(0, idx + 1).reduce((a, m) => a + m.egresos, 0);
  const ytdUtilidad = ytdIngresos - ytdEgresos;

  const comparativo = serie.map((m, i) => ({
    mes: m.mes,
    actual: m.ingresos,
    anterior: anterior[i] ?? 0,
  }));

  // Alertas automáticas.
  const alertas: { nivel: "alta" | "media"; texto: string }[] = [];
  if (utilidadMes < 0)
    alertas.push({ nivel: "alta", texto: `Utilidad negativa en ${mesNombre}: ${clp(utilidadMes)} (mes de baja temporada).` });
  margenes.forEach((m) => {
    if (m.margen <= 0)
      alertas.push({ nivel: "alta", texto: `Margen ajustado en ${m.cultivo}: ${clp(m.margen)}.` });
  });
  prod.forEach((p) => {
    if (p.cumplimiento < 95)
      alertas.push({ nivel: "media", texto: `Producción de ${p.cultivo} bajo lo estimado (${p.cumplimiento.toFixed(0)}%).` });
  });
  if (deltaIngresos > 5)
    alertas.push({ nivel: "media", texto: `Ingresos de ${mesNombre} ${pct(deltaIngresos)} vs. año anterior. 👍` });

  return (
    <>
      <PageHeader
        titulo="Resumen Gerencial"
        subtitulo={`Vista ejecutiva · ${mesNombre} ${hoy.getFullYear()}`}
        origen={origen}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard titulo={`Ingresos ${mesNombre}`} valor={clpCompacto(ingresosMes)} delta={deltaIngresos} hint="vs. año anterior" />
        <KpiCard titulo={`Egresos ${mesNombre}`} valor={clpCompacto(egresosMes)} hint="del mes" />
        <KpiCard titulo={`Utilidad ${mesNombre}`} valor={clpCompacto(utilidadMes)} hint={`margen ${margenMes.toFixed(0)}%`} />
        <KpiCard titulo="Utilidad acumulada (YTD)" valor={clpCompacto(ytdUtilidad)} hint={`ingresos ${clpCompacto(ytdIngresos)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Ingresos vs. Egresos — {hoy.getFullYear()}</h2>
          <IngresosEgresosChart data={serie} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Ingresos: año actual vs. anterior</h2>
          <ComparativoChart data={comparativo} />
        </div>
      </div>

      <div className="card p-5 mt-4">
        <h2 className="text-sm font-semibold mb-4">Alertas</h2>
        {alertas.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Sin alertas. Todos los indicadores dentro de rango.</p>
        ) : (
          <ul className="space-y-2">
            {alertas.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-0.5 inline-block h-2 w-2 rounded-full shrink-0 ${
                    a.nivel === "alta" ? "bg-red-500" : "bg-amber-500"
                  }`}
                />
                <span>{a.texto}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
