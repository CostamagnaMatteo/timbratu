# Timbratu — Gestione Timbrature Dipendente Pubblico

## Scopo

Applicazione web per la gestione manuale delle timbrature di dipendenti pubblici. Ogni utente inserisce i propri orari di entrata e uscita giornalieri; il sistema calcola automaticamente le ore lavorate, applica l'eventuale deduzione per pausa pranzo e restituisce il saldo ore del mese corrente.

---

## Tecnologie

| Layer | Tecnologia |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| Autenticazione | Firebase Authentication — Google OAuth |
| Database | Firebase Firestore |
| Hosting | Firebase Hosting |
| Styling | TailwindCSS |

---

## Architettura dati (Firestore)

```
users/{userId}/timbrature/{YYYY-MM-DD}
  - entrata : string        // "08:30"
  - uscita  : string        // "17:00"
  - tipo    : TipoGiornata  // "lavoro" | "ferie" | "permesso" | "malattia" | "festivo"
  - note?   : string
```

L'ID documento coincide con la data in formato `YYYY-MM-DD`, garantendo unicità naturale per giorno per utente.

---

## Regole di business

| Parametro | Valore |
|---|---|
| Orario contrattuale giornaliero | **7h 12min** (fisso) |
| Deduzione pausa pranzo | **-30min** se ore consecutive > 8h |
| Saldo mensile | Calcolato mese per mese, senza riporto al mese successivo |

---

## Funzionalità principali

| # | Funzionalità | Dettaglio |
|---|---|---|
| 1 | Autenticazione | [auth.md](./auth.md) |
| 2 | Modello dati | [data-model.md](./data-model.md) |
| 3 | Gestione timbrature | [timbrature.md](./timbrature.md) |
| 4 | Calcolo ore | [calcolo-ore.md](./calcolo-ore.md) |
| 5 | Interfaccia utente | [ui-ux.md](./ui-ux.md) |

---

## Funzionalità escluse (fuori scope attuale)

- Pannello amministratore
- Esportazione report (PDF/Excel)
- Riporto saldo ore tra mesi (consolidamento — sviluppo futuro)
- Regole specifiche da contratto collettivo (CCNL)
- Configurazione orario contrattuale per utente
