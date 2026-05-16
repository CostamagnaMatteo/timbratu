# Autenticazione

## Provider

Firebase Authentication con **Google OAuth**. Nessuna registrazione manuale: l'utente accede esclusivamente tramite il proprio account Google.

## Flusso

1. L'utente apre l'app e viene reindirizzato alla pagina di login se non autenticato.
2. Clicca su "Accedi con Google" → popup OAuth Google.
3. Firebase restituisce l'utente autenticato con `uid`, `displayName`, `email`, `photoURL`.
4. Il `uid` viene usato come chiave primaria in Firestore (`users/{uid}/...`).
5. Il logout invalida la sessione Firebase e reindirizza al login.

## Protezione delle route

Middleware Next.js (`middleware.ts`) verifica la presenza del token Firebase sulla sessione:

- Route pubbliche: `/login`
- Route protette: tutto il resto (`/`, `/mese/[anno]/[mese]`, ecc.)

Se il token è assente o scaduto → redirect a `/login`.

## Isolamento dati

Le regole di sicurezza Firestore garantiscono che ogni utente possa leggere e scrivere **solo i propri documenti**:

```
match /users/{userId}/timbrature/{doc} {
  allow read, write: if request.auth.uid == userId;
}
```

## Sessione

Firebase gestisce il refresh automatico del token (scadenza 1h, refresh trasparente). Non è necessaria gestione manuale della sessione.
