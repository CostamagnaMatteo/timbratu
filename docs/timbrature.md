# Gestione Timbrature

## Operazioni CRUD

### Creazione / Aggiornamento (upsert)

L'utente inserisce o modifica la timbratura di un giorno tramite un form modale. Poiché l'ID documento è la data, si usa sempre `setDoc` con `merge: true` — non distinguiamo tra creazione e aggiornamento.

```typescript
await setDoc(
  doc(db, `users/${uid}/timbrature/${data}`),
  { fasce, tipo, note },
  { merge: true }
);
```

### Eliminazione

L'utente può eliminare la timbratura di un giorno (il documento viene rimosso da Firestore).

```typescript
await deleteDoc(doc(db, `users/${uid}/timbrature/${data}`));
```

### Lettura mensile

Al caricamento della vista mensile vengono recuperate tutte le timbrature del mese selezionato con una singola query per intervallo su document ID.

## Form di inserimento

Il form modale si apre cliccando su qualsiasi giorno del mese (con o senza timbratura esistente).

### Campi

| Campo | Tipo input | Visibile quando |
|---|---|---|
| Tipo giornata | Select (radio) | Sempre |
| Fasce orarie | Lista dinamica di coppie entrata/uscita | tipo = "lavoro" |
| Note | Textarea | Sempre |

Ogni fascia è una riga con due time picker (`HH:MM`) affiancati e un'icona per rimuoverla. Un pulsante "+ Aggiungi fascia" aggiunge una nuova coppia vuota in fondo alla lista.

### Validazioni

- Almeno una fascia obbligatoria se tipo = "lavoro"
- Ogni fascia deve avere sia `entrata` che `uscita` (non si può salvare una fascia incompleta)
- `uscita` deve essere successiva a `entrata` nella stessa fascia
- Le fasce non devono sovrapporsi tra loro
- Formato orario `HH:MM` (00:00 – 23:59)

## Comportamento per tipo giornata

| Tipo | Ore nette calcolate | Saldo giorno |
|---|---|---|
| `lavoro` | Calcolato da entrata/uscita | `ore_nette - 7h 12min` |
| `ferie` | 7h 12min (giornata intera) | `0` |
| `permesso` | 7h 12min (giornata intera) | `0` |
| `malattia` | 7h 12min (giornata intera) | `0` |
| `festivo` | — | Non conteggiato nel saldo |

> I giorni non inseriti (assenti da Firestore) non vengono conteggiati nel saldo mensile.
