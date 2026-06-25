import KpiCard from "@/components/KpiCard";
import PageHeader from "@/components/PageHeader";
import { FlujoCajaChart, IngresosEgresosChart } from "@/components/Charts";
import { serieMensual, margenesPorCultivo, origenDatos } from "@/lib/data";
import { clp, clpCompacto } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Financiero() {
  const [serie, margenes, origen] = await Promise.all([
    serieMensual(),
    margenesPorCultivo(),
    origenDatos(),
  ]);

  const ingresos = serie.reduce((a, m) => a + m.ingresos, 0);
  const egresos = serie.reduce((a, m) => a + m.egresos, 0);
  const utilidad = ingresos - egresos;
  const margen = ingresos ? (utilidad / ingresos) * 100 : 0;

  // Flujo de caja acumulado.
  let acc = 0;
  const flujo = serie.map((m) => {
    acc += m.ingresos - m.egresos;
    return { mes: m.mes, acumulado: acc };
  });

  const margenesOrden = [...margenes].sort((a, b) => b.margen - a.margen);

  return (
    <>
      <PageHeader titulo="Módulo Financiero" subtitulo="Ingresos, egresos, flujo de caja y márgenes" origen={origen} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard titulo="Ingresos (año)" valor={clpCompacto(ingresos)} />
        <KpiCard titulo="Egresos (año)" valor={clpCompacto(egresos)} />
        <KpiCard titulo="Utilidad neta" valor={clpCompacto(utilidad)} hint={`margen ${margen.toFixed(0)}%`} />
        <KpiCard titulo="Margen neto" valor={`${margen.toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Ingresos vs. Egresos por mes</h2>
          <IngresosEgresosChart data={serie} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Flujo de caja acumulado</h2>
          <FlujoCajaChart data={flujo} />
        </div>
      </div>

      <div className="card p-5 mt-4">
        <h2 className="text-sm font-semibold mb-4">Márgenes por cultivo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                <th className="py-2 font-medium">Cultivo</th>
                <th className="py-2 font-medium text-right">Ingresos</th>
                <th className="py-2 font-medium text-right">Costos</th>
                <th className="py-2 font-medium text-right">Margen</th>
                <th className="py-2 font-medium text-right">% Margen</th>
              </tr>
            </thead>
            <tbody>
              {margenesOrden.map((m) => {
                const pctMargen = m.ingresos ? (m.margen / m.ingresos) * 100 : 0;
                return (
                  <tr key={m.cultivo} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 font-medium">{m.cultivo}</td>
                    <td className="py-2.5 text-right">{clp(m.ingresos)}</td>
                    <td className="py-2.5 text-right text-[var(--muted)]">{clp(m.costos)}</td>
                    <td className={`py-2.5 text-right font-medium ${m.margen >= 0 ? "text-brand-700" : "text-red-600"}`}>
                      {clp(m.margen)}
                    </td>
                    <td className="py-2.5 text-right">{pctMargen.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
