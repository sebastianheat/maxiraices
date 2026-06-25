"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROL_LABEL } from "@/lib/users";

const NAV = [
  { href: "/", label: "Resumen Gerencial", icon: "📊" },
  { href: "/financiero", label: "Financiero", icon: "💰" },
  { href: "/operativo", label: "Operativo", icon: "🌱" },
];

export default function Sidebar({
  nombre,
  email,
  rol,
}: {
  nombre: string;
  email: string;
  rol: string;
}) {
  const path = usePathname();
  const router = useRouter();

  const nav = [...NAV];
  if (rol === "admin") {
    nav.push({ href: "/equipo", label: "Equipo", icon: "👥" });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="w-64 shrink-0 bg-[var(--color-ink-900)] text-white flex flex-col min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-xs uppercase tracking-widest text-brand-100/70">Agrícola</div>
        <div className="text-lg font-semibold leading-tight">Valles del Maule</div>
        <div className="text-xs text-white/50 mt-1">Dashboard Gerencial</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-brand-500 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-brand-500 flex items-center justify-center text-sm font-semibold shrink-0">
            {iniciales}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{nombre}</div>
            <div className="text-xs text-white/50 truncate">{ROL_LABEL[rol] ?? rol}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-white/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          ↪ Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
