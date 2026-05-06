# Test packs — mechanizm rozszerzeń

Demonstracja merge'a paczek w `plugin-brain-quest` (po porcie z KNOWLEDGE-NEST).

## Paczki

| Folder | `id` | `extends` | Co dodaje |
|--------|------|-----------|-----------|
| `polski-matura-mini-base/` | `polski-matura-mini` | — (baza) | 4 gałęzie + 17 węzłów (epoki, lektury, poetyka), 17 edges |
| `polski-matura-mini-mit/` | `polski-matura-mini-mit` | `polski-matura-mini` | 3 węzły (`prometeusz`, `ikar`, `mit-trojanski`) z `kontekstTyp: mitologiczny` + 8 edges typu `kontekst`/`branch` |
| `polski-matura-mini-bibl/` | `polski-matura-mini-bibl` | `polski-matura-mini` | 3 węzły (`vanitas`, `hiob`, `raj-utracony`) z `kontekstTyp: biblijny` + 7 edges |

## Jak to działa

`importTreeSeed` w `src/index.tsx`:
- Bez `extends` → `store.add('tree', ...)`, nowe drzewo
- Z `extends` → szuka istniejącego drzewa po `data.extId` (fallback: tytuł), dokleja nowe `node`/`edge`/`branch`/`relType` z deduplikacją po kluczu
- Każdy `node` dostaje `data.repo` — dla lazy `loadNodeContent` (rozszerzenie ciągnie content z własnego repo)

## Test lokalny

Te paczki są tu jako szablony — żeby przetestować w kliencie BQ trzeba je wypchnąć na osobne repa w org `BQ-content` z topikiem `brainquest`. Wtedy w UI:

1. RepoPicker → klik „Rozpocznij" na `polski-matura-mini-base` → bazowe drzewo (17 węzłów)
2. RepoPicker → klik „Rozpocznij" na `polski-matura-mini-mit` → merge: drzewo dorasta do 20 węzłów + 8 nowych krawędzi (Prometeusz wskazuje na Konrada w Dziadach III itd.)
3. To samo z `polski-matura-mini-bibl` → drzewo do 23 węzłów

Discovery termu „prometeizm" w lekturze Dziady III flashuje krawędź do węzła kontekstowego `prometeusz` (mechanizm `bqFlash` z `plugin-brain-quest-reader/src/index.tsx:200`).

## Brak: lexicon + content

Te paczki to TYLKO struktura grafu. Żeby pełna pętla reader/arena działała, trzeba dodać:
- `lexicon/<nodeId>.json` per węzeł kontekstowy (terminy z definicjami i polem `nodes` wskazującym na lektury, gdzie się stosują)
- `content/<nodeId>.json` per węzeł (slajdy + quizy)

To osobny krok, do uzgodnienia z autorem treści.
