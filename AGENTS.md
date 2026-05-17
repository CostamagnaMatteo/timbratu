# Tecnologie presenti nel repository

## Framework / Runtime
- **Next.js 16.2.6** — con `output: "export"` (static site generation, nessun server Node)
- **React 19.2.4** — incluso React DOM

## Linguaggio / Tipizzazione
- **TypeScript 5** — configurazione in `tsconfig.json`

## Backend / Database
- **Firebase 12.13.0** — client SDK (Authentication + Firestore)
- **Firebase Admin 13.10.0** — SDK server-side
- **Cloud Firestore** — database NoSQL, con regole di sicurezza in `firestore.rules`
- **Firebase Hosting** — deploy della build statica dalla cartella `out/`

## Styling
- **Tailwind CSS 4** — tramite plugin PostCSS (`@tailwindcss/postcss`)
- **PostCSS** — preprocessore CSS

## Linting
- **ESLint 9** — con config `eslint-config-next` (core-web-vitals + typescript)

## Tooling / Build
- **npm** — package manager (`package-lock.json`)
- **Firebase CLI** — per deploy e gestione regole Firestore (`firebase.json`)
