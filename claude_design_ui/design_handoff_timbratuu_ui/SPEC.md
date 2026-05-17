# Timbratu

Applicazione web per la gestione manuale delle timbrature di dipendenti pubblici. L'utente registra gli orari di entrata e uscita giornalieri; il sistema calcola le ore lavorate, applica le regole contrattuali e mostra il saldo ore mensile e complessivo.

---

## Stack

| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router, `output: "export"`) + TypeScript 5 |
| Autenticazione | Firebase Authentication — Google OAuth |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting (build statica da `out/`) |
| Styling | Tailwind CSS 4 |

---

## Funzionalità

### 1. Autenticazione

Accesso tramite account Google (OAuth 2.0 via Firebase Auth). Ogni utente vede e modifica esclusivamente le proprie timbrature. Le pagine sono protette dal componente `AuthGuard`; gli utenti non autenticati vengono reindirizzati a `/login`.

---

### 2. Home — Dashboard mese corrente

Percorso: `/`

Pannello di riepilogo del mese in corso con le seguenti card statistiche:

| Card | Descrizione |
|---|---|
| **Saldo complessivo** | Somma algebrica di tutti i saldi mensili aggregati su Firestore |
| **Saldo mese** | Saldo del mese corrente, calcolato in tempo reale dalle timbrature |
| **Giorni lavorati** | Contatore `lavorati / totale lavorativi del mese` |
| **Oggi** | Ore nette del giorno corrente, oppure il tipo giornata se non è "lavoro" |
| **Ferie / Permessi / Malattia / Festivi** | Conteggio dei giorni per ciascuna tipologia non-lavoro |
| **Proiezione fine mese** | Saldo stimato a fine mese basato sulla media giornaliera attuale (mostrata solo con ≥ 2 giorni lavorati) |

La proiezione si calcola come:

```
media_giornaliera = saldo_attuale / giorni_lavorati
saldo_proiettato  = saldo_attuale + media_giornaliera × giorni_rimanenti
```

---

### 3. Vista mensile — Tabella giornaliera

Percorso: `/mese/[anno]/[mese]`

Tabella con una riga per ogni giorno del mese. Colonne:

| Colonna | Contenuto |
|---|---|
| Giorno | Nome giorno + numero (weekend in grigio) |
| Tipo | Badge colorato per tipo giornata |
| Entrata | Prima entrata della prima fascia |
| Uscita | Ultima uscita dell'ultima fascia |
| Fasce | Numero di fasce orarie (badge blu se > 1) |
| Ore nette | Ore lavorate dopo l'eventuale deduzione pausa |
| Pausa | `−30` in arancione se la deduzione automatica è stata applicata |
| Saldo | Delta rispetto all'orario contrattuale (verde se ≥ 0, rosso se < 0) |
| Azioni | Pulsanti `+` / ✏️ / 🗑️ per giorni passati o odierni; assenti per giorni futuri |

L'header mostra il saldo del mese e un `<input type="month">` per navigare tra i mesi.

---

### 4. Gestione timbrature — Modale inserimento / modifica

Si apre cliccando `+` o ✏️ su una riga. Permette di:

- Scegliere il **tipo giornata** tra: `lavoro`, `ferie`, `permesso`, `malattia`, `festivo`
- Inserire una o più **fasce orarie** (entrata → uscita) solo per tipo `lavoro`
- Aggiungere o rimuovere fasce dinamicamente
- Aggiungere **note** opzionali (es. "smart working", "visita medica")

L'input orario (`InputOra`) accetta formato `HH:MM` testuale con inserimento automatico dei `:` e validazione in tempo reale (ore 0–23, minuti 0–59).

Quando l'entrata è inserita, la modale mostra l'**entrata arrotondata** al quarto d'ora successivo con una nota `→ HH:MM` in arancione, prima ancora di salvare.

Validazione al salvataggio:
- Ogni fascia deve avere entrata e uscita compilate
- L'uscita deve essere successiva all'entrata
- Le fasce non devono sovrapporsi

---

### 5. Calcolo ore

File: `src/lib/calcolo-ore.ts`

