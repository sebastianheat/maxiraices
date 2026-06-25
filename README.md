# Dashboard Gerencial — Agrícola Valles del Maule

Plataforma web que centraliza la información **financiera** y **operativa** de la
empresa agrícola. Construida sobre **Next.js + Neon (Postgres) + Vercel**.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend / Backend | Next.js 15 (App Router, TypeScript) |
| Base de datos | Neon (PostgreSQL serverless) |
| ORM | Drizzle |
| Gráficos | Recharts |
| Estilos | Tailwind CSS v4 |
| Hosting | Vercel |

## Módulos

- **Resumen Gerencial** (`/`) — KPIs del mes, comparativo año actual vs. anterior, alertas automáticas.
- **Financiero** (`/financiero`) — ingresos vs. egresos, flujo de caja acumulado, márgenes por cultivo.
- **Operativo** (`/operativo`) — producción estimada vs. real, costos por faena, temporadas y cuadrillas.

## Datos

El dashboard funciona en dos modos automáticos:

1. **Neon (en vivo):** si la variable `DATABASE_URL` está presente (la provee la
   integración de Neon en Vercel), lee los datos reales de Postgres.
2. **Demo:** si no hay base conectada, usa un dataset de ejemplo para que el
   dashboard siempre renderice. El header lo indica con un badge.

## Puesta en marcha local

```bash
npm install
npm run dev          # http://localhost:3000
```

## Conectar Neon y cargar datos

1. En Vercel → proyecto → **Storage** → conectar la base **Neon** (genera `DATABASE_URL`).
2. Cargar el esquema y datos demo:

```bash
DATABASE_URL="postgres://..." npm run db:seed
```

Más adelante, el script ETL leerá los Excel y reemplazará estos inserts.

## Estructura

```
app/                 Páginas (Home, financiero, operativo)
components/          Sidebar, KPI cards, gráficos (Recharts)
lib/
  schema.ts         Esquema Drizzle (tablas)
  db.ts             Conexión Neon (o null → demo)
  data.ts           Acceso a datos (Neon con fallback a demo)
  demo.ts           Dataset demo
  format.ts         Formato CLP / números
db/seed.ts          Crea tablas y carga datos demo en Neon
```
