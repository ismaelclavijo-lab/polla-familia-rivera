import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { PARTIDOS } from "@/lib/partidos-data";

const ADMIN_EMAILS = ["ismael.clavijo@xiy.com.ec"];

// ESPN abbreviation → our local team name
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
  return d.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
}

async function fetchESPN(date: string) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.events ?? [];
}

export async function POST() {
  const session = await getSession();
  if (!session || !ADMIN_EMAILS.includes(session.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const ahora = new Date();
  // Fetch today and yesterday (covers UTC midnight edge cases)
  const yesterday = new Date(ahora);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(ahora);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const events = [
    ...await fetchESPN(dateStr(yesterday)),
    ...await fetchESPN(dateStr(ahora)),
    ...await fetchESPN(dateStr(tomorrow)),
  ];

  let synced = 0;
  const errors: string[] = [];

  for (const event of events) {
    try {
      const comp = event.competitions?.[0];
      if (!comp) continue;

      const status = comp.status?.type;
      const isInProgress = status?.state === "in";
      const isFinished = status?.completed === true || status?.name === "STATUS_FINAL";
      if (!isInProgress && !isFinished) continue; // skip scheduled games

      // Find home and away teams
      const home = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "home");
      const away = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === "away");
      if (!home || !away) continue;

      const homeName = ESPN_ABR[home.team.abbreviation];
      if (!homeName) continue;

      // Match to our partido by home team name + date proximity
      const eventDate = new Date(event.date);
      const partido = PARTIDOS.find((p) => {
        const pDate = new Date(p.fechaUTC);
        const diffHours = Math.abs(pDate.getTime() - eventDate.getTime()) / 3600000;
        return p.equipoLocal === homeName && diffHours < 4;
      });
      if (!partido) continue;

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
    } catch (e) {
      errors.push(String(e));
    }
  }

  return NextResponse.json({ ok: true, synced, errors });
}
