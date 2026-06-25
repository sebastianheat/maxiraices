export default function PageHeader({
  titulo,
  subtitulo,
  origen,
}: {
  titulo: string;
  subtitulo: string;
  origen: "neon" | "demo";
}) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{subtitulo}</p>
      </div>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
          origen === "neon"
            ? "bg-brand-100 text-brand-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${origen === "neon" ? "bg-brand-500" : "bg-amber-500"}`} />
        {origen === "neon" ? "Datos en vivo · Neon" : "Datos demo"}
      </span>
    </div>
  );
}
