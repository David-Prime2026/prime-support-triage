# DR-013 Stage 3 GATE — Expand Bricely live-fix allowlist (additive)

**At:** 2026-09-21  
**STOP for PRIME bake** before optional Stage 4 (poll/watch helper doc).

## What landed (wmg-canonical · `feat/bricely-dr011-prediagnosis`)

Additive Tier-A live fixes mapped to ratified SF1–SF5 (no money / send / prod writes):

| Kind | SF | Behavior |
|------|----|----------|
| `display_name` | SF1 | Session greeting override (unchanged) |
| `navigate_home` | SF2 | Host → Home / Command Center |
| `clear_board_prefs` | SF3 | Clear client-only `wmg.board.*` / `wmg.filter.*` / portal board-filter keys |
| `refresh_view` | SF5 | Host soft refresh (portal data / reminders) |

## Surfaces wired
- `src/bricely/liveFixes.ts` — kinds + default dispatcher  
- `src/bricely/diagnostic.ts` — intent → `live_fix` terminals  
- `BricelyChat` → `applyDefaultLiveFix` when host omits handler  
- Seller / Buyer portals + internal `App.tsx` `onLiveFix` handlers  

## Guardrails held
- Augment only — no Bricely rewrite  
- No new money/ERP/send action codes  
- Never auto `qcefkox…`  
- Hard fixes still Approve → outbox → Cursor staging  

## Stages remaining after this GATE
**1 optional** — Stage 4 (poll/watch helper doc for Cursor agents). DR-013 closes after Stage 3 bake if Stage 4 is deferred.
