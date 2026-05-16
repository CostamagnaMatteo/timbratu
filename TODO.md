# Timbratu — punti mancanti

## Funzionale

### 1. Saldo ferie/permesso/malattia
`calcolaMese` in `src/lib/calcolo-ore.ts` ignora i giorni non-lavoro.
In un contratto pubblico, ferie/permesso/malattia devono contare come giornata intera (432 min) ai fini del saldo.
**Fix**: nel loop di `calcolaMese`, aggiungere `432` al saldo per ogni giorno con tipo `ferie | permesso | malattia`.

### 2. Festivi nazionali automatici
Il tipo `festivo` esiste ma si inserisce a mano.
Serve un elenco dei giorni festivi italiani (fissi + Pasqua) che pre-marca le celle nella `TabellaMessile` senza richiedere input utente.
**Fix**: aggiungere `src/lib/festivi.ts` con la lista dei festivi fissi e il calcolo della Pasqua; usarla in `TabellaMessile` per mostrare il badge `festivo` se il giorno non ha una timbratura esplicita.

### 3. Saldo cumulativo (storico)
L'header mostra solo il saldo del mese visualizzato.
Serve il saldo accumulato da un mese di inizio anno (o configurabile) fino al mese corrente.
**Fix**: query Firestore multi-mese + somma dei saldi; mostrare in header come "Saldo anno" accanto al saldo mensile.

---

## UX

### 4. Note visibili in tabella
Il campo `note` è salvato su Firestore e gestito nel modale, ma `TabellaMessile` non lo mostra.
**Fix**: aggiungere una colonna (o tooltip/icona) in `src/components/TabellaMessile.tsx` che mostri la nota quando presente.

### 5. Pulsante "mese corrente"
L'header ha ← → ma navigando lontano non c'è modo rapido di tornare.
**Fix**: aggiungere in `src/components/Header.tsx` un link/bottone "Oggi" che punta a `/mese/{anno}/{mese}` corrente.

### 6. Weekend non editabili
Sabato e domenica hanno stile grigio ma il click apre comunque il modale.
**Fix**: in `TabellaMessile.tsx` e `MesePageClient.tsx`, bloccare `onEdit` se `isWeekend(data)` è `true` (o chiedere conferma esplicita).
