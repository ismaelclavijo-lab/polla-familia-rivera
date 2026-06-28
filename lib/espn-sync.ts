import { query } from "@/lib/db";
import { PARTIDOS } from "@/lib/partidos-data";

// ── Flag emoji map ─────────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  MEX: "🇲🇽", RSA: "🇿🇦", KOR: "🇰🇷", CZE: "🇨🇿", CAN: "🇨🇦", BIH: "🇧🇦",
  USA: "🇺🇸", PAR: "🇵🇾", QAT: "🇶🇦", SUI: "🇨🇭", BRA: "🇧🇷", MAR: "🇲🇦",
  HAI: "🇭🇹", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", AUS: "🇦🇺", TUR: "🇹🇷", GER: "🇩🇪", CUW: "🇨🇼",
  NED: "🇳🇱", JPN: "🇯🇵", CIV: "🇨🇮", ECU: "🇪🇨", SWE: "🇸🇪", TUN: "🇹🇳",
  ESP: "🇪🇸", CPV: "🇨🇻", BEL: "🇧🇪", EGY: "🇪🇬", KSA: "🇸🇦", URU: "🇺🇾",
  IRN: "🇮🇷", NZL: "🇳🇿", FRA: "🇫🇷", SEN: "🇸🇳", IRQ: "🇮🇶", NOR: "🇳🇴",
  ARG: "🇦🇷", ALG: "🇩🇿", DZA: "🇩🇿", AUT: "🇦🇹", JOR: "🇯🇴", POR: "🇵🇹",
  COD: "🇨🇩", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", CRO: "🇭🇷", GHA: "🇬🇭", PAN: "🇵🇦", UZB: "🇺🇿",
  COL: "🇨🇴", NGR: "🇳🇬", NGA: "🇳🇬", SWZ: "🇸🇿", VEN: "🇻🇪", CHI: "🇨🇱",
  PER: "🇵🇪", BOL: "🇧🇴", CRC: "🇨🇷", HON: "🇭🇳", GTM: "🇬🇹", JAM: "🇯🇲",
  TRI: "🇹🇹", BAH: "🇧🇸", POL: "🇵🇱", SRB: "🇷🇸", SVK: "🇸🇰", ROU: "🇷🇴",
  HUN: "🇭🇺", GRE: "🇬🇷", DEN: "🇩🇰", FIN: "🇫🇮", WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  IRL: "🇮🇪", MLI: "🇲🇱", CMR: "🇨🇲", TAN: "🇹🇿", MOZ: "🇲🇿", ZIM: "🇿🇼",
  SAF: "🇿🇦", KEN: "🇰🇪", IND: "🇮🇳", THA: "🇹🇭", VIE: "🇻🇳", IDN: "🇮🇩",
  PHI: "🇵🇭", CHN: "🇨🇳", OMA: "🇴🇲", UAE: "🇦🇪", BHR: "🇧🇭", KWT: "🇰🇼",
};

// ── Round label from ESPN competition notes ────────────────────────
function parseFase(event: Record<string, unknown>): string {
  try {
    const notes = (event.competitions as Record<string, unknown>[])?.[0]?.notes as { headline?: string }[] | undefined;
    if (notes?.[0]?.headline) return notes[0].headline;
    const seasonType = (event as { season?: { type?: number } }).season?.type;
    if (seasonType === 3) return "Eliminación Directa";
  } catch { /* ignore */ }
  return "Eliminación Directa";
}

/**
 * Sync upcoming match schedule from ESPN into partidos_extra table.
 * Only runs if last sync was >3 hours ago.
 * Only processes matches NOT already in hardcoded PARTIDOS.
 */
