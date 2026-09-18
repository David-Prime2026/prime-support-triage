# A2 — Revert works

**Result:** PASS

## Procedure
1. Fixture had typo `Awaitng`.
2. Tier 1-style dispatch applied fix → `Awaiting`.
3. Reverted file to prior bytes (clean rollback).

## Before
```
# Tier 1 proof fixture (support-triage only — never WMG OS prod)
STATUS_LABEL=Awaitng approval

```

## After fix
```
# Tier 1 proof fixture (support-triage only — never WMG OS prod)
STATUS_LABEL=Awaiting approval

```

## After revert
```
# Tier 1 proof fixture (support-triage only — never WMG OS prod)
STATUS_LABEL=Awaitng approval

```

## Dispatch
```json
{
  "ok": true,
  "id": "PROOF-A2-REVERT",
  "classification": {
    "id": "PROOF-A2-REVERT",
    "class": "bug",
    "tier": "1.1",
    "fence": "F1",
    "straight_to_prod": true,
    "action": "execute",
    "reason": "fenced_light_bug_1.1_1.5"
  },
  "fixResult": {
    "path": "C:\\Users\\daves\\wmg-backend\\support-triage\\proofs\\DR-CS-PLATFORM-006\\fixture-status-label.txt",
    "from": "Awaitng",
    "to": "Awaiting"
  }
}
```
