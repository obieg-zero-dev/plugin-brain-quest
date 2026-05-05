# plugin-brain-quest

Plugin ekosystemu **obieg-zero**. Repo jest jedynym źródłem kodu (source + bundle + meta razem).

## Struktura

```
src/index.tsx     — source TypeScript
index.mjs         — built bundle (do CDN, generowany z src/)
package.json      — metadata + wersja semver + Creem price
```

## Workflow rozwoju

Plugin nie żyje w izolacji — to część monorepo `obieg-zero`. Pełen rozwój wymaga klonowania całego ekosystemu:

```bash
git clone https://github.com/obieg-zero-dev/core-host
git clone https://github.com/obieg-zero-dev/packages
git clone https://github.com/obieg-zero-dev/plugin-brain-quest    # to repo
# (oraz pozostałe pluginy które chcesz mieć w lokalnym dev)
```

Po klonie zainstaluj guard pre-push (blokuje przypadkowe `git push`):

```bash
bash core-host/scripts/install-guards.sh
```

Edycja:

```bash
cd plugin-brain-quest
# edytuj src/index.tsx
cd ../plugins && npm run build              # rebuild index.mjs
cd ../plugin-brain-quest && git add -A && git commit -m "..."
```

## Promocja LOCAL → DEV → PROD

Bezpośredni `git push` jest **zablokowany** lokalnie przez `pre-push` hook. Promocja przez skrypty:

```bash
bash core-host/scripts/promote-to-dev.sh  plugin-brain-quest             # LOCAL -> DEV
bash core-host/scripts/promote-to-prod.sh plugin-brain-quest v1.2.3      # DEV   -> PROD + tag
```

Skrypty walidują: working tree clean, build świeży (`index.mjs` nie starszy od `src/`).

## Branchy

- `main` — prod (deploy CDN, użytkownicy końcowi)
- `dev` — staging (tymczasowy snapshot do walidacji)
- tagi `vMAJOR.MINOR.PATCH` na main

## Reguły dla LLM

LLM (Claude Code, Cursor, etc.) ma **zakaz pchania** kodu na `obieg-zero-dev`. LLM:

1. Edytuje `src/`
2. Buduje (`npm run build` w `plugins/`)
3. Commituje LOKALNIE (`git commit` lub MCP `plugin_commit_local`)
4. STOP — raport do właściciela.

Promocję `dev`/`prod` wykonuje wyłącznie właściciel ręcznie przez `promote-*.sh`.

Pełna specyfikacja: `core-host/CLAUDE.md`.