export async function syncScheduleFromESPN(): Promise<number> {
  // Ensure tables exist
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS partidos_extra (
        id TEXT PRIMARY KEY, fase TEXT NOT NULL DEFAULT 'Eliminación Directa',
        grupo TEXT NOT NULL DEFAULT '', jornada INT NOT NULL DEFAULT 0,
        fecha_utc TIMESTAMPTZ NOT NULL, equipo_local TEXT NOT NULL,
        equipo_visitante TEXT NOT NULL, estadio TEXT NOT NULL DEFAULT '',
        flag_local TEXT NOT NULL DEFAULT '🏳', flag_visitante TEXT NOT NULL DEFAULT '🏳'
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS sync_meta (
        key TEXT PRIMARY KEY, synced_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch { /* ignore */ }

  // Cooldown: skip if synced recently
  try {
    const meta = await query<{ synced_at: string }>(
      "SELECT synced_at FROM sync_meta WHERE key = 'schedule'"
    );
    if (meta[0]) {
      const diff = Date.now() - new Date(meta[0].synced_at).getTime();
      if (diff < 3 * 60 * 60 * 1000) return 0; // less than 3h ago
    }
  } catch { /* ignore */ }

  // Fetch next 20 days from ESPN
  const dates: string[] = [];
  const ahora = new Date();
  for (let i = -1; i < 20; i++) {
    const d = new Date(ahora);
    d.setDate(d.getDate() + i);
    dates.push(dateStr(d));
  }

  // Build set of hardcoded partido IDs to skip
  const hardcodedDates = new Set(PARTIDOS.map((p) => p.fechaUTC.slice(0, 10).replace(/-/g, "")));

  let synced = 0;
  for (const date of dates) {
    if (hardcodedDates.has(date)) continue; // group stage date — skip
    const events = await fetchESPN(date);

    for (const event of events) {
      try {
        const comp = event.competitions?.[0];
        if (!comp) continue;

        const home = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "home");
        const away = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "away");
        if (!home || !away) continue;

        const homeAbr: string = home.team?.abbreviation ?? "";
        const awayAbr: string = away.team?.abbreviation ?? "";
        if (!homeAbr || homeAbr === "TBD" || awayAbr === "TBD") continue;

        const equipoLocal: string = ESPN_ABR[homeAbr] ?? home.team?.displayName ?? homeAbr;
        const equipoVisitante: string = ESPN_ABR[awayAbr] ?? away.team?.displayName ?? awayAbr;
        const flagLocal = FLAG_MAP[homeAbr] ?? "🏳";
        const flagVisitante = FLAG_MAP[awayAbr] ?? "🏳";
        const estadio: string = comp.venue?.fullName ?? "";
        const fase = parseFase(event);
        const espnId: string = `ESPN-${event.id}`;

        await query(
          `INSERT INTO partidos_extra (id, fase, grupo, jornada, fecha_utc, equipo_local, equipo_visitante, estadio, flag_local, flag_visitante)
           VALUES ($1, $2, '', 0, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             fase = $2, fecha_utc = $3, equipo_local = $4, equipo_visitante = $5,
             estadio = $6, flag_local = $7, flag_visitante = $8`,
          [espnId, fase, event.date, equipoLocal, equipoVisitante, estadio, flagLocal, flagVisitante]
        );
        synced++;
      } catch { /* skip individual errors */ }
    }
  }

  // Update sync timestamp
  await query(
    `INSERT INTO sync_meta (key, synced_at) VALUES ('schedule', NOW())
     ON CONFLICT (key) DO UPDATE SET synced_at = NOW()`
  );

  return synced;
}

