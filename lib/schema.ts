import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  date,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// Usuarios del panel (autenticación + roles)
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  nombre: text("nombre").notNull(),
  rol: text("rol").notNull().default("ejecutivo"), // 'admin' | 'ejecutivo'
  passwordHash: text("password_hash").notNull(),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Movimientos financieros (ingresos y egresos)
export const movimientos = pgTable("movimientos", {
  id: serial("id").primaryKey(),
  fecha: date("fecha").notNull(),
  tipo: text("tipo").notNull(), // 'ingreso' | 'egreso'
  categoria: text("categoria").notNull(),
  cultivo: text("cultivo"),
  monto: numeric("monto", { precision: 14, scale: 2 }).notNull(),
  descripcion: text("descripcion"),
});

// Temporadas / campañas
export const temporadas = pgTable("temporadas", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  cultivo: text("cultivo").notNull(),
  estado: text("estado").notNull(), // 'activa' | 'cerrada' | 'planificada'
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin"),
});

// Producción estimada vs real
export const produccion = pgTable("produccion", {
  id: serial("id").primaryKey(),
  temporada: text("temporada").notNull(),
  cultivo: text("cultivo").notNull(),
  unidad: text("unidad").notNull(), // 'ton' | 'cajas'
  estimado: numeric("estimado", { precision: 14, scale: 2 }).notNull(),
  real: numeric("real", { precision: 14, scale: 2 }).notNull(),
});

// Costos operacionales por faena
export const costos = pgTable("costos", {
  id: serial("id").primaryKey(),
  fecha: date("fecha").notNull(),
  area: text("area").notNull(),
  faena: text("faena").notNull(),
  monto: numeric("monto", { precision: 14, scale: 2 }).notNull(),
});

// Personal / cuadrillas
export const personal = pgTable("personal", {
  id: serial("id").primaryKey(),
  fecha: date("fecha").notNull(),
  cuadrilla: text("cuadrilla").notNull(),
  trabajadores: integer("trabajadores").notNull(),
  horas: numeric("horas", { precision: 10, scale: 1 }).notNull(),
});
