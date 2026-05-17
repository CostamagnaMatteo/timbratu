# Task: Pianificazione Orari

## Obiettivo

Permettere all'utente di inserire timbrature per giorni futuri come **pianificate**: queste non influenzano il saldo reale, ma mostrano una proiezione di come potrebbe evolvere il saldo. Le timbrature pianificate possono essere convertite in effettive tramite un pulsante nel form di modifica.

---

## Comportamento

### Inserimento automatico come "pianificato"

Quando l'utente inserisce una timbratura per un giorno **futuro** (data > oggi), il documento viene salvato con il flag `pianificato: true`. Non è necessario che l'utente scelga esplicitamente il tipo — il sistema lo determina automaticamente dal confronto della data con oggi.

### Saldo reale vs proiezione

- Il **saldo reale** (mostrato in header e nella colonna saldo) considera solo le timbrature con `pianificato: false` (o campo assente).
- La **proiezione** è un secondo valore calcolato includendo anche le timbrature pianificate. Viene mostrata in una riga/sezione distinta, con etichetta e stile visivo differenziati (es. colore tenue, prefisso "Proiezione:").

### Conversione a effettiva

Nel form di modifica di una timbratura pianificata, compare un pulsante **"Conferma come effettiva"**. Al click, il flag `pianificato` viene impostato a `false` e la timbratura inizia a contribuire al saldo reale. Non è necessario modificare le fasce orarie per convertirla.

---

## Modello dati

Aggiunta di un campo opzionale all'interfaccia `Timbratura`:

```ts
interface Timbratura {
  tipo:        "lavoro" | "ferie" | "permesso" | "malattia" | "festivo";
  fasce?:      { entrata: string; uscita: string }[];
  note?:       string;
  pianificato?: boolean;  // true = orario pianificato, non conta nel saldo reale
}
```

Il campo è opzionale per retrocompatibilità: le timbrature esistenti prive del campo si comportano come `pianificato: false`.

---

## Modifiche ai file

### `src/types/timbratura.ts`
- Aggiungere `pianificato?: boolean` all'interfaccia `Timbratura`.

### `src/lib/firestore.ts`
- In `setTimbratura`: se la data è futura, impostare automaticamente `pianificato: true` (a meno che non venga esplicitamente passato `false`).

### `src/lib/calcolo-ore.ts`
- `calcolaMese` accetta un parametro opzionale `includiPianificati: boolean` (default `false`).
- Quando `false`, esclude le timbrature con `pianificato: true` dal calcolo del saldo.
- Quando `true`, le include — usato per calcolare la proiezione.

### `src/lib/date-utils.ts`
- Verificare che `isFuturo` esista già; se no, aggiungerla (confronto data > oggi senza ora).

### `src/components/TabellaMessile.tsx`
- Distinguere visivamente le righe pianificate: sfondo o testo tenue, badge "Pianificato".
- Mostrare nella sezione del saldo mensile sia il **saldo reale** che la **proiezione** (solo se esistono timbrature pianificate nel mese).

### `src/components/ModaleTimbratura.tsx`
- Quando la timbratura caricata ha `pianificato: true`, mostrare un pulsante **"Conferma come effettiva"** separato dai pulsanti Salva/Elimina.
- Al click, aggiornare Firestore con `pianificato: false` e chiudere il modale.
- Non mostrare il pulsante se `pianificato` è `false` o assente.

### `src/components/Header.tsx`
- Se nel mese ci sono timbrature pianificate, mostrare sotto al saldo reale la proiezione in stile secondario.

---

## UX

- Le righe pianificate nella tabella hanno uno stile visivo differenziato (opacità ridotta o bordo tratteggiato) per essere chiaramente distinguibili da quelle effettive.
- Il badge tipo giornata (es. "Lavoro") mostra un suffisso o variante visiva che indica lo stato pianificato.
- La proiezione del saldo è sempre accompagnata da un'etichetta esplicita per evitare confusione con il saldo reale.
- Il pulsante "Conferma come effettiva" è visivamente distinto (es. colore verde/primario) rispetto al pulsante Salva.

---

## Regole di business

- Un giorno futuro aperto con il pulsante `+` produce sempre una timbratura pianificata.
- Se l'utente modifica una timbratura pianificata e salva senza confermarla, rimane pianificata.
- Una timbratura effettiva non può essere retrocessa a pianificata dall'utente.
- Giorni passati: il flag `pianificato` viene ignorato in scrittura — non è possibile creare timbrature pianificate per il passato.

---

## Fuori scope

- Notifiche o reminder basati sulle pianificazioni.
- Sincronizzazione con calendari esterni.
- Approvazione da parte di un supervisore.
