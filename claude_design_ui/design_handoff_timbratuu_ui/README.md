# Handoff · Timbratuu UI (wireframes → Next.js)

## Overview
Timbratuu è un'app web privata per la gestione manuale delle timbrature di dipendenti pubblici (vedi `SPEC.md` per il dominio completo: tipi giornata, fasce, arrotondamento al quarto d'ora, pausa pranzo automatica, saldo mensile e banca ore complessiva).

Questo pacchetto contiene **wireframe esplorativi** per 4 schermate principali (Home, Vista mensile, Modale timbratura, Storico anno), con 2 varianti ciascuna. La direzione scelta dal designer è indicata sotto in **“Variante scelta”**; le altre restano nel file come riferimento per dettagli alternativi (es. trattamento del saldo, layout del modale).

## Sui file di design
I file in `Timbratuu Wireframes.html` + `wireframes.jsx` sono **riferimenti di design creati in HTML/React** — prototipi che mostrano struttura, gerarchia e interazioni intese. **Non sono codice di produzione da copiare**. Il compito è ricreare queste schermate nello stack reale (Next.js 16 App Router + TS + Tailwind 4 + Firebase) seguendo i pattern del codebase esistente: server/client components, hooks per Firestore, componenti riutilizzabili.

## Fidelity
**Low-fidelity (wireframe).** Stile carta-e-matita con font scritti a mano scelto deliberatamente per esplorare struttura e flusso senza impegnarsi su un'estetica finale. Per l'implementazione:

- **Usa** struttura, gerarchia delle informazioni, posizione dei controlli, contenuti/copy (in italiano) come da wireframe.
- **Non riprodurre** font scritti a mano, bordi sketch, ruotini decorativi: applica un design system pulito e moderno (suggerimenti più sotto).
- Le esatte misure pixel-perfect non contano; conta che il layout e il comportamento siano fedeli.

---

## Stack target (da `SPEC.md`)
- Next.js 16 App Router, `output: "export"` (build statica)
- TypeScript 5
- Tailwind CSS 4
- Firebase Auth (Google OAuth) + Firestore + Hosting
- Componente `AuthGuard` già esistente per proteggere le route

---

## Schermate

### 1. Home — `/`

**Variante scelta: A (“Banca ore + ledger”)** con hero del saldo trattato come variante B.

**Scopo:** dashboard del mese in corso con la **banca ore complessiva in primo piano** (metrica chiave) + riepilogo mese + ultimi giorni timbrati.

**Layout (mobile-first, top → bottom):**
1. **Header row** — logo testuale `Timbratuu` a sinistra, avatar/profilo cerchio a destra.
2. **Month picker prominente** — riga full-width con chevron `‹` `›` come tap target ai due lati e nome mese al centro (es. `maggio 2026`) in tipografia grande. Tappando il nome → date picker / dropdown mese. Anno implicito; mostralo se ≠ anno corrente. **Importante:** è il controllo di navigazione mese principale, deve essere visibilmente prominente, non un piccolo dropdown nell'header.
3. **Hero saldo (banca ore totale)** — *centrato*, niente card:
   - micro-label uppercase: `LA TUA BANCA ORE`
   - numero gigante: `+27` (inchiostro/foreground primario)
   - unità inline più piccola e verde se positivo / rossa se negativo: `h 42m`
   - sotto, pill/chip piccolo: `questo mese  +4h 12m`
4. **Griglia 2×2 stat cards** (gap ~8px):
   - **OGGI** — ore nette del giorno + delta vs contrattuale (verde/rosso). Se oggi è ferie/permesso/malattia/festivo, mostra il tipo invece.
   - **GIORNI** — `12 / 21` lavorati / totale lavorativi del mese.
   - **PROIEZIONE** — saldo proiettato fine mese (solo se ≥ 2 giorni lavorati, vedi formula in `SPEC.md`).
   - **ASSENZE** — chip compatti `F 2  P 1  M 0` (Ferie/Permessi/Malattia, opz. Festivi).
5. **Ultimi giorni (ledger)** — lista 4–5 righe: `giorno · entrata→uscita · saldo`. Tap riga → vista mensile con focus. Link `vai al mese →` in alto a destra del blocco.
6. **FAB** `+ timbra oggi` in basso a destra, sticky/fixed. Apre il modale per la data odierna.

**Stati:**
- Oggi non timbrato + non festivo → FAB enfatizzato; card OGGI mostra `—`.
- Oggi in corso (entrata senza uscita) → card OGGI mostra `08:15 → ?` + “in corso”.
- Mese futuro selezionato → niente proiezione, niente “oggi”.

---

### 2. Vista mensile — `/mese/[anno]/[mese]`

**Due varianti proposte, da scegliere con l'utente:**

#### Variante A — Lista a barre
Ogni giorno è una riga: `[giorno] [bar chart ore lavorate con tick contrattuale a 7h12] [saldo +/-]`. Weekend in grigio attenuato. Filter chips in cima (tutti / lavoro / ferie / permessi). Riga = tap target → apre modale modifica.

