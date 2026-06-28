/**
 * PostgreSQL database client — Polla Mundialista Familia Rivera Arcos
 *
 * Compatible with Vercel Postgres (POSTGRES_URL env var).
 * Tables are created automatically on first use via initDB().
 */

import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = getPool();
  const result = await client.query(text, params);
  return result.rows as T[];
}

// ── Schema init ─────────────────────────────────────────────────

export async function initDB(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS jugadores (
      email        TEXT PRIMARY KEY,
      nombre       TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS pronosticos (
      email           TEXT NOT NULL,
      partido_id      TEXT NOT NULL,
      goles_local     INT  NOT NULL,
      goles_visitante INT  NOT NULL,
      updated_at      TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (email, partido_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS resultados (
      partido_id      TEXT PRIMARY KEY,
      goles_local     INT,
      goles_visitante INT,
      cerrado         BOOLEAN DEFAULT FALSE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS partidos_extra (
      id              TEXT PRIMARY KEY,
      fase            TEXT NOT NULL DEFAULT 'Eliminación Directa',
      grupo           TEXT NOT NULL DEFAULT '',
      jornada         INT  NOT NULL DEFAULT 0,
      fecha_utc       TIMESTAMPTZ NOT NULL,
      equipo_local    TEXT NOT NULL,
      equipo_visitante TEXT NOT NULL,
      estadio         TEXT NOT NULL DEFAULT '',
      flag_local      TEXT NOT NULL DEFAULT '🏳',
      flag_visitante  TEXT NOT NULL DEFAULT '🏳'
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sync_meta (
      key        TEXT PRIMARY KEY,
      synced_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

// ── Partidos extra (eliminación directa) ─────────────────────────

export interface PartidoExtra {
  id: string;
  fase: string;
  grupo: string;
  jornada: number;
  fechaUTC: string;
  equipoLocal: string;
  equipoVisitante: string;
  estadio: string;
  flagLocal: string;
  flagVisitante: string;
}

export async function getPartidosExtra(): Promise<PartidoExtra[]> {
  const rows = await query<{
    id: string; fase: string; grupo: string; jornada: number;
    fecha_utc: string; equipo_local: string; equipo_visitante: string;
    estadio: string; flag_local: string; flag_visitante: string;
  }>("SELECT * FROM partidos_extra ORDER BY fecha_utc");
  return rows.map((r) => ({
    id: r.id,
    fase: r.fase,
    grupo: r.grupo,
    jornada: r.jornada,
    fechaUTC: r.fecha_utc,
    equipoLocal: r.equipo_local,
    equipoVisitante: r.equipo_visitante,
    estadio: r.estadio,
    flagLocal: r.flag_local,
    flagVisitante: r.flag_visitante,
  }));
}

// ── Jugadores ────────────────────────────────────────────────────

export interface Jugador {
  email: string;
  nombre: string;
  passwordHash: string;
  createdAt: string;
}

export async function getJugadores(): Promise<Jugador[]> {
  const rows = await query<{ email: string; nombre: string; password_hash: string; created_at: string }>(
    "SELECT email, nombre, password_hash, created_at FROM jugadores ORDER BY created_at"
  );
  return rows.map((r) => ({
    email: r.email,
    nombre: r.nombre,
    passwordHash: r.password_hash,
    createdAt: r.created_at,
  }));
}

export async function getJugadorByEmail(email: string): Promise<Jugador | null> {
  const rows = await query<{ email: string; nombre: string; password_hash: string; created_at: string }>(
    "SELECT email, nombre, password_hash, created_at FROM jugadores WHERE email = $1",
    [email.toLowerCase()]
  );
  if (!rows[0]) return null;
  return {
    email: rows[0].email,
    nombre: rows[0].nombre,
    passwordHash: rows[0].password_hash,
    createdAt: rows[0].created_at,
  };
}

export async function createJugador(
  email: string,
  nombre: string,
  passwordHash: string
): Promise<void> {
  await query(
    "INSERT INTO jugadores (email, nombre, password_hash) VALUES ($1, $2, $3)",
    [email.toLowerCase(), nombre.trim(), passwordHash]
  );
}

// ── Pronosticos ──────────────────────────────────────────────────

export interface Pronostico {
  email: string;
  partidoId: string;
  golesLocal: number;
  golesVisitante: number;
  updatedAt: string;
}

export async function getPronosticos(email?: string): Promise<Pronostico[]> {
  const rows = email
    ? await query<{ email: string; partido_id: string; goles_local: number; goles_visitante: number; updated_at: string }>(
        "SELECT email, partido_id, goles_local, goles_visitante, updated_at FROM pronosticos WHERE email = $1",
        [email.toLowerCase()]
      )
    : await query<{ email: string; partido_id: string; goles_local: number; goles_visitante: number; updated_at: string }>(
        "SELECT email, partido_id, goles_local, goles_visitante, updated_at FROM pronosticos"
      );
  return rows.map((r) => ({
    email: r.email,
    partidoId: r.partido_id,
    golesLocal: r.goles_local,
    golesVisitante: r.goles_visitante,
    updatedAt: r.updated_at,
  }));
}

export async function upsertPronostico(
  email: string,
  partidoId: string,
  golesLocal: number,
  golesVisitante: number
): Promise<void> {
  await query(
    `INSERT INTO pronosticos (email, partido_id, goles_local, goles_visitante, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (email, partido_id)
     DO UPDATE SET goles_local = $3, goles_visitante = $4, updated_at = NOW()`,
    [email.toLowerCase(), partidoId, golesLocal, golesVisitante]
  );
}

// ── Resultados ───────────────────────────────────────────────────

export interface Resultado {
  partidoId: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  cerrado: boolean;
}

export async function getResultados(): Promise<Resultado[]> {
  const rows = await query<{ partido_id: string; goles_local: number | null; goles_visitante: number | null; cerrado: boolean }>(
    "SELECT partido_id, goles_local, goles_visitante, cerrado FROM resultados"
  );
  return rows.map((r) => ({
    partidoId: r.partido_id,
    golesLocal: r.goles_local,
    golesVisitante: r.goles_visitante,
    cerrado: r.cerrado,
  }));
}

export async function getResultadoByPartidoId(partidoId: string): Promise<Resultado | null> {
  const rows = await query<{ partido_id: string; goles_local: number | null; goles_visitante: number | null; cerrado: boolean }>(
    "SELECT partido_id, goles_local, goles_visitante, cerrado FROM resultados WHERE partido_id = $1",
    [partidoId]
  );
  if (!rows[0]) return null;
  return {
    partidoId: rows[0].partido_id,
    golesLocal: rows[0].goles_local,
    golesVisitante: rows[0].goles_visitante,
    cerrado: rows[0].cerrado,
  };
}