#### Costanti

```typescript
const ORARIO_CONTRATTUALE_MIN = 432;  // 7h 12min — orario contrattuale giornaliero
const SOGLIA_PAUSA_MIN        = 480;  // 8h  — soglia sopra cui scatta la pausa automatica
const DEDUZIONE_PAUSA_MIN     = 30;   // 30min — deduzione pausa pranzo automatica
```

#### Arrotondamento entrata

L'entrata viene arrotondata al **quarto d'ora intero successivo** prima del calcolo della durata:

```
entrata effettiva = ⌈(h × 60 + m) / 15⌉ × 15  (in minuti)
```

Esempi: `08:01 → 08:15`, `08:15 → 08:15`, `08:16 → 08:30`. Il database salva sempre il valore reale inserito dall'utente.

#### Regola pausa pranzo

| Condizione | Deduzione |
|---|---|
| Fascia singola **e** ore consecutive > 8h | −30 min automatici |
| Fascia singola **e** ore consecutive ≤ 8h | Nessuna |
| Più fasce (qualsiasi durata) | Nessuna — la pausa è implicita nelle pause tra fasce |

#### Saldo giornaliero

```
ore_nette = ore_totali − (30 se pausa applicata)
saldo_min = ore_nette − ORARIO_CONTRATTUALE_MIN
```

Saldo positivo = straordinario accumulato. Saldo negativo = debito orario.

#### Saldo mensile

Somma algebrica dei saldi giornalieri di tutti i giorni con `tipo = "lavoro"`. Ferie, permessi, malattia e festivi non modificano il saldo (contribuiscono con 0).

---

### 6. Aggregazione mensile su Firestore

File: `src/lib/aggregazione.ts`

Per calcolare il **saldo complessivo** (tutti i mesi) senza rileggere ogni timbratura storica, il sistema mantiene un documento di aggregazione per mese in:

```
users/{uid}/aggregazioni/{YYYY-MM}
  saldoTotaleMin:   number
  giorniLavorativi: number
  aggregatoIl:      string  // YYYY-MM-DD
```

#### Regola di aggiornamento

| Condizione | Aggregazione |
|---|---|
| Mese diverso dal mese corrente | Sempre (dati definitivi) |
| Mese corrente, nessuna aggregazione esistente | Sì |
| Mese corrente, ultima aggregazione < 7 giorni fa | No (usa cache) |
| Mese corrente, ultima aggregazione ≥ 7 giorni fa | Sì |

L'aggregazione viene triggerata automaticamente dopo ogni salvataggio o eliminazione di una timbratura.

---

### 7. Tipi giornata

Definiti in `src/types/timbratura.ts`:

| Valore | Label | Badge |
|---|---|---|
| `lavoro` | Lavoro | Blu |
| `ferie` | Ferie | Verde |
| `permesso` | Permesso | Arancione |
| `malattia` | Malattia | Rosso |
| `festivo` | Festivo | Grigio |

---

## Modello dati Firestore

```
users/{uid}/timbrature/{YYYY-MM-DD}
  tipo:   TipoGiornata          // "lavoro" | "ferie" | "permesso" | "malattia" | "festivo"
  fasce?: Fascia[]              // solo per tipo "lavoro"
    entrata: string             // "08:30" — valore reale inserito
    uscita:  string             // "17:00"
  note?:  string

users/{uid}/aggregazioni/{YYYY-MM}
  saldoTotaleMin:   number
  giorniLavorativi: number
  aggregatoIl:      string      // YYYY-MM-DD
```

L'ID documento timbratura coincide con la data `YYYY-MM-DD`, garantendo unicità naturale per giorno.

---

## Sviluppo locale

```bash
# Avvia Next.js dev server
npm run dev

# Avvia emulatori Firebase (Auth + Firestore) + Next.js in parallelo
npm run dev:local
```

Variabili d'ambiente richieste (file `.env.local`):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_USE_EMULATORS=true   # solo per sviluppo locale con emulatori
```

---

## Build e deploy

```bash
npm run build        # genera la build statica in out/
firebase deploy      # pubblica su Firebase Hosting
```
