// Formateadores para Chile (CLP, número y porcentaje).

export function clp(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

// CLP compacto (ej: $142M) para KPI cards.
export function clpCompacto(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}MM`;
  if (abs >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`;
  if (abs >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return clp(value);
}

export function num(value: number): string {
  return new Intl.NumberFormat("es-CL").format(value);
}

export function pct(value: number): string {
  const signo = value > 0 ? "+" : "";
  return `${signo}${value.toFixed(1)}%`;
}
