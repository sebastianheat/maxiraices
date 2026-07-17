"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UltimaSync } from "@/lib/sync";

function fmtFecha(iso: string | null): string {
  if (!iso) return "nunca";
  const d = new Date(iso);
  return d.toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function SyncBar({
  isAdmin,
  ultima,
}: {
  isAdmin: boolean;
  ultima: UltimaSync;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function actualizar() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMsg({ tipo: "ok", texto: `Actualizado · ${data.filas} registros` });
        router.refresh();
      } else {
        setMsg({ tipo: "error", texto: data.error ?? "No se pudo actualizar." });
      }
    } catch {
      setMsg({ tipo: "error", texto: "Error de conexión." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-[var(--border)]">
      <div className="text-xs text-[var(--muted)] flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${ultima?.estado === "error" ? "bg-red-500" : "bg-brand-500"}`} />
        Última actualización de datos:{" "}
        <span className="font-medium text-[var(--text)]">{fmtFecha(ultima?.finalizado ?? null)}</span>
        {ultima?.origen && <span className="text-[var(--muted)]">· {ultima.origen === "cron" ? "automática" : "manual"}</span>}
        <span className="text-[var(--muted)]">· se actualiza sola cada día a las 23:59</span>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`text-xs font-medium ${msg.tipo === "ok" ? "text-brand-700" : "text-red-600"}`}>
              {msg.texto}
            </span>
          )}
          <button
            onClick={actualizar}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 transition-colors disabled:opacity-60"
          >
            <span className={loading ? "animate-spin" : ""}>⟳</span>
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      )}
    </div>
  );
}
