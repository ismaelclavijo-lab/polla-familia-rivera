export interface Partido {
  id: string;
  grupo: string;
  fase: string;
  jornada: number;
  fechaUTC: string; // ISO 8601
  equipoLocal: string;
  equipoVisitante: string;
  estadio: string;
  flagLocal: string;
  flagVisitante: string;
}

// All 72 group stage matches — World Cup 2026
// Times converted from ET (EDT = UTC-4)
export const PARTIDOS: Partido[] = [
  // ── MATCHDAY 1 ──────────────────────────────────────────────────
  // Jun 11
  { id: "G001", grupo: "A", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-11T19:00:00Z", equipoLocal: "México", equipoVisitante: "Sudáfrica", estadio: "Estadio Azteca, México City", flagLocal: "🇲🇽", flagVisitante: "🇿🇦" },
  { id: "G002", grupo: "A", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-12T02:00:00Z", equipoLocal: "Corea del Sur", equipoVisitante: "República Checa", estadio: "Estadio Akron, Guadalajara", flagLocal: "🇰🇷", flagVisitante: "🇨🇿" },
  // Jun 12
  { id: "G003", grupo: "B", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-12T19:00:00Z", equipoLocal: "Canadá", equipoVisitante: "Bosnia y Herzegovina", estadio: "BMO Field, Toronto", flagLocal: "🇨🇦", flagVisitante: "🇧🇦" },
  { id: "G004", grupo: "D", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-13T01:00:00Z", equipoLocal: "EE.UU.", equipoVisitante: "Paraguay", estadio: "SoFi Stadium, Los Ángeles", flagLocal: "🇺🇸", flagVisitante: "🇵🇾" },
  // Jun 13
  { id: "G005", grupo: "B", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-13T19:00:00Z", equipoLocal: "Catar", equipoVisitante: "Suiza", estadio: "Levi's Stadium, San Francisco", flagLocal: "🇶🇦", flagVisitante: "🇨🇭" },
  { id: "G006", grupo: "C", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-13T22:00:00Z", equipoLocal: "Brasil", equipoVisitante: "Marruecos", estadio: "MetLife Stadium, Nueva York", flagLocal: "🇧🇷", flagVisitante: "🇲🇦" },
  { id: "G007", grupo: "C", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-14T01:00:00Z", equipoLocal: "Haití", equipoVisitante: "Escocia", estadio: "Gillette Stadium, Boston", flagLocal: "🇭🇹", flagVisitante: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  // Jun 14
  { id: "G008", grupo: "D", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-14T04:00:00Z", equipoLocal: "Australia", equipoVisitante: "Turquía", estadio: "BC Place, Vancouver", flagLocal: "🇦🇺", flagVisitante: "🇹🇷" },
  { id: "G009", grupo: "E", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-14T17:00:00Z", equipoLocal: "Alemania", equipoVisitante: "Curazao", estadio: "NRG Stadium, Houston", flagLocal: "🇩🇪", flagVisitante: "🇨🇼" },
  { id: "G010", grupo: "F", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-14T20:00:00Z", equipoLocal: "Países Bajos", equipoVisitante: "Japón", estadio: "AT&T Stadium, Dallas", flagLocal: "🇳🇱", flagVisitante: "🇯🇵" },
  { id: "G011", grupo: "E", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-14T23:00:00Z", equipoLocal: "Costa de Marfil", equipoVisitante: "Ecuador", estadio: "Lincoln Financial Field, Filadelfia", flagLocal: "🇨🇮", flagVisitante: "🇪🇨" },
  { id: "G012", grupo: "F", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-15T02:00:00Z", equipoLocal: "Suecia", equipoVisitante: "Túnez", estadio: "Estadio BBVA, Monterrey", flagLocal: "🇸🇪", flagVisitante: "🇹🇳" },
  // Jun 15
  { id: "G013", grupo: "H", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-15T16:00:00Z", equipoLocal: "España", equipoVisitante: "Cabo Verde", estadio: "Mercedes-Benz Stadium, Atlanta", flagLocal: "🇪🇸", flagVisitante: "🇨🇻" },
  { id: "G014", grupo: "G", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-15T19:00:00Z", equipoLocal: "Bélgica", equipoVisitante: "Egipto", estadio: "Lumen Field, Seattle", flagLocal: "🇧🇪", flagVisitante: "🇪🇬" },
  { id: "G015", grupo: "H", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-15T22:00:00Z", equipoLocal: "Arabia Saudita", equipoVisitante: "Uruguay", estadio: "Hard Rock Stadium, Miami", flagLocal: "🇸🇦", flagVisitante: "🇺🇾" },
  { id: "G016", grupo: "G", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-16T01:00:00Z", equipoLocal: "Irán", equipoVisitante: "Nueva Zelanda", estadio: "SoFi Stadium, Los Ángeles", flagLocal: "🇮🇷", flagVisitante: "🇳🇿" },
  // Jun 16
  { id: "G017", grupo: "I", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-16T19:00:00Z", equipoLocal: "Francia", equipoVisitante: "Senegal", estadio: "MetLife Stadium, Nueva York", flagLocal: "🇫🇷", flagVisitante: "🇸🇳" },
  { id: "G018", grupo: "I", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-16T22:00:00Z", equipoLocal: "Irak", equipoVisitante: "Noruega", estadio: "Gillette Stadium, Boston", flagLocal: "🇮🇶", flagVisitante: "🇳🇴" },
  { id: "G019", grupo: "J", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-17T01:00:00Z", equipoLocal: "Argentina", equipoVisitante: "Argelia", estadio: "Arrowhead Stadium, Kansas City", flagLocal: "🇦🇷", flagVisitante: "🇩🇿" },
  // Jun 17
  { id: "G020", grupo: "J", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-17T04:00:00Z", equipoLocal: "Austria", equipoVisitante: "Jordania", estadio: "Levi's Stadium, San Francisco", flagLocal: "🇦🇹", flagVisitante: "🇯🇴" },
  { id: "G021", grupo: "K", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-17T17:00:00Z", equipoLocal: "Portugal", equipoVisitante: "R. D. Congo", estadio: "NRG Stadium, Houston", flagLocal: "🇵🇹", flagVisitante: "🇨🇩" },
  { id: "G022", grupo: "L", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-17T20:00:00Z", equipoLocal: "Inglaterra", equipoVisitante: "Croacia", estadio: "AT&T Stadium, Dallas", flagLocal: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flagVisitante: "🇭🇷" },
  { id: "G023", grupo: "L", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-17T23:00:00Z", equipoLocal: "Ghana", equipoVisitante: "Panamá", estadio: "BMO Field, Toronto", flagLocal: "🇬🇭", flagVisitante: "🇵🇦" },
  { id: "G024", grupo: "K", fase: "Fase de Grupos", jornada: 1, fechaUTC: "2026-06-18T02:00:00Z", equipoLocal: "Uzbekistán", equipoVisitante: "Colombia", estadio: "Estadio Azteca, México City", flagLocal: "🇺🇿", flagVisitante: "🇨🇴" },

  // ── MATCHDAY 2 ──────────────────────────────────────────────────
  // Jun 18
  { id: "G025", grupo: "A", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-18T16:00:00Z", equipoLocal: "República Checa", equipoVisitante: "Sudáfrica", estadio: "Mercedes-Benz Stadium, Atlanta", flagLocal: "🇨🇿", flagVisitante: "🇿🇦" },
  { id: "G026", grupo: "B", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-18T19:00:00Z", equipoLocal: "Suiza", equipoVisitante: "Bosnia y Herzegovina", estadio: "SoFi Stadium, Los Ángeles", flagLocal: "🇨🇭", flagVisitante: "🇧🇦" },
  { id: "G027", grupo: "B", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-18T22:00:00Z", equipoLocal: "Canadá", equipoVisitante: "Catar", estadio: "BC Place, Vancouver", flagLocal: "🇨🇦", flagVisitante: "🇶🇦" },
  { id: "G028", grupo: "A", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-19T01:00:00Z", equipoLocal: "México", equipoVisitante: "Corea del Sur", estadio: "Estadio Akron, Guadalajara", flagLocal: "🇲🇽", flagVisitante: "🇰🇷" },
  // Jun 19
  { id: "G029", grupo: "D", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-19T04:00:00Z", equipoLocal: "Turquía", equipoVisitante: "Paraguay", estadio: "Levi's Stadium, San Francisco", flagLocal: "🇹🇷", flagVisitante: "🇵🇾" },
  { id: "G030", grupo: "D", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-19T19:00:00Z", equipoLocal: "EE.UU.", equipoVisitante: "Australia", estadio: "Lumen Field, Seattle", flagLocal: "🇺🇸", flagVisitante: "🇦🇺" },
  { id: "G031", grupo: "C", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-19T22:00:00Z", equipoLocal: "Escocia", equipoVisitante: "Marruecos", estadio: "Gillette Stadium, Boston", flagLocal: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", flagVisitante: "🇲🇦" },
  { id: "G032", grupo: "C", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-20T00:30:00Z", equipoLocal: "Brasil", equipoVisitante: "Haití", estadio: "Lincoln Financial Field, Filadelfia", flagLocal: "🇧🇷", flagVisitante: "🇭🇹" },
  // Jun 20
  { id: "G033", grupo: "F", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-20T17:00:00Z", equipoLocal: "Países Bajos", equipoVisitante: "Suecia", estadio: "NRG Stadium, Houston", flagLocal: "🇳🇱", flagVisitante: "🇸🇪" },
  { id: "G034", grupo: "E", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-20T20:00:00Z", equipoLocal: "Alemania", equipoVisitante: "Costa de Marfil", estadio: "BMO Field, Toronto", flagLocal: "🇩🇪", flagVisitante: "🇨🇮" },
  { id: "G035", grupo: "E", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-21T00:00:00Z", equipoLocal: "Ecuador", equipoVisitante: "Curazao", estadio: "Arrowhead Stadium, Kansas City", flagLocal: "🇪🇨", flagVisitante: "🇨🇼" },
  // Jun 21
  { id: "G036", grupo: "F", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-21T04:00:00Z", equipoLocal: "Túnez", equipoVisitante: "Japón", estadio: "Estadio BBVA, Monterrey", flagLocal: "🇹🇳", flagVisitante: "🇯🇵" },
  { id: "G037", grupo: "H", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-21T16:00:00Z", equipoLocal: "España", equipoVisitante: "Arabia Saudita", estadio: "Mercedes-Benz Stadium, Atlanta", flagLocal: "🇪🇸", flagVisitante: "🇸🇦" },
  { id: "G038", grupo: "G", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-21T19:00:00Z", equipoLocal: "Bélgica", equipoVisitante: "Irán", estadio: "SoFi Stadium, Los Ángeles", flagLocal: "🇧🇪", flagVisitante: "🇮🇷" },
  { id: "G039", grupo: "H", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-21T22:00:00Z", equipoLocal: "Uruguay", equipoVisitante: "Cabo Verde", estadio: "Hard Rock Stadium, Miami", flagLocal: "🇺🇾", flagVisitante: "🇨🇻" },
  { id: "G040", grupo: "G", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-22T01:00:00Z", equipoLocal: "Nueva Zelanda", equipoVisitante: "Egipto", estadio: "BC Place, Vancouver", flagLocal: "🇳🇿", flagVisitante: "🇪🇬" },
  // Jun 22
  { id: "G041", grupo: "J", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-22T17:00:00Z", equipoLocal: "Argentina", equipoVisitante: "Austria", estadio: "AT&T Stadium, Dallas", flagLocal: "🇦🇷", flagVisitante: "🇦🇹" },
  { id: "G042", grupo: "I", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-22T21:00:00Z", equipoLocal: "Francia", equipoVisitante: "Irak", estadio: "Lincoln Financial Field, Filadelfia", flagLocal: "🇫🇷", flagVisitante: "🇮🇶" },
  { id: "G043", grupo: "I", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-23T00:00:00Z", equipoLocal: "Noruega", equipoVisitante: "Senegal", estadio: "MetLife Stadium, Nueva York", flagLocal: "🇳🇴", flagVisitante: "🇸🇳" },
  { id: "G044", grupo: "J", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-23T03:00:00Z", equipoLocal: "Jordania", equipoVisitante: "Argelia", estadio: "Levi's Stadium, San Francisco", flagLocal: "🇯🇴", flagVisitante: "🇩🇿" },
  // Jun 23
  { id: "G045", grupo: "K", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-23T17:00:00Z", equipoLocal: "Portugal", equipoVisitante: "Uzbekistán", estadio: "NRG Stadium, Houston", flagLocal: "🇵🇹", flagVisitante: "🇺🇿" },
  { id: "G046", grupo: "L", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-23T20:00:00Z", equipoLocal: "Inglaterra", equipoVisitante: "Ghana", estadio: "Gillette Stadium, Boston", flagLocal: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flagVisitante: "🇬🇭" },
  { id: "G047", grupo: "L", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-23T23:00:00Z", equipoLocal: "Panamá", equipoVisitante: "Croacia", estadio: "BMO Field, Toronto", flagLocal: "🇵🇦", flagVisitante: "🇭🇷" },
  { id: "G048", grupo: "K", fase: "Fase de Grupos", jornada: 2, fechaUTC: "2026-06-24T02:00:00Z", equipoLocal: "Colombia", equipoVisitante: "R. D. Congo", estadio: "Estadio Akron, Guadalajara", flagLocal: "🇨🇴", flagVisitante: "🇨🇩" },

  // ── MATCHDAY 3 ──────────────────────────────────────────────────
  // Jun 24
  { id: "G049", grupo: "B", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-24T19:00:00Z", equipoLocal: "Suiza", equipoVisitante: "Canadá", estadio: "BC Place, Vancouver", flagLocal: "🇨🇭", flagVisitante: "🇨🇦" },
  { id: "G050", grupo: "B", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-24T19:00:00Z", equipoLocal: "Bosnia y Herzegovina", equipoVisitante: "Catar", estadio: "Lumen Field, Seattle", flagLocal: "🇧🇦", flagVisitante: "🇶🇦" },
  { id: "G051", grupo: "C", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-24T22:00:00Z", equipoLocal: "Escocia", equipoVisitante: "Brasil", estadio: "Hard Rock Stadium, Miami", flagLocal: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", flagVisitante: "🇧🇷" },
  { id: "G052", grupo: "C", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-24T22:00:00Z", equipoLocal: "Marruecos", equipoVisitante: "Haití", estadio: "Mercedes-Benz Stadium, Atlanta", flagLocal: "🇲🇦", flagVisitante: "🇭🇹" },
  { id: "G053", grupo: "A", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-25T01:00:00Z", equipoLocal: "República Checa", equipoVisitante: "México", estadio: "Estadio Azteca, México City", flagLocal: "🇨🇿", flagVisitante: "🇲🇽" },
  { id: "G054", grupo: "A", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-25T01:00:00Z", equipoLocal: "Sudáfrica", equipoVisitante: "Corea del Sur", estadio: "Estadio BBVA, Monterrey", flagLocal: "🇿🇦", flagVisitante: "🇰🇷" },
  // Jun 25
  { id: "G055", grupo: "E", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-25T20:00:00Z", equipoLocal: "Curazao", equipoVisitante: "Costa de Marfil", estadio: "Lincoln Financial Field, Filadelfia", flagLocal: "🇨🇼", flagVisitante: "🇨🇮" },
  { id: "G056", grupo: "E", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-25T20:00:00Z", equipoLocal: "Ecuador", equipoVisitante: "Alemania", estadio: "MetLife Stadium, Nueva York", flagLocal: "🇪🇨", flagVisitante: "🇩🇪" },
  { id: "G057", grupo: "F", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-25T23:00:00Z", equipoLocal: "Japón", equipoVisitante: "Suecia", estadio: "AT&T Stadium, Dallas", flagLocal: "🇯🇵", flagVisitante: "🇸🇪" },
  { id: "G058", grupo: "F", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-25T23:00:00Z", equipoLocal: "Túnez", equipoVisitante: "Países Bajos", estadio: "Arrowhead Stadium, Kansas City", flagLocal: "🇹🇳", flagVisitante: "🇳🇱" },
  { id: "G059", grupo: "D", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-26T02:00:00Z", equipoLocal: "Turquía", equipoVisitante: "EE.UU.", estadio: "SoFi Stadium, Los Ángeles", flagLocal: "🇹🇷", flagVisitante: "🇺🇸" },
  { id: "G060", grupo: "D", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-26T02:00:00Z", equipoLocal: "Paraguay", equipoVisitante: "Australia", estadio: "Levi's Stadium, San Francisco", flagLocal: "🇵🇾", flagVisitante: "🇦🇺" },
  // Jun 26
  { id: "G061", grupo: "I", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-26T19:00:00Z", equipoLocal: "Noruega", equipoVisitante: "Francia", estadio: "Gillette Stadium, Boston", flagLocal: "🇳🇴", flagVisitante: "🇫🇷" },
  { id: "G062", grupo: "I", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-26T19:00:00Z", equipoLocal: "Senegal", equipoVisitante: "Irak", estadio: "BMO Field, Toronto", flagLocal: "🇸🇳", flagVisitante: "🇮🇶" },
  { id: "G063", grupo: "H", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-27T00:00:00Z", equipoLocal: "Cabo Verde", equipoVisitante: "Arabia Saudita", estadio: "NRG Stadium, Houston", flagLocal: "🇨🇻", flagVisitante: "🇸🇦" },
  { id: "G064", grupo: "H", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-27T00:00:00Z", equipoLocal: "Uruguay", equipoVisitante: "España", estadio: "Estadio Akron, Guadalajara", flagLocal: "🇺🇾", flagVisitante: "🇪🇸" },
  { id: "G065", grupo: "G", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-27T03:00:00Z", equipoLocal: "Egipto", equipoVisitante: "Irán", estadio: "Lumen Field, Seattle", flagLocal: "🇪🇬", flagVisitante: "🇮🇷" },
  { id: "G066", grupo: "G", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-27T03:00:00Z", equipoLocal: "Nueva Zelanda", equipoVisitante: "Bélgica", estadio: "BC Place, Vancouver", flagLocal: "🇳🇿", flagVisitante: "🇧🇪" },
  // Jun 27
  { id: "G067", grupo: "L", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-27T21:00:00Z", equipoLocal: "Panamá", equipoVisitante: "Inglaterra", estadio: "MetLife Stadium, Nueva York", flagLocal: "🇵🇦", flagVisitante: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "G068", grupo: "L", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-27T21:00:00Z", equipoLocal: "Croacia", equipoVisitante: "Ghana", estadio: "Lincoln Financial Field, Filadelfia", flagLocal: "🇭🇷", flagVisitante: "🇬🇭" },
  { id: "G069", grupo: "K", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-27T23:30:00Z", equipoLocal: "Colombia", equipoVisitante: "Portugal", estadio: "Hard Rock Stadium, Miami", flagLocal: "🇨🇴", flagVisitante: "🇵🇹" },
  { id: "G070", grupo: "K", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-27T23:30:00Z", equipoLocal: "R. D. Congo", equipoVisitante: "Uzbekistán", estadio: "Mercedes-Benz Stadium, Atlanta", flagLocal: "🇨🇩", flagVisitante: "🇺🇿" },
  { id: "G071", grupo: "J", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-28T02:00:00Z", equipoLocal: "Argelia", equipoVisitante: "Austria", estadio: "Arrowhead Stadium, Kansas City", flagLocal: "🇩🇿", flagVisitante: "🇦🇹" },
  { id: "G072", grupo: "J", fase: "Fase de Grupos", jornada: 3, fechaUTC: "2026-06-28T02:00:00Z", equipoLocal: "Jordania", equipoVisitante: "Argentina", estadio: "AT&T Stadium, Dallas", flagLocal: "🇯🇴", flagVisitante: "🇦🇷" },
];

export function getPartidoById(id: string): Partido | undefined {
  return PARTIDOS.find((p) => p.id === id);
}

export function getPartidosByJornada(jornada: number): Partido[] {
  return PARTIDOS.filter((p) => p.jornada === jornada);
}

export function getPartidosByGrupo(grupo: string): Partido[] {
  return PARTIDOS.filter((p) => p.grupo === grupo);
}

export function getCurrentWeekRange(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    d.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  return { start: monday, end: sunday, label: `${fmt(monday)} – ${fmt(sunday)}` };
}

export function getWeekPartidos(): Partido[] {
  const { start, end } = getCurrentWeekRange();
  return PARTIDOS.filter((p) => {
    const d = new Date(p.fechaUTC);
    return d >= start && d <= end;
  });
}
