# DR-010 Stage 4 GATE — doctrine pin (rxhiyd retired from runtime)

**At:** 2026-09-21  
**STOP for PRIME before Stage 5 (Bricely PR #8 + soft offramp)**

## Doctrine pin
| Ref | Role |
|-----|------|
| `qcefkoxqkfwnlqfmwzmi` | WMG OS prod — never autonomous |
| `apxbwdxszmdffbduhjen` | **Sole** triage runtime authority |
| `rxhiydtqzmksaeegxyqo` | **Archive only** — not a live env target |

## Files updated
- `CONTROL_PLANE.md` (root) — Stage 4 GATE + canonical hosts
- `config/CONTROL_PLANE.md` — same pin
- `config/catch-net-posture.json` — `authoritative_project=apx`; `archive_project=rxhiyd`
- `config/autonomy-killswitch.json` — `staging_branch_archive_not_runtime`
- `proofs/DR-CS-PLATFORM-CURRENT-STATE.md` — host drift resolved
- `proofs/DR-CS-PLATFORM-010/METHOD.md` — status Stages 0–4

## Explicitly NOT done
- No deletion of rxhiyd branch / data (cold archive OK)
- No env retarget back to rxhiyd
- No PR #8 merge (Stage 5)
- No Automations enable (Stage 6)
- No qcefkox touch

## Runtime re-check (same session)
WMG + console JS still apx-only; apx tickets 25; rx archive still has 24.

## Ask PRIME
Reply **GO Stage 5** to proceed with Bricely PR #8 + soft continue/ticket offramp (+ optional Claude assist behind fence).
