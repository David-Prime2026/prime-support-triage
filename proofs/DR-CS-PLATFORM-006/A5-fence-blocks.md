# A5 — Fence loads and blocks disqualified items

**Result:** PASS

## Fence
- status=ratified version=1.0.0
- explicitly_excluded includes project_qcefkoxqkfwnlqfmwzmi: true

## Classifier
- status=ratified default_down=true

## Classification matrix
| ID | expect | action | reason |
|----|--------|--------|--------|
| BLOCK-H1-MONEY | block | block | H1:money/AR/pricing |
| BLOCK-H2-AUTH | block | block | H2:auth/portal |
| BLOCK-H3-SCHEMA | block | block | H2:auth/portal |
| BLOCK-H4-EXTERNAL | block | block | H4:external contracts |
| BLOCK-H5-DISPATCH | block | block | H5:dispatch/approve gates |
| BLOCK-H6-PRODREF | block | block | H6:prod_ref_qcefkox blocked |
| BLOCK-H7-UNSURE | block | block | H7:cursor unsure — default DOWN |
| ALLOW-F1-TYPO | execute | execute | fenced_light_bug_1.1_1.5 |

## Runtime block (money dispatch)
```json
{
  "ok": false,
  "blocked": true,
  "classification": {
    "id": "PROOF-A5-MONEY-BLOCK",
    "class": "disqualified",
    "tier": "blocked",
    "straight_to_prod": false,
    "action": "block",
    "reason": "H1:money/AR/pricing",
    "default_down": true,
    "method_version": "1.0.0"
  },
  "id": "PROOF-A5-MONEY-BLOCK"
}
```
