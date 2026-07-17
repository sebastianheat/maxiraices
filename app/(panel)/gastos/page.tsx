import KpiCard from "@/components/KpiCard";
import PageHeader from "@/components/PageHeader";
import { GastoMesChart, BarrasHorizontales, CostosPieChart } from "@/components/Charts";
import { resumenGastos } from "@/lib/gastos";
import { clp, clpCompacto, num } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GastosPage() {
  const g = await resumenGastos();

  return (
    <>
      <PageHeader
        titulo="Gastos"
        subtitulo="Datos reales sincronizados desde el Drive · Planilla Gastos (BBDD)"
        origen={g.hayDatos ? "neon" : "demo"}
      />

      {!g.hayDatos ? (
        <div className="card p-8 text-center">
          <div className="text-3xl mb-3">📥</div>
          <h2 className="text-lg font-semibold mb-1">Aún no hay datos sincronizados</h2>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
            Presiona <strong>Actualizar</strong> arriba para traer los gastos desde el Drive,
            o espera la sincronización automática de las 23:59.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard titulo="Gasto total" valor={clpCompacto(g.total)} hint={`${num(g.registros)} registros`} />
            <KpiCard titulo={`Gasto ${g.etiquetaMes}`} valor={clpCompacto(g.gastoMes)} hint="último mes con datos" />
            <KpiCard titulo="Proyectos / fundos" valor={String(g.proyectos)} hint="con gasto registrado" />
            <KpiCard titulo="Registros" valor={num(g.registros)} hint="movimientos de gasto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold mb-4">Gasto por mes</h2>
              <GastoMesChart data={g.porMes} />
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold mb-4">Top proyectos / fundos por gasto</h2>
              <BarrasHorizontales data={g.porProyecto} color="#15803d" />
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold mb-4">Gasto por área</h2>
              <CostosPieChart data={g.porArea.map((a) => ({ faena: a.etiqueta, monto: a.total }))} />
            </div>

            <div className="card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold mb-4">Gasto por centro de costo</h2>
              <BarrasHorizontales data={g.porCentro} color="#0ea5e9" />
            </div>
          </div>

          <p className="text-xs text-[var(--muted)] mt-4">
            Fuente: carpeta Drive del holding · hoja BBDD de “2. PLANILLA GASTOS”. Los montos son
            los registrados en la planilla maestra (histórico completo).
          </p>
        </>
      )}
    </>
  );
}
