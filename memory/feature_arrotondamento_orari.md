---
name: feature-arrotondamento-orari
description: Logica di arrotondamento applicata alle timbrature al momento del calcolo
metadata:
  type: project
---

L'entrata viene arrotondata al quarto d'ora intero successivo (ceiling a 15 min) al momento del calcolo. L'uscita è sempre quella timbrata, senza arrotondamento.

**Why:** Il DB salva sempre i valori reali (nessun arrotondamento in scrittura). L'arrotondamento avviene solo in `calcolo-ore.ts` → `diffMinuti` per ingresso, e nella `durataFascia` della modale per mostrare la durata corretta in anteprima.

**How to apply:** Non aggiungere arrotondamento in fase di salvataggio su Firestore. Qualsiasi modifica alla logica di calcolo ore va fatta in `src/lib/calcolo-ore.ts`. La modale mostra un hint arancione sotto il campo entrata quando l'orario verrà arrotondato.
