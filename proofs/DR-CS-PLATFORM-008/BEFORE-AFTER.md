# DR-CS-PLATFORM-008 — before / after conversations

Old widget loop (tester report): ask → screenshot → clear filters / refresh → hard ~5-turn cap.

New engine: `npm run proof:dr-008` (policy 8 + live-wCe 8).

Live widget today runs a **client** `wCe` (hard cap `e$=8`, canned screenshot / clear-filters).  
`bricely-diagnose` is the drop-in for that function. Deploy from `wmg-backend/support-triage` to `rxhiydtqzmksaeegxyqo`, then swap `wCe` — see `handoffs/DR-CS-PLATFORM-008/PUSH-FROM-WMG-BACKEND.md`.

## T1 — already-cleared filters (the canned-response complaint)

**User:** The load board still shows yesterday's loads even after I cleared the filters.

| | Action | Reply shape |
|--|--------|-------------|
| **Before** | screenshot, then “clear filters / refresh” | Ignores “I already cleared filters” |
| **After** | `escalate` | Acknowledges filters already cleared; no screenshot; no repeat safe-step; 24h specialist |

## T2 — how-to, already clear

**User:** How do I export the load board to CSV?

| | Action |
|--|--------|
| **Before** | Screenshot / filter gauntlet |
| **After** | `answer` — export guidance; no screenshot; no filters |

## T3 — vague

**User:** it's not working

| | Action |
|--|--------|
| **Before** | Scripted screenshot + filters |
| **After** | `clarify` — one question (which screen); no screenshot |

## T4 / T5 — screenshot only when justified

- Missing button, no image → `request_evidence` once
- Same + attachment already present → `escalate`, do not ask again

## T6 — accounting

**User:** Why is my aging report and invoice totals wrong?

Coming-soon + escalate. No billable / SLA / “your contract.”

## T7 — turn target is an offramp, not a wall

At ~5 user turns, still unsolved → `offer_continue_or_ticket` (keep digging **or** specialist). Soft backstop 12 escalates runaway threads.

## T8 — never re-ask a known surface

User already said “load board.” Follow-up does not ask “which screen?” again.
