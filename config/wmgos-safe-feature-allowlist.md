# WMG OS safe-feature allowlist (RATIFIED) — Lane 2
**Status:** Ratified by PRIME · DR-CS-PLATFORM-007R · **ENABLED = true** (governors on `apxbwdxszmdffbduhjen`)  
**Companion:** `wmgos-safe-feature-allowlist.json`  
**Nature:** Invoke **existing** features only — no new action code.

## Canonical refs
| Ref | Role |
|-----|------|
| `qcefkoxqkfwnlqfmwzmi` | WMG OS PRODUCTION — never autonomously deployed |
| `apxbwdxszmdffbduhjen` | Authoritative support-triage |
| `rxhiydtqzmksaeegxyqo` | Rogue — unused |

## IN (SF1–SF8)
SF1 greeting session · SF2 navigate · SF3 clear board prefs · SF4 new chat · SF5 read-only refresh · SF6 clipboard · SF7 help guide · **SF8 internal AI draft (NOT send)**

## NEVER
`send-customer-email` · `notify-*` · allocate/update load · portal submits · invites/access · pricing/AR · new action code

## SF8 confirmation (007R mandatory)
**Draft function `ai-draft-customer-email`:** no SendGrid/send (verified).  
**Prior wording risk:** “leave draft in EmailDrawer” — that UI also has **Send Email**.  
**Tightened before enable:** SF8 may **compose/prepare only** via draft API; return text for human review.  
**Zero send path:** never call `send-customer-email` / `notify-*` / EmailDrawer Send / any delivery route. `send_path: none`.

## Unsure → escalate always