#### Variante B — Calendario griglia
Griglia 6×7 (con day-of-week header L M M G V S D). Ogni cella mostra: numero giorno + tipo (icona/lettera) + delta saldo piccolo in basso. Colore di sfondo cella codifica il saldo (verde > 0, rosso < 0, neutro = 0; verde/arancio/rosso per ferie/permesso/malattia). Cella futura attenuata, oggi evidenziato. Tap cella → modale.

**Comune a entrambe:**
- Header con month picker (stesso pattern della Home).
- Stat strip in cima: `SALDO MESE` + `BANCA TOT.` come due card compatte.
- Validazione/colori: saldo ≥ 0 verde, < 0 rosso, = 0 neutro.
- Per giorni futuri → niente azioni.

**Raccomandazione:** implementare A (più vicino alla spec originale) come default; B come toggle vista (icona switcher).

---

### 3. Modale inserimento/modifica timbratura

**Due varianti proposte:**

#### Variante A — Fasce + timeline 0–24h *(consigliata come baseline)*
Modale centrale. Sezioni dall'alto:
1. **Header**: titolo `nuova timbratura` / `modifica timbratura` + data + close `✕`.
2. **Tipo giornata** — pills selezionabili: `lavoro` `ferie` `permesso` `malattia` `festivo`. Il selezionato è scuro pieno.
3. **Fasce orarie** — solo se `tipo === 'lavoro'`. Card per ogni fascia con due input `HH:MM` (entrata → uscita), icona trash. Sotto la prima fascia, hint arancione `→ arrotondato a 08:15` se l'arrotondamento al quarto d'ora cambia il valore. Pulsante dashed `+ aggiungi fascia`.
4. **Anteprima 0–24h** — barra orizzontale con tick (0, 6, 12, 18, 24) e blocchi verdi per ogni fascia. Sotto: `ore: 8h 30m` a sinistra, `saldo: +1h 18m` (verde/rosso) a destra.
5. **Note** — textarea opzionale.
6. **Azioni** — `annulla` (outline) + `salva ✓` (scuro pieno).

#### Variante B — Quadrante 24h *(novel, da valutare)*
Sostituisce il blocco fasce + timeline con un cerchio 24h dove ogni fascia è un arco e le maniglie entrata/uscita sono trascinabili. Stessa shell header/tipo/note/azioni. Più tattile su mobile ma più costoso da costruire.

**Validazione (vedi `SPEC.md` §4):**
- Ogni fascia: entrata e uscita compilate, uscita > entrata.
- Fasce non sovrapposte.
- Input `HH:MM` con inserimento `:` automatico e limiti 0–23 / 0–59.

---

### 4. Storico anno

**Due varianti proposte:**

#### Variante A — Heatmap anno
Griglia 12 righe × 31 colonne. Cella = giorno, colore = saldo giornaliero (gradiente rosso → neutro → verde). Weekend leggermente attenuati. Sopra, hero `BANCA ORE · TOTALE A OGGI`. Sotto, lista mesi con saldo mensile e indicatore mese corrente.

#### Variante B — Estratto conto / linea cumulativa *(consigliata)*
Hero molto grande con saldo banca ore corrente. Grafico **linea cumulativa** della banca ore mese per mese, con marker “oggi” e segmento futuro tratteggiato (proiezione). Sotto, **lista movimenti** in stile estratto conto bancario: una riga per mese con `delta mese` e `saldo cumulativo a fine mese`, prima riga “apertura” come saldo iniziale dell'anno.

Allinea questa schermata con il fatto che `users/{uid}/aggregazioni/{YYYY-MM}` è l'origine dati: il running total si costruisce sommando `saldoTotaleMin` per mese.

---

## Sistema di design da applicare in Tailwind

I wireframe sono volutamente low-fi. Quando porti in Next.js, applica un design system pulito e moderno. Suggerimenti coerenti con un'app di produttività privata:

**Tipografia**
- Sans system stack o `Inter` / `Geist Sans` per UI (Next.js include Geist di default).
- Tabular numerics per qualsiasi numero/ora: `font-variant-numeric: tabular-nums`.
- Scala: `text-xs` 12 / `text-sm` 14 / `text-base` 16 / `text-2xl` 24 / `text-5xl` 48 per hero numerico.

**Colori (Tailwind tokens consigliati)**
- Foreground primario: `zinc-900` (light) / `zinc-100` (dark).
- Background: `white` / `zinc-950`.
- Subtle border: `zinc-200` / `zinc-800`.
- Saldo positivo: `emerald-600` / `emerald-400`.
- Saldo negativo: `red-600` / `red-400`.
- Highlight (arrotondamento, oggi): `amber-500`.
- Badge tipi giornata (da `SPEC.md` §7): blu lavoro, verde ferie, arancio permesso, rosso malattia, grigio festivo — usa le palette Tailwind corrispondenti a saturazione bassa (es. `*-100` background + `*-700` text).

**Spacing & radius**
- Spacing scale Tailwind default.
- Radius: `rounded-lg` (8px) per card, `rounded-2xl` per il hero, `rounded-full` per chip/pill.

