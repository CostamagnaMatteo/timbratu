# Setup ambiente di sviluppo locale

Questa guida descrive come avviare Timbratu in locale usando gli emulatori Firebase, senza toccare i dati di produzione.

## Prerequisiti

- **Node.js** ≥ 18
- **Firebase CLI** installata globalmente: `npm install -g firebase-tools`
- **Java** ≥ 11 — richiesto dagli emulatori Firebase (verifica con `java -version`)
- Aver effettuato il login con Firebase CLI: `firebase login`

## Come funziona

In locale vengono avviati due emulatori Firebase che sostituiscono completamente i servizi cloud:

| Servizio | Emulatore | Porta |
|---|---|---|
| Authentication | Firebase Auth Emulator | `9099` |
| Database | Firestore Emulator | `8080` |
| UI dashboard | Emulator Suite UI | `4000` |

L'applicazione Next.js gira separatamente sulla porta **3000**.

La variabile d'ambiente `NEXT_PUBLIC_USE_EMULATORS=true` in `.env.local` istruisce il client Firebase a connettersi agli emulatori locali invece che al progetto cloud. I dati scritti durante lo sviluppo esistono solo in memoria e vengono azzerati ad ogni riavvio degli emulatori.

## Avvio

```bash
npm run dev:local
```

Il comando avvia in parallelo:
1. Gli emulatori Firebase (Auth + Firestore)
2. Il server di sviluppo Next.js

Se uno dei due processi termina con errore, anche l'altro viene fermato automaticamente (`--kill-others`).

## URL utili in locale

| Risorsa | URL |
|---|---|
| Applicazione | http://localhost:3000 |
| Emulator Suite UI | http://localhost:4000 |
| Auth Emulator (API) | http://localhost:9099 |
| Firestore Emulator (API) | http://localhost:8080 |

La **Emulator Suite UI** (porta 4000) permette di ispezionare e modificare i dati Firestore e gli utenti Auth direttamente dal browser, senza codice.

## Autenticazione con Google in locale

L'emulatore Auth supporta il flusso Google Sign-In tramite un fake account picker. Al click su "Accedi con Google" comparirà una schermata fittizia che permette di selezionare o creare un account di test — nessuna credenziale reale viene usata.

## Puntare alla produzione

Per testare con i dati reali senza avviare gli emulatori:

1. Imposta `NEXT_PUBLIC_USE_EMULATORS=false` in `.env.local`
2. Avvia normalmente con `npm run dev`

> **Attenzione:** con `USE_EMULATORS=false` e `npm run dev` ogni scrittura va sul database di produzione.

## Struttura dei file modificati

```
├── firebase.json              # Aggiunta sezione "emulators" con porte e UI
├── .env.local                 # Aggiunta NEXT_PUBLIC_USE_EMULATORS=true
├── .env.local.example         # Aggiornato con la nuova variabile
├── package.json               # Aggiunto script "dev:local" con concurrently
└── src/lib/firebase.ts        # Connessione agli emulatori se USE_EMULATORS=true
```

## Dettaglio tecnico: `src/lib/firebase.ts`

La connessione agli emulatori avviene solo lato client (`typeof window !== "undefined"`) per evitare errori durante il rendering server-side di Next.js, e solo se `NEXT_PUBLIC_USE_EMULATORS === "true"`:

```ts
if (process.env.NEXT_PUBLIC_USE_EMULATORS === "true" && typeof window !== "undefined") {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
}
```

I dati del progetto Firebase (API key, project ID ecc.) rimangono invariati — gli emulatori li ignorano e usano un ambiente sandbox isolato.
