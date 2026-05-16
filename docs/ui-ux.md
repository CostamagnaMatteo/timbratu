# Interfaccia Utente

## Struttura pagine

```
/login                      → Pagina di accesso (Google OAuth)
/                           → Redirect a /mese/[anno]/[mese] corrente
/mese/[anno]/[mese]         → Vista mensile principale
```

## Pagina Login (`/login`)

- Sfondo neutro con logo/titolo app
- Unico CTA: pulsante "Accedi con Google"
- Redirect automatico alla vista mensile se già autenticato

## Vista mensile (`/mese/[anno]/[mese]`)

### Header
- Nome utente + avatar Google
- Mese e anno corrente (es. "Maggio 2026")
- Frecce di navigazione ← → per mese precedente/successivo
- **Saldo mensile** in evidenza (verde se positivo, rosso se negativo)
- Pulsante logout

### Tabella timbrature

Ogni riga rappresenta un giorno del mese:

| Colonna | Contenuto |
|---|---|
| Giorno | Data + nome giorno (es. "Ven 16") |
| Tipo | Badge colorato (Lavoro / Ferie / Permesso / Malattia / Festivo) |
| Entrata | Orario o `—` |
| Uscita | Orario o `—` |
| Ore nette | Ore lavorate nette (es. "8h 00min") |
| Pausa | Icona ✓ se deduzione applicata |
| Saldo | `+48min` in verde / `-12min` in rosso / `—` |
| Azioni | Icona matita (modifica) + icona cestino (elimina) |

Giorni weekend evidenziati con sfondo diverso. Giorni futuri non editabili.

### Form modale inserimento/modifica

Si apre cliccando su un giorno o sull'icona matita.

- Select tipo giornata (radio button visivi)
- Campo entrata e uscita (visibili solo se tipo = "lavoro")
- Anteprima calcolo in tempo reale (ore nette + saldo)
- Textarea note (opzionale)
- CTA: "Salva" / "Annulla"
- CTA aggiuntivo: "Elimina timbratura" (solo se il giorno ha già dati)

### Feedback visivo

- Toast di conferma dopo salvataggio/eliminazione
- Indicatore di caricamento durante le operazioni Firestore
- Messaggio di errore inline in caso di validazione fallita

## Palette colori badge tipo giornata

| Tipo | Colore |
|---|---|
| Lavoro | Blu |
| Ferie | Verde |
| Permesso | Arancione |
| Malattia | Rosso |
| Festivo | Grigio |

## Responsività

L'app è progettata principalmente per **desktop**. Su mobile la tabella diventa scrollabile orizzontalmente; il form modale occupa tutto lo schermo.