**Componenti consigliati (da costruire o usare se già nel codebase)**
- `<MonthPicker prev next onChange />` — chevron + label centrale grande.
- `<StatCard label value delta />` — usato dalla griglia 2×2 home.
- `<HeroBalance value previousMonthDelta />` — numerone centrato.
- `<DayRow />` — riga ledger riutilizzabile in home + mensile A.
- `<FasciaInput value onChange onRemove showRoundingHint />` — la modale dipende da questo.
- `<TimelinePreview fasce />` — barra 0–24.
- `<TipoGiornataPills value onChange />`.
- `<TimbraturaModal date initialData onSave />` — orchestra il tutto.
- `<HeatmapAnno year data />` o `<RunningBalanceChart data />` per lo storico.

---

## Interazioni & comportamento

- **Navigazione mese** ovunque: chevron `‹` `›` (prev/next mese) + tap su label → date picker `<input type="month">` o picker custom.
- **Tap su una riga/cella giorno** → apre `TimbraturaModal` per quella data.
- **FAB “+ timbra oggi”** → apre modale per la data odierna.
- **Validazione modale in tempo reale**: disabilita `salva` finché fasce valide.
- **Arrotondamento entrata**: mostra hint live `→ HH:MM` in arancione appena l'entrata è digitata e cambierebbe dopo arrotondamento (vedi formula in `SPEC.md` §5).
- **Salvataggio**: dopo `salva`, triggera `aggregazione mensile` come da `SPEC.md` §6, poi chiude la modale e rinfresca la vista.
- **Loading states**: skeleton per le card della home, righe shimmer per la lista mensile.
- **Empty state mese**: se nessuna timbratura nel mese, mostra messaggio + bottone “timbra primo giorno”.

---

## Routing & data (Next.js App Router)

- `/login` — login Google. Reindirizza a `/` se autenticato.
- `/` — Home (`AuthGuard` wrapper). Legge mese corrente.
- `/mese/[anno]/[mese]` — Vista mensile. `params: { anno: string; mese: string }`.
- `/anno/[anno]` — Storico (suggerito, non in spec originale ma necessario per la schermata 4).

Hooks suggeriti (client components):
- `useTimbrature(yyyyMM)` — sub a `users/{uid}/timbrature` filtrato per mese.
- `useAggregazione(yyyyMM)` — read `users/{uid}/aggregazioni/{yyyyMM}` con regola di refresh (vedi `SPEC.md` §6).
- `useSaldoTotale()` — somma di tutte le aggregazioni dell'utente.
- `useAuthUser()` — wrapping di Firebase Auth.

Tutta la logica di calcolo ore vive in `src/lib/calcolo-ore.ts` come da spec — la UI consuma solo i risultati.

---

## State management

Locale di pagina con `useState` + hook Firestore (`onSnapshot`). Niente Redux/Zustand richiesto al primo round.

Stato modale: `{ open, date, tipo, fasce: [{entrata, uscita}], note }`. Reset su close. Validazione derivata da `fasce`.

---

## Token di design (per implementazione hi-fi successiva)

I valori dei wireframe sono *non vincolanti*. Usare come base la palette Tailwind sopra. Per riferimento dei numeri visti sui wireframe:

| Token | Valore wireframe (low-fi) | Suggerito hi-fi |
|---|---|---|
| Hero saldo size | 72px | `text-6xl` ~ 60px |
| Stat card padding | 8–10px | `p-3` ~ 12px |
| Modale max-w mobile | ~324px | `max-w-md` |
| Touch target min | 30×30 | 44×44 |
| Border radius card | 10px | `rounded-xl` 12px |

---

## Asset

Nessun asset binario (immagini/icone) usato nei wireframe. Per l'implementazione, suggerisco:
- **Icons**: `lucide-react` (chevron-left/right, plus, pencil, trash, x, calendar).
- **Date utils**: `date-fns` con locale `it` per i nomi mese/giorno italiani.

---

## File inclusi
- `SPEC.md` — specifica funzionale completa (originale del progetto)
- `Timbratuu Wireframes.html` — entry point: apre il canvas con tutte le varianti
- `wireframes.jsx` — codice React dei wireframe (tutte e 8 le schermate)
- `design-canvas.jsx` — componente canvas pan/zoom che ospita gli artboard (non da portare in produzione, è solo per la presentazione)

### Come consultare i wireframe
Apri `Timbratuu Wireframes.html` in un browser. Vedrai un canvas con 4 sezioni (Home / Mese / Modale / Storico), 2 artboard per sezione. Clicca un artboard per fullscreen, `←` `→` per scorrere, `Esc` per chiudere. Pan = drag, zoom = scroll.

---

## Note per Claude Code
- Inizia da **Home** + **Modale** + **calcolo-ore.ts**: sono il cuore funzionale. Il resto si costruisce sopra.
- Rispetta la **separazione dati / calcolo / UI** descritta in `SPEC.md`. Non duplicare logica di arrotondamento o pausa nella UI.
- Italiano per tutta la UI (copy, label, errori).
- Mobile-first ma testa anche desktop: la stessa struttura scala bene con `md:` breakpoints (es. griglia stat 2×2 → 4×1, modale centrata con `max-w-lg`).
