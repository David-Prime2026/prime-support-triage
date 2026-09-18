# A4 — One-at-a-time (serial)

**Result:** PASS

## Procedure
Queued 2 dispatches. Runner uses `for` (serial) — never `Promise.all`.

## Timing
- elapsed_ms=1344 (each item 3×200ms + overhead → expect ≥~1200ms serial)

## Log order check
- start1=0 done1=6 start2=7
- serial (start2 after done1): true

## Results
```json
[
  {
    "ok": true,
    "id": "PROOF-A4-1",
    "classification": {
      "id": "PROOF-A4-1",
      "class": "bug",
      "tier": "1.1",
      "fence": "F1",
      "straight_to_prod": true,
      "action": "execute",
      "reason": "fenced_light_bug_1.1_1.5"
    },
    "fixResult": {
      "dryRun": true
    }
  },
  {
    "ok": true,
    "id": "PROOF-A4-2",
    "classification": {
      "id": "PROOF-A4-2",
      "class": "bug",
      "tier": "1.1",
      "fence": "F1",
      "straight_to_prod": true,
      "action": "execute",
      "reason": "fenced_light_bug_1.1_1.5"
    },
    "fixResult": {
      "dryRun": true
    }
  }
]
```
