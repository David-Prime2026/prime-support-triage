# WMG OS display fence (RATIFIED) — Lane 1
**Status:** Ratified by PRIME · DR-CS-PLATFORM-007R · **ENABLED = true** (governors on `apxbwdxszmdffbduhjen`)  
**Companion:** `wmgos-display-fence.json`  
**Deploy rule:** Agent prepares PRs only. **Never** autonomous deploy to WMG OS prod `qcefkoxqkfwnlqfmwzmi`. PRIME deploys.

## Canonical refs
| Ref | Role |
|-----|------|
| `qcefkoxqkfwnlqfmwzmi` | WMG OS PRODUCTION — never autonomously touched/deployed |
| `apxbwdxszmdffbduhjen` | Authoritative prime-support-triage — governors live here |
| `rxhiydtqzmksaeegxyqo` | Rogue mobile — not used |

## Principle
LOOK only. Never DO or SHOW. **Unsure in WMG OS = escalate always.**

## IN (W1–W4)
| ID | Category |
|----|----------|
| W1 | Static copy typos |
| W2 | Help / aria text |
| W3 | **Purely aesthetic CSS** (see confirmation below) |
| W4 | Comments |

## OUT (hard)
Status keys/columns · live data formatting · nav+permissions · show/hide · money/auth/schema · Bricely behavior · unsure

## W3 confirmation (007R mandatory)
**Prior proposal was looser** (allowed padding/gap/py that can reflow controls).  
**Tightened before enable to PRIME wording:**

- **Allowed:** color, font-family, font-size, weight; spacing/margin/padding **only if it does NOT reflow or move controls**
- **Forbidden even under CSS:** position; hide/reveal; resize; reorder; overlap; clickability changes; any change to what data/controls the user can see or reach

## Execution
Committed PR · trivially revertible · one-at-a-time · observed · real-time CONTROL_PLANE log · kill-switch-able. PRIME watches first fire.
