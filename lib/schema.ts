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

// Gastos reales sincronizados desde el Drive (hoja BBDD de "2. PLANILLA GASTOS")
export const gastos = pgTable("gastos", {
  id: serial("id").primaryKey(),
  fecha: date("fecha"),
  mes: integer("mes"),
  semana: integer("semana"),
  item: text("item"),
  area: text("area"), // SUBITEM
  proyecto: text("proyecto"),
  comprador: text("comprador"),
  centroCosto: text("centro_costo"),
  tipoDoc: text("tipo_doc"),
  nDoc: text("n_doc"),
  proveedor: text("proveedor"),
  detalle: text("detalle"),
  total: numeric("total", { precision: 14, scale: 2 }),
  banco: text("banco"),
  medioPago: text("medio_pago"),
  quienPago: text("quien_pago"),
  solicitante: text("solicitante"),
});

// Bitácora de sincronizaciones (para "última actualización" y auditoría)
export const syncLog = pgTable("sync_log", {
  id: serial("id").primaryKey(),
  fuente: text("fuente").notNull(),
  estado: text("estado").notNull(), // 'ok' | 'error'
  origen: text("origen"), // 'manual' | 'cron'
  filas: integer("filas").notNull().default(0),
  mensaje: text("mensaje"),
  iniciado: timestamp("iniciado", { withTimezone: true }).notNull().defaultNow(),
  finalizado: timestamp("finalizado", { withTimezone: true }),
});

// Personal / cuadrillas
export const personal = pgTable("personal", {
  id: serial("id").primaryKey(),
  fecha: date("fecha").notNull(),
  cuadrilla: text("cuadrilla").notNull(),
  trabajadores: integer("trabajadores").notNull(),
  horas: numeric("horas", { precision: 10, scale: 1 }).notNull(),
});
