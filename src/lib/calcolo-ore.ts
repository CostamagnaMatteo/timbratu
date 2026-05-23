import { TimeRange, Shift } from "@/types/shift";
import { CalcoloGiorno, CalcoloMese } from "@/types/timbratura";

const ORARIO_CONTRATTUALE_MIN = 432; // 7h 12min
const SOGLIA_PAUSA_MIN        = 480; // 8h
const DEDUZIONE_PAUSA_MIN     = 30;

// Arrotonda l'entrata al quarto d'ora intero successivo
function arrotondaEntrataQuarto(ora: string): number {
  const [h, m] = ora.split(":").map(Number);
  return Math.ceil((h * 60 + m) / 15) * 15;
}

function diffMinuti(entrata: string, uscita: string): number {
  const [hU, mU] = uscita.split(":").map(Number);
  return (hU * 60 + mU) - arrotondaEntrataQuarto(entrata);
}

export function calcolaGiorno(fasce: TimeRange[]): CalcoloGiorno {
  const oreTotaliMin = fasce.reduce((acc, f) => acc + diffMinuti(f.entrata, f.uscita), 0);
  const pausaApplicata = fasce.length === 1 && oreTotaliMin > SOGLIA_PAUSA_MIN;
  const oreNetteMin    = pausaApplicata ? oreTotaliMin - DEDUZIONE_PAUSA_MIN : oreTotaliMin;
  const saldoMin       = oreNetteMin - ORARIO_CONTRATTUALE_MIN;
  return { oreTotaliMin, oreNetteMin, pausaApplicata, saldoMin };
}

export function calcolaMese(timbrature: Record<string, Shift>): CalcoloMese {
  let saldoTotaleMin   = 0;
  let giorniLavorativi = 0;

  for (const t of Object.values(timbrature)) {
    if (t.tipo === "lavoro" && t.fasce?.length) {
      saldoTotaleMin += calcolaGiorno(t.fasce!).saldoMin;
      giorniLavorativi++;
    }
  }

  return { saldoTotaleMin, giorniLavorativi };
}

export function formatMinuti(min: number): string {
  const segno    = min >= 0 ? "+" : "-";
  const assoluto = Math.abs(min);
  const ore      = Math.floor(assoluto / 60);
  const minuti   = assoluto % 60;
  return ore > 0
    ? `${segno}${ore}h ${String(minuti).padStart(2, "0")}min`
    : `${segno}${minuti}min`;
}

export function formatOre(min: number): string {
  const ore    = Math.floor(min / 60);
  const minuti = min % 60;
  return ore > 0
    ? `${ore}h ${String(minuti).padStart(2, "0")}min`
    : `${minuti}min`;
}
