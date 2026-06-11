/**
 * Google Sheets integration via Service Account
 *
 * Spreadsheet structure:
 *  Sheet "jugadores":   email | nombre | password_hash | created_at
 *  Sheet "pronosticos": email | partido_id | goles_local | goles_visitante | updated_at
 *  Sheet "resultados":  partido_id | goles_local | goles_visitante | cerrado
 */

import { google } from "googleapis";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  return new google.auth.JWT(email, undefined, key, [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// ── Generic helpers ──────────────────────────────────────────────

async function readSheet(range: string): Promise<string[][]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return (res.data.values as string[][]) || [];
}

async function appendRow(sheet: string, values: string[]): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheet}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

async function updateRow(
  sheet: string,
  rowIndex: number, // 1-based
  values: string[]
): Promise<void> {
  const sheets = getSheets();
  const colLetter = String.fromCharCode(64 + values.length); // A..Z
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheet}!A${rowIndex}:${colLetter}${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

// ── Jugadores ────────────────────────────────────────────────────

export interface Jugador {
  email: string;
  nombre: string;
  passwordHash: string;
  createdAt: string;
}

export async function getJugadores(): Promise<Jugador[]> {
  const rows = await readSheet("jugadores!A2:D");
  return rows.map(([email, nombre, passwordHash, createdAt]) => ({
    email,
    nombre,
    passwordHash,
    createdAt,
  }));
}

export async function getJugadorByEmail(email: string): Promise<Jugador | null> {
  const jugadores = await getJugadores();
  return jugadores.find((j) => j.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createJugador(
  email: string,
  nombre: string,
  passwordHash: string
): Promise<void> {
  await appendRow("jugadores", [email, nombre, passwordHash, new Date().toISOString()]);
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
  const rows = await readSheet("pronosticos!A2:E");
  const all = rows.map(([em, pid, gl, gv, ua]) => ({
    email: em,
    partidoId: pid,
    golesLocal: parseInt(gl ?? "0", 10),
    golesVisitante: parseInt(gv ?? "0", 10),
    updatedAt: ua,
  }));
  return email ? all.filter((p) => p.email.toLowerCase() === email.toLowerCase()) : all;
}

export async function upsertPronostico(
  email: string,
  partidoId: string,
  golesLocal: number,
  golesVisitante: number
): Promise<void> {
  const rows = await readSheet("pronosticos!A2:E");
  const idx = rows.findIndex(
    ([em, pid]) =>
      em.toLowerCase() === email.toLowerCase() && pid === partidoId
  );

  const values = [
    email,
    partidoId,
    String(golesLocal),
    String(golesVisitante),
    new Date().toISOString(),
  ];

  if (idx === -1) {
    await appendRow("pronosticos", values);
  } else {
    await updateRow("pronosticos", idx + 2, values); // +2 for header + 0-based
  }
}

// ── Resultados ───────────────────────────────────────────────────

export interface Resultado {
  partidoId: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  cerrado: boolean;
}

export async function getResultados(): Promise<Resultado[]> {
  const rows = await readSheet("resultados!A2:D");
  return rows.map(([pid, gl, gv, cerrado]) => ({
    partidoId: pid,
    golesLocal: gl !== "" && gl !== undefined ? parseInt(gl, 10) : null,
    golesVisitante: gv !== "" && gv !== undefined ? parseInt(gv, 10) : null,
    cerrado: cerrado === "TRUE" || cerrado === "1" || cerrado === "true",
  }));
}

export async function getResultadoByPartidoId(
  partidoId: string
): Promise<Resultado | null> {
  const resultados = await getResultados();
  return resultados.find((r) => r.partidoId === partidoId) ?? null;
}
