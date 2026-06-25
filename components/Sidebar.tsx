"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Resumen Gerencial", icon: "📊" },
  { href: "/financiero", label: "Financiero", icon: "💰" },
  { href: "/operativo", label: "Operativo", icon: "🌱" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-[var(--color-ink-900)] text-white flex flex-col min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-xs uppercase tracking-widest text-brand-100/70">Agrícola</div>
        <div className="text-lg font-semibold leading-tight">Valles del Maule</div>
        <div className="text-xs text-white/50 mt-1">Dashboard Gerencial</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
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
      <div className="px-6 py-4 border-t border-white/10 text-xs text-white/40">
        v1.0 · Vercel + Neon
      </div>
    </aside>
  );
}
