"use client";

import { useState } from "react";
import { ROLES, ROL_LABEL, type Usuario } from "@/lib/users";

export default function EquipoClient({
  usuariosIniciales,
  miId,
}: {
  usuariosIniciales: Usuario[];
  miId: number;
}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  // Formulario de creación
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<string>("ejecutivo");
  const [password, setPassword] = useState("");
  const [creando, setCreando] = useState(false);

  function flash(tipo: "ok" | "error", texto: string) {
    setMsg({ tipo, texto });
    setTimeout(() => setMsg(null), 4000);
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, rol, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsuarios((u) => [...u, data.user]);
        setNombre(""); setEmail(""); setPassword(""); setRol("ejecutivo");
        flash("ok", `Usuario ${data.user.email} creado.`);
      } else {
        flash("error", data.error ?? "No se pudo crear el usuario.");
      }
    } finally {
      setCreando(false);
    }
  }

  async function patch(id: number, body: Record<string, unknown>, okMsg: string) {
    const res = await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setUsuarios(data.users);
      flash("ok", okMsg);
    } else {
      flash("error", data.error ?? "No se pudo actualizar.");
    }
  }

  async function cambiarClave(u: Usuario) {
    const nueva = window.prompt(`Nueva clave para ${u.email}:`);
    if (!nueva) return;
    await patch(u.id, { password: nueva }, `Clave de ${u.email} actualizada.`);
  }

  async function cambiarRol(u: Usuario, nuevoRol: string) {
    await patch(u.id, { rol: nuevoRol }, `Rol de ${u.email} → ${ROL_LABEL[nuevoRol]}.`);
  }

  async function toggleActivo(u: Usuario) {
    await patch(u.id, { activo: !u.activo }, `${u.email} ${u.activo ? "desactivado" : "activado"}.`);
  }

  async function eliminar(u: Usuario) {
    if (!window.confirm(`¿Eliminar a ${u.email}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/usuarios/${u.id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setUsuarios(data.users);
      flash("ok", `${u.email} eliminado.`);
    } else {
      flash("error", data.error ?? "No se pudo eliminar.");
    }
  }

  return (
    <div className="space-y-4">
      {msg && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            msg.tipo === "ok" ? "bg-brand-100 text-brand-700" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.texto}
        </div>
      )}

      {/* Crear usuario */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Crear nuevo usuario</h2>
        <form onSubmit={crear} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs text-[var(--muted)] mb-1">Nombre</label>
            <input
              required value={nombre} onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-[var(--muted)] mb-1">Correo</label>
            <input
              required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@empresa.cl"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Rol</label>
            <select
              value={rol} onChange={(e) => setRol(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROL_LABEL[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Clave</label>
            <input
              required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="ej: 1234"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="md:col-span-5">
            <button
              type="submit" disabled={creando}
              className="rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-5 py-2 transition-colors disabled:opacity-60"
            >
              {creando ? "Creando…" : "+ Crear usuario"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Usuarios ({usuarios.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                <th className="py-2 font-medium">Nombre</th>
                <th className="py-2 font-medium">Correo</th>
                <th className="py-2 font-medium">Rol</th>
                <th className="py-2 font-medium">Estado</th>
                <th className="py-2 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 font-medium">
                    {u.nombre}
                    {u.id === miId && <span className="ml-2 text-xs text-brand-600">(tú)</span>}
                  </td>
                  <td className="py-2.5 text-[var(--muted)]">{u.email}</td>
                  <td className="py-2.5">
                    <select
                      value={u.rol}
                      onChange={(e) => cambiarRol(u, e.target.value)}
                      disabled={u.id === miId}
                      className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs bg-white disabled:opacity-60"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROL_LABEL[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.activo ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <button onClick={() => cambiarClave(u)} className="text-brand-700 hover:underline">
                        Cambiar clave
                      </button>
                      <span className="text-[var(--border)]">·</span>
                      <button
                        onClick={() => toggleActivo(u)}
                        disabled={u.id === miId}
                        className="text-amber-700 hover:underline disabled:opacity-40 disabled:no-underline"
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                      <span className="text-[var(--border)]">·</span>
                      <button
                        onClick={() => eliminar(u)}
                        disabled={u.id === miId}
                        className="text-red-600 hover:underline disabled:opacity-40 disabled:no-underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
