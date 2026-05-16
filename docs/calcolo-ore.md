# Calcolo Ore

## Costanti

```typescript
const ORARIO_CONTRATTUALE_MIN = 432; // 7h 12min
const SOGLIA_PAUSA_MIN        = 480; // 8h
const DEDUZIONE_PAUSA_MIN     = 30;  // 30min
```

## Algoritmo giornaliero

### Regola pausa pranzo

| Situazione | Deduzione automatica |
|---|---|
| **Fascia singola** e ore consecutive > 8h | Sì, -30min |
| **Fascia singola** e ore consecutive ≤ 8h | No |
| **Più fasce** (qualsiasi durata) | No — la pausa è già esplicita nelle uscite/rientri |

```typescript
function calcolaGiorno(fasce: Fascia[]): CalcoloGiorno {
  const oreTotaliMin = fasce.reduce(
    (acc, f) => acc + diffMinuti(f.entrata, f.uscita), 0
  );

  const fasceSingola   = fasce.length === 1;
  const pausaApplicata = fasceSingola && oreTotaliMin > SOGLIA_PAUSA_MIN;
  const oreNetteMin    = pausaApplicata
    ? oreTotaliMin - DEDUZIONE_PAUSA_MIN
    : oreTotaliMin;

  const saldoMin = oreNetteMin - ORARIO_CONTRATTUALE_MIN;

  return { oreTotaliMin, oreNetteMin, pausaApplicata, saldoMin };
}

function diffMinuti(entrata: string, uscita: string): number {
  const [hE, mE] = entrata.split(":").map(Number);
  const [hU, mU] = uscita.split(":").map(Number);
  return (hU * 60 + mU) - (hE * 60 + mE);
}
```

## Esempi

### Fascia singola

| Entrata | Uscita | Ore totali | Pausa auto | Ore nette | Saldo |
|---|---|---|---|---|---|
| 08:00 | 16:00 | 8h 00min | No | 8h 00min | +48min |
| 08:00 | 16:30 | 8h 30min | Sì (-30min) | 8h 00min | +48min |
| 08:00 | 17:00 | 9h 00min | Sì (-30min) | 8h 30min | +78min |
| 08:00 | 15:00 | 7h 00min | No | 7h 00min | -12min |
| 09:00 | 16:12 | 7h 12min | No | 7h 12min | 0min |

### Fasce multiple

| Fasce | Ore totali | Pausa auto | Ore nette | Saldo |
|---|---|---|---|---|
| 08:00-12:00 + 13:00-17:00 | 8h 00min | No | 8h 00min | +48min |
| 08:00-12:00 + 13:00-17:30 | 8h 30min | No | 8h 30min | +78min |
| 08:00-12:00 + 13:00-16:12 | 7h 12min | No | 7h 12min | 0min |

## Calcolo mensile

Il saldo mensile è la **somma algebrica** dei saldi giornalieri di tutti i giorni del mese inseriti con tipo = "lavoro". Ferie, permessi e malattie contribuiscono con saldo `0`. I festivi e i giorni non inseriti sono ignorati.

```typescript
function calcolaMese(timbrature: Record<string, Timbratura>): CalcoloMese {
  let saldoTotaleMin = 0;
  let giorniLavorativi = 0;

  for (const [data, t] of Object.entries(timbrature)) {
    if (t.tipo === "lavoro" && t.fasce?.length) {
      const { saldoMin } = calcolaGiorno(t.fasce);
      saldoTotaleMin += saldoMin;
      giorniLavorativi++;
    }
    // ferie/permesso/malattia → saldo 0, non modificano il totale
    // festivo → ignorato
  }

  return { saldoTotaleMin, giorniLavorativi };
}
```

## Formattazione output

I minuti vengono sempre convertiti in formato leggibile `±Xh YYmin`:

```typescript
function formatSaldo(min: number): string {
  const segno  = min >= 0 ? "+" : "-";
  const assoluto = Math.abs(min);
  const ore    = Math.floor(assoluto / 60);
  const minuti = assoluto % 60;
  return ore > 0
    ? `${segno}${ore}h ${String(minuti).padStart(2, "0")}min`
    : `${segno}${minuti}min`;
}
```

## TypeScript interfaces

```typescript
interface CalcoloGiorno {
  oreTotaliMin   : number;  // somma di tutte le fasce, prima di deduzioni
  oreNetteMin    : number;  // dopo eventuale deduzione pausa
  pausaApplicata : boolean;
  saldoMin       : number;  // positivo = straordinario, negativo = debito
}

interface CalcoloMese {
  saldoTotaleMin  : number;
  giorniLavorativi: number;
}
```
