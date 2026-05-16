# Modello Dati

## Struttura Firestore

```
users/
  {userId}/
    timbrature/
      {YYYY-MM-DD}/
        fasce : Array<{ entrata: string, uscita: string }>
        tipo  : TipoGiornata
        note? : string
```

## Documento timbratura

| Campo | Tipo | Obbligatorio | Valori ammessi | Esempio |
|---|---|---|---|---|
| `fasce` | `Fascia[]` | Solo se tipo = "lavoro" | array ordinato di coppie | vedi sotto |
| `tipo` | `TipoGiornata` | Sì | vedi sotto | `"lavoro"` |
| `note` | `string` | No | testo libero | `"Riunione pomeriggio"` |

### Fascia oraria

```typescript
interface Fascia {
  entrata: string;  // "HH:MM" (24h)
  uscita:  string;  // "HH:MM" (24h), sempre successiva a entrata
}
```

**Esempio documento con più fasce:**
```json
{
  "tipo": "lavoro",
  "fasce": [
    { "entrata": "08:00", "uscita": "12:00" },
    { "entrata": "13:00", "uscita": "17:30" }
  ],
  "note": ""
}
```

### Vincoli sulle fasce

- Ogni fascia deve avere sia `entrata` che `uscita` (vincolo forte — nessuna entrata senza uscita)
- `uscita` deve essere successiva a `entrata` nella stessa fascia
- Le fasce non devono sovrapporsi
- Le fasce sono salvate ordinate per `entrata` crescente

## TipoGiornata

```typescript
type TipoGiornata = "lavoro" | "ferie" | "permesso" | "malattia" | "festivo";
```

| Valore | Descrizione | Entrata/Uscita richiesti |
|---|---|---|
| `lavoro` | Giorno lavorativo con timbrature | Sì |
| `ferie` | Giornata di ferie | No |
| `permesso` | Permesso (es. permesso orario o giornaliero) | No |
| `malattia` | Assenza per malattia | No |
| `festivo` | Festività nazionale o locale | No |

## ID documento

L'ID è la **data in formato `YYYY-MM-DD`** (es. `2026-05-16`).

- Garantisce un solo documento per giorno per utente (upsert sicuro)
- Rende le query per intervallo di date dirette e leggibili
- Elimina la necessità di un campo `data` nel documento stesso

## Query principali

```typescript
// Tutte le timbrature di un mese
collection(`users/${uid}/timbrature`)
  .where(documentId(), ">=", "2026-05-01")
  .where(documentId(), "<=", "2026-05-31")
  .orderBy(documentId(), "asc")

// Singolo giorno
doc(`users/${uid}/timbrature/2026-05-16`)
```

## TypeScript interface

```typescript
interface Fascia {
  entrata: string;
  uscita:  string;
}

interface Timbratura {
  fasce?: Fascia[];   // undefined se tipo != "lavoro"
  tipo:   TipoGiornata;
  note?:  string;
}
```
