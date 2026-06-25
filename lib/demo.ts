// Dataset demo determinista para "Agrícola Valles del Maule".
// Se usa cuando no hay DATABASE_URL (Neon) conectada todavía.
// Cifras en CLP. Cultivos típicos del Valle del Maule (Chile).

export const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export const CULTIVOS = ["Cerezas", "Arándanos", "Manzanas", "Uva de mesa"];

// Ingresos y egresos mensuales del año en curso (CLP, en millones reales).
// La temporada de cosecha (verano dic-feb) concentra los ingresos.
export const movimientosMensuales = [
  { mes: "Ene", ingresos: 142_000_000, egresos: 58_000_000 },
  { mes: "Feb", ingresos: 168_000_000, egresos: 61_000_000 },
  { mes: "Mar", ingresos: 96_000_000, egresos: 54_000_000 },
  { mes: "Abr", ingresos: 41_000_000, egresos: 47_000_000 },
  { mes: "May", ingresos: 22_000_000, egresos: 38_000_000 },
  { mes: "Jun", ingresos: 18_000_000, egresos: 36_000_000 },
  { mes: "Jul", ingresos: 15_000_000, egresos: 39_000_000 },
  { mes: "Ago", ingresos: 19_000_000, egresos: 44_000_000 },
  { mes: "Sep", ingresos: 28_000_000, egresos: 52_000_000 },
  { mes: "Oct", ingresos: 47_000_000, egresos: 63_000_000 },
  { mes: "Nov", ingresos: 88_000_000, egresos: 71_000_000 },
  { mes: "Dic", ingresos: 156_000_000, egresos: 69_000_000 },
];

// Año anterior (para comparativos en el Home).
export const ingresosAnioAnterior = [
  128_000_000, 151_000_000, 88_000_000, 38_000_000, 20_000_000, 16_000_000,
  14_000_000, 17_000_000, 25_000_000, 43_000_000, 79_000_000, 141_000_000,
];

// Márgenes por cultivo (CLP).
export const margenesPorCultivo = [
  { cultivo: "Cerezas", ingresos: 412_000_000, costos: 198_000_000 },
  { cultivo: "Arándanos", ingresos: 196_000_000, costos: 121_000_000 },
  { cultivo: "Manzanas", ingresos: 154_000_000, costos: 132_000_000 },
  { cultivo: "Uva de mesa", ingresos: 118_000_000, costos: 88_000_000 },
];

// Producción estimada vs real (temporada actual).
export const produccionDemo = [
  { cultivo: "Cerezas", unidad: "ton", estimado: 520, real: 487 },
  { cultivo: "Arándanos", unidad: "ton", estimado: 310, real: 332 },
  { cultivo: "Manzanas", unidad: "ton", estimado: 640, real: 598 },
  { cultivo: "Uva de mesa", unidad: "ton", estimado: 280, real: 271 },
];

// Temporadas / campañas.
export const temporadasDemo = [
  { nombre: "Cerezas 2025-26", cultivo: "Cerezas", estado: "activa", inicio: "2025-11-01", fin: "2026-01-31" },
  { nombre: "Arándanos 2025-26", cultivo: "Arándanos", estado: "activa", inicio: "2025-11-15", fin: "2026-02-28" },
  { nombre: "Uva de mesa 2025-26", cultivo: "Uva de mesa", estado: "planificada", inicio: "2026-02-01", fin: "2026-04-15" },
  { nombre: "Manzanas 2025-26", cultivo: "Manzanas", estado: "cerrada", inicio: "2025-02-01", fin: "2025-05-30" },
];

// Costos operacionales por faena (CLP, acumulado temporada).
export const costosPorFaena = [
  { faena: "Cosecha", monto: 184_000_000 },
  { faena: "Poda", monto: 96_000_000 },
  { faena: "Riego", monto: 58_000_000 },
  { faena: "Fertilización", monto: 71_000_000 },
  { faena: "Control fitosanitario", monto: 63_000_000 },
  { faena: "Embalaje", monto: 112_000_000 },
];

// Personal / cuadrillas (semana actual).
export const cuadrillasDemo = [
  { cuadrilla: "Cuadrilla A — Cosecha", trabajadores: 38, horas: 1672 },
  { cuadrilla: "Cuadrilla B — Cosecha", trabajadores: 34, horas: 1496 },
  { cuadrilla: "Cuadrilla C — Embalaje", trabajadores: 26, horas: 1144 },
  { cuadrilla: "Cuadrilla D — Riego/Poda", trabajadores: 12, horas: 528 },
];
