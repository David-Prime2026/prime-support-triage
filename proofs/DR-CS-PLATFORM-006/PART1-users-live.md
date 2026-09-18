# Part 1 — Catch-net open to real WMG users

**Status:** OPEN (DR-CS-PLATFORM-006)  
**Opened:** 2026-09-18

## Posture
- Config: `config/catch-net-posture.json` → `users_live`
- Bricely on internal / buyer / seller (WMG prod)
- Console: https://david-prime2026.github.io/prime-support-triage/
- Mock emails remain flag-only (`is_mock`); they do **not** block real users

## Evidence — non-mock tickets landed + surface-tagged

| Surface | Ticket id | is_mock | requester_email |
|---------|-----------|---------|-----------------|
| internal | `830eac42-41bc-44e3-a196-ecedf58a0ed0` | false | ops-smoke@wilsonmarketing.com |
| buyer | `c9587505-aa9a-478f-b4b9-866aedfe31f2` | false | smoke-buyer@wilsonmarketing.com |
| seller | `8aa2efda-242f-46e7-b86c-ee98f2c65dc5` | false | smoke-seller@wilsonmarketing.com |

All via `intake-ticket` on staging `rxhiydtqzmksaeegxyqo`, status `awaiting_approval`.

## First-day watch
PRIME watches console for real (non-mock) requests, surface tags, messy-input handling, guardrail slips.
