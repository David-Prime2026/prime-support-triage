# WMG OS safe-feature allowlist (PROPOSED) — Lane 2
**Status:** Proposed — awaiting PRIME ratification · **ENABLED = false**  
**Authority:** DR-CS-PLATFORM-007  
**Companion:** `wmgos-safe-feature-allowlist.proposed.json`  
**Nature:** Bricely **triggers existing features** — does **not** write new autonomous action code.

---

## Principle

Autonomy may trigger **reversible + internal** existing WMG OS features.  
**Irreversible / customer-facing / external outbound → human-gated permanently** (even if the feature exists).

Lane 2 ≠ Lane 1. No new code paths to “just do the thing.”

**Unsure in WMG OS = escalate. Always.**

---

## Proposed allowlist (EXISTING features only)

| ID | Feature | Reversibility | Notes |
|----|---------|---------------|-------|
| **SF1** | Portal welcome greeting session override | Clear sessionStorage / end session | Already wired via `liveFixes` + portal `onLiveFix`; does **not** write CRM contact |
| **SF2** | Client navigation to an allowed screen | User navigates back | Must honor `canAccessView` / accounting gates |
| **SF3** | Clear local board view prefs / filters | Re-select view; rewrite localStorage | Matches soft tip “clear filter” |
| **SF4** | Bricely New chat / thread reset | History queued; no ERP write | Existing `startNewChat` |
| **SF5** | Read-only board refetch | Client cache only | Existing refresh / `fetchBoardLoadRows` — **no** write RPCs |
| **SF6** | Clipboard copy of on-screen reference | Clipboard only | REL# / memo # already visible |
| **SF7** | Open in-portal help guide panel | Collapse | `guideOpen` on welcome cards |
| **SF8** | AI **draft** email for **internal operator** review | Discard draft | `ai-draft-customer-email` only — **never** `send-customer-email`. Buyer/seller surfaces: off |

All rows ship with `allowed_after_ratification: false` until PRIME ratifies + separate enable.

---

## Never autonomous (explicit exclusions)

| ID | Exclusion | Examples |
|----|-----------|----------|
| **NX1** | Outbound email / notify | `send-customer-email`, `notify-sales-memo`, `notify-ar-overdue`, … |
| **NX2** | Load lifecycle writes | `allocate-load`, `deallocate-buyer`, `reassign-buyer`, `split-load`, `update-load`, `set-load-memo-rate`, `create-load-order`, cancel unsold |
| **NX3** | Portal submits / commitments | load request, load issue, payment notice, accept load, confirm delivery, hauler assign |
| **NX4** | Access / identity | invites, create user, approve access, reset **another** user’s password, role changes |
| **NX5** | Pricing / AR / accounting writes | monthly pricing saves, overrides, aging/statement promote |
| **NX6** | Any **new** code to perform an action | New edge functions / bulk mailer “helpers” |

---

## Worked examples

| Ask | Verdict |
|-----|---------|
| “Welcome should say Dave” | **SF1** candidate (session) — not a CRM write |
| “Where are statements?” | **SF2** + how-to if role allows |
| “Board looks empty” | **SF3** clear filters |
| “Email the buyer the memo” | **NX1** — human send only |
| “Allocate to Toronto Textile” | **NX2** — never |
| “Submit my payment notice” | **NX3** — never |
| “Invite our AP clerk” | **NX4** — never |
| “Draft a pickup email” (internal ops) | **SF8** only if ratified + draft-only + internal surface; else escalate |

---

## Relationship to Tier A talk-tracks

`resolution-tiers.json` Tier A (`how_to`, `navigation_help`, …) remains the **conversation** allowlist.  
Lane 2 adds **which existing UI/API triggers** Bricely may fire. Guidance without a listed SF id stays talk-only.

Password reset for **another user** stays **NX4** (email send / auth). Self-serve “how to reset” talk-track stays guidance-only.

---

## STOP

Nothing enables until PRIME:

1. Edits/ratifies this allowlist  
2. Promotes to `wmgos-safe-feature-allowlist.json`  
3. Separate enable step under DR-006 guardrails  

Kill switch `halt:true` must stop Lane 2 triggers when/if enabled.
