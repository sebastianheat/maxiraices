import KpiCard from "@/components/KpiCard";
import PageHeader from "@/components/PageHeader";
import { ProduccionChart, CostosPieChart } from "@/components/Charts";
import {
  produccionActual,
  costosPorFaena,
  listaTemporadas,
  listaCuadrillas,
  origenDatos,
} from "@/lib/data";
import { clpCompacto, num } from "@/lib/format";

export const dynamic = "force-dynamic";

const ESTADO_COLOR: Record<string, string> = {
  activa: "bg-brand-100 text-brand-700",
  planificada: "bg-sky-100 text-sky-700",
  cerrada: "bg-gray-100 text-gray-600",
};

export default async function Operativo() {
  const [prod, faenas, temporadas, cuadrillas, origen] = await Promise.all([
    produccionActual(),
    costosPorFaena(),
    listaTemporadas(),
    listaCuadrillas(),
    origenDatos(),
  ]);

  const realTotal = prod.reduce((a, p) => a + p.real, 0);
  const estimadoTotal = prod.reduce((a, p) => a + p.estimado, 0);
  const cumplimiento = estimadoTotal ? (realTotal / estimadoTotal) * 100 : 0;
  const activas = temporadas.filter((t) => t.estado === "activa").length;
  const trabajadores = cuadrillas.reduce((a, c) => a + c.trabajadores, 0);
  const costoTotal = faenas.reduce((a, f) => a + f.monto, 0);

  return (
    <>
      <PageHeader titulo="Módulo Operativo" subtitulo="Producción, costos, temporadas y personal" origen={origen} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard titulo="Producción real" valor={`${num(realTotal)} ton`} hint={`estimado ${num(estimadoTotal)} ton`} />
        <KpiCard titulo="Cumplimiento" valor={`${cumplimiento.toFixed(0)}%`} hint="real vs. estimado" />
        <KpiCard titulo="Temporadas activas" valor={String(activas)} hint={`${temporadas.length} en total`} />
        <KpiCard titulo="Personal activo" valor={String(trabajadores)} hint={`${cuadrillas.length} cuadrillas`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Producción estimada vs. real (ton)</h2>
          <ProduccionChart data={prod} />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">
            Costos operacionales por faena · {clpCompacto(costoTotal)}
          </h2>
          <CostosPieChart data={faenas} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Temporadas / campañas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="py-2 font-medium">Temporada</th>
                  <th className="py-2 font-medium">Cultivo</th>
                  <th className="py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {temporadas.map((t) => (
                  <tr key={t.nombre} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 font-medium">{t.nombre}</td>
                    <td className="py-2.5 text-[var(--muted)]">{t.cultivo}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ESTADO_COLOR[t.estado] ?? "bg-gray-100 text-gray-600"}`}>
                        {t.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Cuadrillas (personal y horas)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="py-2 font-medium">Cuadrilla</th>
                  <th className="py-2 font-medium text-right">Trabajadores</th>
                  <th className="py-2 font-medium text-right">Horas</th>
                </tr>
              </thead>
              <tbody>
                {cuadrillas.map((c) => (
                  <tr key={c.cuadrilla} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 font-medium">{c.cuadrilla}</td>
                    <td className="py-2.5 text-right">{c.trabajadores}</td>
                    <td className="py-2.5 text-right">{num(c.horas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
