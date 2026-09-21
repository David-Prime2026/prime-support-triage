# DR-010 Stage 3 GATE — runtime cutover to apx (rxhiyd = rollback)

**At:** 2026-09-21  
**STOP for PRIME before Stage 4 (doctrine retire rxhiyd / CONTROL_PLANE pin)**

## Cutover performed
| Surface | Change |
|---------|--------|
| Vercel `wmg-site` | `VITE_BRICELY_INTAKE_URL` + `VITE_BRICELY_THREAD_URL` → **apx** (production / preview / development) |
| WMG production redeploy | Ready — aliased `https://wmgos.primetimesystems.ai` |
| Console GitHub Pages | Rebuilt + pushed `gh-pages` with apx `VITE_SUPABASE_*` |
| `config/catch-net-posture.json` | `intake_url` / `thread_url` → apx; `rollback_project` = rxhiyd |

## Live bake verify
| Check | Result |
|-------|--------|
| WMG JS contains apx intake URL | **YES** |
| WMG JS contains rxhiyd URL | **NO** |
| Console JS (`index-xBbdL4As.js`) contains apx | **YES** |
| Console JS contains rxhiyd URL | **NO** |
| `intake-ticket` smoke on apx | **200** → ticket `a420b42e-…` (`is_mock=true`) |
| `bricely-thread` smoke on apx | **200** → thread `79ebeff1-…` |
| apx ticket count | **25** (24 baseline + Stage 3 smoke) |
| rxhiyd ticket count | **24** (unchanged — rollback intact) |
| qcefkox | **Not touched** |

## Explicitly NOT done (Stage 4+)
- Doctrine retire of rxhiyd / CONTROL_PLANE rewrite as sole authority
- PR #8 Bricely merge
- Console page_context / Automations bolt-on

## Rollback (if needed)
Repoint Vercel `VITE_BRICELY_*` + console `.env.production` to:
`https://rxhiydtqzmksaeegxyqo.supabase.co/functions/v1/…`  
and redeploy. Data on rxhiyd was not deleted.

## Ask PRIME
Reply **GO Stage 4** to retire rxhiyd from runtime doctrine / CONTROL_PLANE (branch may remain as archive).
