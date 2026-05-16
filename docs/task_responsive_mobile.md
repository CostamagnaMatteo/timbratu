# Task: Adattamento responsive per mobile

## Obiettivo

Rendere l'interfaccia di Timbratu fruibile su dispositivi mobili (min 320px) senza degradare l'esperienza desktop.

---

## Problemi attuali

### Critico

- **Tabella a 9 colonne**: scorre orizzontalmente su mobile grazie a `overflow-x-auto`, ma non è un'esperienza d'uso accettabile
- **Header**: logo + navigazione mese + saldo + utente su una singola riga — si comprime sotto i ~400px (solo il nome utente è nascosto con `hidden sm:block`)

### Significativo

- **Modale**: gli input orario affiancati (`InputOra → InputOra + durata`) rischiano di stringersi troppo su schermi da 320px
- **Pulsanti azione** in tabella (`+` ✏️ 🗑️): piccoli e ravvicinati, difficili da toccare con il dito

### Già adeguato

- Pagina login: layout a colonna verticale con `max-w-sm`, funziona su mobile
- Modale: struttura verticale con `max-w-md mx-4`, adattabile con piccoli aggiustamenti

---

## Approccio proposto

### Tabella → Card list su mobile

Sotto `md` (768px), sostituire la tabella con una lista di card, una per giorno.

Ogni card mostra:
- **Riga superiore**: nome giorno + numero | badge tipo | pulsanti azione
- **Riga inferiore** (solo se tipo `lavoro`): prima entrata → ultima uscita | fasce | saldo

Sopra `md` la tabella completa rimane invariata.

Implementazione: usare classi Tailwind `hidden md:table` / `md:hidden` per mostrare tabella o card list in base al breakpoint.

### Header

Su mobile riorganizzare su due righe:
- **Riga 1**: logo | navigazione mese (← Nome mese →) | pulsante utente/esci
- **Riga 2** (sotto, centrata): saldo mensile

### Modale

- Impilare verticalmente i campi di ogni fascia (`InputOra` entrata, freccia, `InputOra` uscita, durata) su schermi < 400px
- Aumentare il padding dei pulsanti azione a `min-h-[44px]` per rispettare le linee guida touch (Apple HIG / Material)

### Pulsanti azione

Aumentare l'area di tocco dei pulsanti + ✏️ 🗑️ nella card mobile a minimo 44×44px.

---

## File da modificare

| File | Modifica |
|------|----------|
| `src/components/TabellaMessile.tsx` | Aggiungere card list per mobile, tabella visibile solo da `md` |
| `src/components/Header.tsx` | Layout a due righe su mobile |
| `src/components/ModaleTimbratura.tsx` | Stack verticale fasce su schermi piccoli, area tocco pulsanti |

---

## Breakpoint di riferimento

| Breakpoint | Tailwind | Comportamento |
|-----------|----------|---------------|
| < 768px   | (default) | Card list, header a due righe |
| ≥ 768px   | `md:`     | Tabella completa, header a una riga |
