# DR-CS-PLATFORM-007R — Risk definition confirmations + enable

**Date:** 2026-09-21  
**Authority:** PRIME ratification of DR-007 proposals

## Canonical refs (pinned)
| Ref | Role |
|-----|------|
| `qcefkoxqkfwnlqfmwzmi` | WMG OS PRODUCTION — **never** autonomously touched/deployed |
| `apxbwdxszmdffbduhjen` | Authoritative prime-support-triage — governors live here |
| `rxhiydtqzmksaeegxyqo` | Rogue mobile — **not used** |

---

## 1. W3 "non-behavioral CSS" — CONFIRMED + TIGHTENED

**Proposal was looser than PRIME's bar.** It allowed padding/gap/`py-` increases that can reflow or move controls.

**Tightened before enable to exact PRIME wording:**
- Allowed: color, font-family, font-size, weight; spacing/margin/padding **only if it does NOT reflow or move controls**
- Explicitly forbidden even under CSS: position; hide/reveal; resize; reorder; overlap; clickability; anything that alters what data/controls the user can see or reach

Evidence: `config/wmgos-display-fence.json` → `in_fence` W3 + `w3_confirmation` + `explicitly_forbidden_even_under_css` (8 items).

## 2. SF8 "internal AI draft (not send)" — CONFIRMED + TIGHTENED

**Draft function:** `ai-draft-customer-email` has **no** SendGrid/send (grep: no matches).

**Proposal risk:** wording said “leave draft in EmailDrawer” — that UI also has **Send Email** (`send-customer-email`).

**Tightened before enable:**
- SF8 = compose/prepare via draft API only; return text for human review
- `send_path: "none"`
- Forbidden invokes: `send-customer-email`, all `notify-*`, EmailDrawer Send, any delivery route
- Buyer/seller: SF8 off

Evidence: `config/wmgos-safe-feature-allowlist.json` → SF8 + `sf8_confirmation`.

---

## Enable
- Promoted: `wmgos-display-fence.json` · `wmgos-safe-feature-allowlist.json` (live)
- Kill switch: `wmgos_lane1_display_enabled: true`, `wmgos_lane2_safe_features_enabled: true`, `halt: false`
- Guardrails: DR-006 proven set still apply (kill / revert / live log / serial / fence blocks)
- Unsure in WMG OS → escalate always
- **First live fire:** EXECUTED under PRIME watch; STOP cleared 2026-09-21T13:02:01Z (PRIME: clean move forward)

## First-fire STOP — CLOSED
Kill switch still reachable: set `config/autonomy-killswitch.json` → `"halt": true`

**Inaugural fires (done):**
1. **Lane 1 W1:** Create Load helper copy — PR https://github.com/David-Prime2026/Wmsosv2/pull/7 **MERGED** (`043d043`)
2. **Lane 2 SF4:** New conversation reset — observed live on internal Support

**Steady state:** lanes ON; further fires only from real fenced queue, serial, unsure→escalate. No theatrical next fire.