// ESPN team abbreviation → our local team name
const ESPN_ABR: Record<string, string> = {
  MEX: "México", RSA: "Sudáfrica", KOR: "Corea del Sur", CZE: "República Checa",
  CAN: "Canadá", BIH: "Bosnia y Herzegovina", USA: "EE.UU.", PAR: "Paraguay",
  QAT: "Catar", SUI: "Suiza", BRA: "Brasil", MAR: "Marruecos",
  HAI: "Haití", SCO: "Escocia", AUS: "Australia", TUR: "Turquía",
  GER: "Alemania", CUW: "Curazao", NED: "Países Bajos", JPN: "Japón",
  CIV: "Costa de Marfil", ECU: "Ecuador", SWE: "Suecia", TUN: "Túnez",
  ESP: "España", CPV: "Cabo Verde", BEL: "Bélgica", EGY: "Egipto",
  KSA: "Arabia Saudita", URU: "Uruguay", IRN: "Irán", NZL: "Nueva Zelanda",
  FRA: "Francia", SEN: "Senegal", IRQ: "Irak", NOR: "Noruega",
  ARG: "Argentina", ALG: "Argelia", DZA: "Argelia", AUT: "Austria",
  JOR: "Jordania", POR: "Portugal", COD: "R. D. Congo", ENG: "Inglaterra",
  CRO: "Croacia", GHA: "Ghana", PAN: "Panamá", UZB: "Uzbekistán", COL: "Colombia",
};

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

async function fetchESPN(date: string) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events ?? [];
  } catch {
    return [];
  }
}

/**
 * Sync live/finished matches from ESPN into our resultados table.
 * Safe to call on every page load — idempotent upserts, fast (~300ms).
 */
export async function syncFromESPN(): Promise<number> {
  const ahora = new Date();
  const yesterday = new Date(ahora);
  yesterday.setDate(yesterday.getDate() - 1);

  const events = [
    ...await fetchESPN(dateStr(yesterday)),
    ...await fetchESPN(dateStr(ahora)),
  ];

  let synced = 0;
  for (const event of events) {
    try {
      const comp = event.competitions?.[0];
      if (!comp) continue;

      const status = comp.status?.type;
      const isInProgress = status?.state === "in";
      const isFinished = status?.completed === true || status?.name === "STATUS_FINAL";
      if (!isInProgress && !isFinished) continue;

      const home = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "home");
      const away = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "away");
      if (!home || !away) continue;

      const homeAbr: string = home.team?.abbreviation ?? "";
      const homeName = ESPN_ABR[homeAbr] ?? home.team?.displayName ?? "";
      if (!homeName) continue;

      const eventDate = new Date(event.date);

      // Try hardcoded PARTIDOS first (group stage)
      let partidoId: string | null = null;
      const hardcoded = PARTIDOS.find((p) => {
        const pDate = new Date(p.fechaUTC);
        const diffHours = Math.abs(pDate.getTime() - eventDate.getTime()) / 3600000;
        return p.equipoLocal === homeName && diffHours < 4;
      });
      if (hardcoded) {
        partidoId = hardcoded.id;
      } else {
        // Try partidos_extra (knockout rounds)
        const extra = await query<{ id: string }>(
          `SELECT id FROM partidos_extra WHERE equipo_local = $1
           AND ABS(EXTRACT(EPOCH FROM (fecha_utc - $2::TIMESTAMPTZ))) < 14400`,
          [homeName, event.date]
        );
        if (extra[0]) partidoId = extra[0].id;
        // Also try ESPN id directly
        if (!partidoId) {
          const byId = await query<{ id: string }>(
            `SELECT id FROM partidos_extra WHERE id = $1`,
            [`ESPN-${event.id}`]
          );
          if (byId[0]) partidoId = byId[0].id;
        }
      }
      if (!partidoId) continue;
      const partido = { id: partidoId };

      const golesLocal = parseInt(home.score ?? "0", 10);
      const golesVisitante = parseInt(away.score ?? "0", 10);

      await query(
        `INSERT INTO resultados (partido_id, goles_local, goles_visitante, cerrado)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (partido_id)
         DO UPDATE SET goles_local = $2, goles_visitante = $3, cerrado = $4`,
        [partido.id, golesLocal, golesVisitante, isFinished]
      );
      synced++;
    } catch {
      // silently skip errors on individual events
    }
  }
  return synced;
}
