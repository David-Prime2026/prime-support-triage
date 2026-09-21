# Ticket → KB lane (thin) — HITL promote only

**At:** 2026-09-21  
**Authority:** PRIME direction — KB from tickets where deemed necessary; replace Settings Retention with KB posture; no full KB UI this turn.

## Why Settings tickets ≠ console

`CustomerSupportPanel` uses a hardcoded **DEMO** seed (`#SUP-2041` …). Console reads live `support.support_tickets` on **apx**. They are not connected. Demo banner now states this.

## What landed

| Surface | Change |
|---------|--------|
| WMG Settings | Retention Policy card → **Knowledge Base** (`Ticket-fed · SOPs next`) |
| Your Support | Banner: Demo · staging shapes |
| Console Resolve | Optional **Promote to KB** (default off) → insert `knowledge_base_refs` + desk `[KB]` note + event payload |

## Rules
- HITL only — never auto-promote on Resolve
- Primary candidates: how-to / self-serve / repeatable guidance
- No customer-visible article publish this phase
- SOP handoff (PRIME) + search UI + repo query = later DR
- Never auto `qcefkox…`

## Schema reused
`support.knowledge_base_refs` (Phase 1 stub): `client_id`, `title`, `source_path` (`ticket:<uuid>`), `notes`
