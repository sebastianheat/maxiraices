import { pct } from "@/lib/format";

export default function KpiCard({
  titulo,
  valor,
  delta,
  hint,
}: {
  titulo: string;
  valor: string;
  delta?: number;
  hint?: string;
}) {
  const positivo = (delta ?? 0) >= 0;
  return (
    <div className="card p-5">
      <div className="text-sm text-[var(--muted)]">{titulo}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{valor}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
              positivo ? "bg-brand-100 text-brand-700" : "bg-red-100 text-red-700"
            }`}
          >
            {positivo ? "▲" : "▼"} {pct(delta)}
          </span>
        )}
        {hint && <span className="text-[var(--muted)]">{hint}</span>}
      </div>
    </div>
  );
}
