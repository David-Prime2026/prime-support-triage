# A3 — Real-time CONTROL_PLANE / live log

**Result:** PASS

## Checks
- Live log grew during/after run: true
- Observed `dispatch_step` while still running: true (samples=11)
- CONTROL_PLANE contains marker `A3-LIVE-1789771472970`: true

## Mid-run observations
```json
[
  {
    "at": "2026-09-18T22:44:33.094Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:33.201Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:33.310Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:33.418Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:33.523Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:33.632Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:33.740Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:33.848Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:33.956Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:34.066Z",
    "saw": "dispatch_step_while_running"
  },
  {
    "at": "2026-09-18T22:44:34.173Z",
    "saw": "dispatch_step_while_running"
  }
]
```

## Log excerpt (marker + dispatch)
```
{"at":"2026-09-18T22:44:32.971Z","type":"proof_a3_marker","marker":"A3-LIVE-1789771472970","note":"written BEFORE dispatch completes"}
{"at":"2026-09-18T22:44:32.975Z","type":"dispatch_start","id":"PROOF-A3-LIVELOG","summary":"comment-only proof — control plane narrative"}
{"at":"2026-09-18T22:44:32.980Z","type":"classified","id":"PROOF-A3-LIVELOG","classification":{"id":"PROOF-A3-LIVELOG","class":"bug","tier":"1.1","fence":"F4","straight_to_prod":true,"action":"execute","reason":"fenced_light_bug_1.1_1.5"}}
{"at":"2026-09-18T22:44:32.983Z","type":"dispatch_step","id":"PROOF-A3-LIVELOG","step":1,"of":4}
{"at":"2026-09-18T22:44:33.294Z","type":"dispatch_step","id":"PROOF-A3-LIVELOG","step":2,"of":4}
{"at":"2026-09-18T22:44:33.603Z","type":"dispatch_step","id":"PROOF-A3-LIVELOG","step":3,"of":4}
{"at":"2026-09-18T22:44:33.912Z","type":"dispatch_step","id":"PROOF-A3-LIVELOG","step":4,"of":4}
{"at":"2026-09-18T22:44:34.220Z","type":"fix_dry_run","id":"PROOF-A3-LIVELOG","summary":"comment-only proof — control plane narrative"}
{"at":"2026-09-18T22:44:34.222Z","type":"dispatch_complete","id":"PROOF-A3-LIVELOG","classification":{"id":"PROOF-A3-LIVELOG","class":"bug","tier":"1.1","fence":"F4","straight_to_prod":true,"action":"execute","reason":"fenced_light_bug_1.1_1.5"},"fixResult":{"dryRun":true}}
{"at":"2026-09-18T22:44:34.227Z","type":"control_plane_append","title":"PROOF A3 — live log A3-LIVE-1789771472970"}
```
