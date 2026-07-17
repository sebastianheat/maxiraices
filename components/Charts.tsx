"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { clpCompacto, num } from "@/lib/format";

const VERDE = "#16a34a";
const ROJO = "#dc2626";
const AZUL = "#0ea5e9";
const PALETA = ["#16a34a", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

const ejeMonto = (v: number) => clpCompacto(v);
const tooltipMonto = (v: number | string) => clpCompacto(Number(v));

function ejes() {
  return {
    cartesian: <CartesianGrid strokeDasharray="3 3" stroke="#eef0ed" vertical={false} />,
  };
}

export function IngresosEgresosChart({
  data,
}: {
  data: { mes: string; ingresos: number; egresos: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0ed" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={ejeMonto} tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip formatter={tooltipMonto} cursor={{ fill: "#00000008" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="ingresos" name="Ingresos" fill={VERDE} radius={[4, 4, 0, 0]} />
        <Bar dataKey="egresos" name="Egresos" fill={ROJO} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FlujoCajaChart({
  data,
}: {
  data: { mes: string; acumulado: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="flujo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={VERDE} stopOpacity={0.35} />
            <stop offset="95%" stopColor={VERDE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0ed" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={ejeMonto} tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip formatter={tooltipMonto} />
        <Area type="monotone" dataKey="acumulado" name="Flujo acumulado" stroke={VERDE} strokeWidth={2} fill="url(#flujo)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ComparativoChart({
  data,
}: {
  data: { mes: string; actual: number; anterior: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0ed" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={ejeMonto} tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip formatter={tooltipMonto} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="actual" name="Año actual" stroke={VERDE} strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="anterior" name="Año anterior" stroke={AZUL} strokeWidth={2} strokeDasharray="5 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ProduccionChart({
  data,
}: {
  data: { cultivo: string; estimado: number; real: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0ed" vertical={false} />
        <XAxis dataKey="cultivo" tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => num(v)} />
        <Tooltip formatter={(v) => `${num(Number(v))} ton`} cursor={{ fill: "#00000008" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="estimado" name="Estimado" fill="#cbd5cf" radius={[4, 4, 0, 0]} />
        <Bar dataKey="real" name="Real" fill={VERDE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GastoMesChart({
  data,
}: {
  data: { etiqueta: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0ed" vertical={false} />
        <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fill: "#6b7c72" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={ejeMonto} tick={{ fontSize: 12, fill: "#6b7c72" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip formatter={tooltipMonto} cursor={{ fill: "#00000008" }} />
        <Bar dataKey="total" name="Gasto" fill={ROJO} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BarrasHorizontales({
  data,
  color = "#16a34a",
}: {
  data: { etiqueta: string; total: number }[];
  color?: string;
}) {
  const alto = Math.max(220, data.length * 34 + 40);
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0ed" horizontal={false} />
        <XAxis type="number" tickFormatter={ejeMonto} tick={{ fontSize: 11, fill: "#6b7c72" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="etiqueta" width={140} tick={{ fontSize: 11, fill: "#3a4a42" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={tooltipMonto} cursor={{ fill: "#00000008" }} />
        <Bar dataKey="total" name="Gasto" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CostosPieChart({
  data,
}: {
  data: { faena: string; monto: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="monto"
          nameKey="faena"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETA[i % PALETA.length]} />
          ))}
        </Pie>
        <Tooltip formatter={tooltipMonto} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
