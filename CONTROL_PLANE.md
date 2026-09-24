## DR-CS-PLATFORM-008 — Bricely Gmail designated intake — 2026-09-24 — **SHIPPED (pipe) / STOP (function deploy token)**

PRIME: designated support email is **bricely@prime-timesystems.com**. Mail must open tickets on `apxbwdxszmdffbduhjen` and run catch-net. Never `qcefkoxqkfwnlqfmwzmi`.

SENT NOW:
- CO-015 waiting-for-approval → skip@wilsonmarketing.com, CC Alisa + David. Gmail `1a0d4ac2a483a47c`. PDF attached (`quotes/CO-015-portal-dashboard-multi-location.pdf`).

SHIPPED (this repo):
- Doctrine Exhibit A channel + support email → Bricely (operators.primary already Bricely)
- `email-intake` alias map includes Bricely + `wmg-os@…`; `source_channel: email`; thread dedup; `CHANGE ORDER WAITING FOR APPROVAL` / `CHANGE ORDER APPROVED` notify payloads
- `process-ticket-ai` honors `AUTONOMY_HALT` (kill switch mid-flight)
- Gmail poll → `scripts/gmail-intake-once.ts`
- Live WMG embed already points intake + thread at **this** project (not empty, not OS prod)

PROVED:
- Unread Bricely support thread + two proof sends created real email tickets on `apxbwdxszmdffbduhjen` (see `proofs/DR-CS-PLATFORM-008/GMAIL-INTAKE.md`)
- `npm run proof:gmail-intake`
- Password-reset ticket `fa4f4296-…` is the Tier A sample; dashboard ticket `c6dda146-…` is the non-allowlist sample (no auto-bill — classifier not live yet)

BLOCKER: `email-intake` / `process-ticket-ai` / `bricely-diagnose` are **404** on parent; live `intake-ticket` lacks followup append. This VM has no `SUPABASE_ACCESS_TOKEN`. Push from `wmg-backend-bricely` with `scripts/deploy-triage-functions.sh`. Kill switch stays `halt: false` until you must stop.

---

## HOTFIX — desk Enter / resolve path / post-ticket dialogue — 2026-09-24

Operator: command box Enter only inserted a newline; `@eng` looked like a Cursor session; console did not say how to close tickets; Bricely died after OPEN TICKET.

SHIPPED (this repo):
- Console command box: **Enter sends**, Shift+Enter newline; `@eng` / `@cursor` chips with honest copy (not a live Cursor pair)
- Ticket detail: **How to finish this ticket** + labeled Approve / Resolve — close / Change order
- `bricely-diagnose` live adapter: after `openTicketId`, keep talking and set `append_to_ticket_id` (no “already with specialist” wall)
- `intake-ticket` accepts `followup_ticket_id` to append customer detail to the existing ticket
- Proof L9: post-ticket follow-up stays `continue`

PENDING: deploy console (gh-pages) + `intake-ticket` / `bricely-diagnose` to `apxbwdxszmdffbduhjen`; swap live `wCe` `if (openTicketId) wall` for the remote drop-in. Live widget still walls until that push.

---

## DR-CS-PLATFORM-008 — EXECUTED (policy + live wCe contract) — 2026-09-19 — **STOP — push from wmg-backend**

Tester report: Bricely “asks the same questions,” “keeps asking for screenshots and removing filters,” “isn’t reading the question, just firing canned responses.”

Live widget (inspected on wmgos.primetimesystems.ai): canned loop is **client `wCe`**, hard cap `e$=8`, flags `triedSafeStep` / `softTipDone` / `expectedAsked`. Intake + thread already hit staging `rxhiydtqzmksaeegxyqo`. `bricely-diagnose` is **404** until you deploy.

SHIPPED (this repo = `wmg-backend/support-triage` tree):
- Doctrine §4.0 comprehension-led; `resolution-tiers.json` target 5 + continue-or-ticket + soft backstop 12
- `bricely-diagnose` accepts **live `wCe` body** `{ text, state, newAttachments }` → `{ reply, next, terminal, liveFix? }`
- Preserved product verbs: new chat, open ticket, welcome-name live fix, accounting coming-soon
- Replaced canned screenshot / clear-filters / hard-8 wall
- Proofs: `npm run proof:dr-008` (8 policy + 8 live-wCe)
- Push runbook: `handoffs/DR-CS-PLATFORM-008/PUSH-FROM-WMG-BACKEND.md`
- Embed swap: `handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts`

STUBBED / YOUR PUSH (this VM has no wmg-backend checkout and no Supabase CLI token):
1. Copy function files into `wmg-backend/support-triage/` (path Friday used: `C:\\Users\\daves\\wmg-backend\\support-triage`)
2. `npx supabase functions deploy bricely-diagnose --project-ref rxhiydtqzmksaeegxyqo --no-verify-jwt`
3. Swap live `wCe` + set `VITE_BRICELY_DIAGNOSE_URL` on WMG Vercel — then **you** push WMG
4. **Never** deploy/db-push to `qcefkoxqkfwnlqfmwzmi`

GUARDRAILS held: no billable/scope/cost · accounting coming-soon · no mid-chat code · doctrine internal · no WMG OS prod schema

**STOP — PRIME:** deploy function from wmg-backend → wire embed → hard-refresh → same testers + A–D (New chat between scenarios).

URLS:
- Engine (after your deploy): `https://rxhiydtqzmksaeegxyqo.supabase.co/functions/v1/bricely-diagnose`
- Thread persist unchanged: `…/functions/v1/bricely-thread`

---

## DR-CS-PLATFORM-006 — first live Tier 1 scan — 2026-09-18T22:45:11.970Z

- No fenced 1.1-1.5 candidate in queue/outbox — no fire (expected)
- Evidence: proofs/DR-CS-PLATFORM-006/FIRST-LIVE-SCAN.md

## DR-CS-PLATFORM-006 — Tier 1 ENABLED (post A1-A5) — 2026-09-18T22:45:11.817Z

- users-live + guardrails-proven + fence loaded
- fence=1.0.0 classifier=1.0.0
- straight-to-prod ON for clear 1.1-1.5 within fence only
- kill switch reachable: config/autonomy-killswitch.json halt:true
- Tier 2/3, dev-loop, email-approval remain OFF

## PROOF A5 — fence blocks disqualified — 2026-09-18T22:44:49.542Z

- PASS — H1–H7 + money runtime block; F1 typo allowed
- Evidence: proofs/DR-CS-PLATFORM-006/A5-fence-blocks.md

## PROOF A5 — fence blocks disqualified — 2026-09-18T22:44:35.888Z

- FAIL
- Evidence: proofs/DR-CS-PLATFORM-006/A5-fence-blocks.md

## PROOF A4 — one-at-a-time serial — 2026-09-18T22:44:35.710Z

- PASS — two fixes executed serially, not batched
- Evidence: proofs/DR-CS-PLATFORM-006/A4-serial.md

## PROOF A3 — live log A3-LIVE-1789771472970 — 2026-09-18T22:44:34.226Z

- Execution logged in real time to executions/live-log.jsonl
- Marker A3-LIVE-1789771472970 written before completion

## PROOF A2 — revert — 2026-09-18T22:44:32.844Z

- PASS — fix applied then clean revert to prior state
- Evidence: proofs/DR-CS-PLATFORM-006/A2-revert.md

## PROOF A1 — kill switch mid-flight — 2026-09-18T22:44:32.546Z

- PASS — dispatch halted mid-flight on file halt
- dispatch=PROOF-A1-KILL phase=mid_flight step=3
- Evidence: proofs/DR-CS-PLATFORM-006/A1-killswitch.md
# Support Triage / CS Platform — Control Plane

Isolated from WMG OS production (`qcefkoxqkfwnlqfmwzmi`).

## Branches
- Backend / admin: `feat/bricely-support-system` (`wmg-backend` / `support-triage/`)
- WMG embed: `feat/bricely-embed` (`wmg-canonical` / `src/bricely/`)

## Doctrine
- `doctrine/MS_SLA_EXHIBIT_A.md` — M&S §§18–35 + Exhibit A (INTERNAL ONLY)
- `doctrine/SLA_RULES.md` — classifier / timing / customer-language rules
- `config/resolution-tiers.json` — 0.85, Tier A allowlist, comprehension-led diagnostic target/offramp/soft backstop, ops emails
- **`config/risk-fence.json`** — PRIME-ratified Tier 1 fence v1.0.0 (DR-006)
- **`config/bug-change-classification.json`** — PRIME-ratified method v1.0.0 (defaults DOWN)
- **`config/autonomy-killswitch.json`** — live kill switch (halt / tier1 / straight-to-prod)
- **`config/catch-net-posture.json`** — users_live

## Handoffs
- **A** (quoting): JSON+CSV → `handoffs/`
- **B** (Cursor): flat-file → `dispatches/outbox/` (WMG_OS_STAGING only)
- **Tier 1 governor:** `scripts/tier1/` · live log `executions/live-log.jsonl` · proofs `proofs/DR-CS-PLATFORM-006/`

## Gate
Build/prove on branches. Open PR. **STOP** — PRIME tests → approves → merges → ships.
No production merge, no db push to WMG OS from this work.

---

## DR-CS-PLATFORM-006 — Users live + Tier 1 autonomous (fenced) — 2026-09-18 — **SHIPPED posture**

### Part 1 — Catch-net OPEN to real WMG users
- Posture: `config/catch-net-posture.json` → **users_live**
- Non-mock intake landed + surface-tagged (evidence: `proofs/DR-CS-PLATFORM-006/PART1-users-live.md`):
  - internal `830eac42-…` · buyer `c9587505-…` · seller `8aa2efda-…` (`is_mock=false`)
- Guardrails remain live: honest intro · no billable/scope/cost · accounting coming soon · ~turn-cap escalate 24h · fail-loud intake
- **First-day watch:** PRIME on https://david-prime2026.github.io/prime-support-triage/

### Step A — Guardrails PROVEN (evidence, not claims)
| ID | Proof | Result | Evidence file |
|----|-------|--------|---------------|
| A1 | Kill switch mid-flight halt | **PASS** (stopped at step 3) | `proofs/DR-CS-PLATFORM-006/A1-killswitch.md` |
| A2 | Fix then clean revert | **PASS** | `proofs/DR-CS-PLATFORM-006/A2-revert.md` |
| A3 | Real-time live log + CONTROL_PLANE while running | **PASS** | `proofs/DR-CS-PLATFORM-006/A3-live-log.md` |
| A4 | One-at-a-time serial (not batched) | **PASS** | `proofs/DR-CS-PLATFORM-006/A4-serial.md` |
| A5 | Fence blocks H1–H7 / money; allows F1 typo | **PASS** | `proofs/DR-CS-PLATFORM-006/A5-fence-blocks.md` |

### Step B — Ratified fence loaded
- `config/risk-fence.json` v1.0.0 (F1–F4 `prod_allowed:true`; F5–F7 staging; exclusions include `project_qcefkoxqkfwnlqfmwzmi`)
- `config/bug-change-classification.json` v1.0.0 · `default_down_on_uncertainty: true` · ~40% not a target

### Step C — Tier 1 straight-to-prod ENABLED (fenced 1.1–1.5 only)
- `autonomy-killswitch.json`: `halt:false`, `tier1_autonomy_enabled:true`, `straight_to_prod_enabled:true`
- **Kill switch still reachable:** set `halt:true` (or `CURSOR_DEV_AUTONOMY=off`) to stop immediately
- First live scan: **no fenced candidate in queue/outbox — no fire** (expected; 0/12 on real log)
- Evidence: `proofs/DR-CS-PLATFORM-006/FIRST-LIVE-SCAN.md` · `STEP-C-enabled.md`
- Tier 2/3, DR-002 dev-loop, SendGrid approval email: **still OFF / deferred**

SCHEMA: support schema on staging only — **never** on `qcefkoxqkfwnlqfmwzmi`

URLS:
- WMG: https://wmgos.primetimesystems.ai
- Console: https://david-prime2026.github.io/prime-support-triage/
- Intake: https://rxhiydtqzmksaeegxyqo.supabase.co/functions/v1/intake-ticket

---

## HOTFIX — Bricely UX + console visibility — 2026-09-18 — **READY for PRIME resume**

SHIPPED:
- Bricely: New chat (↻), expand/shrink, softer tip (clear filter — **no hard refresh first**), one ticket per thread
- Console: wired to staging `rxhiydtqzmksaeegxyqo` (was localhost-only — why tickets were invisible)
- Queue sort default: **Priority → FIFO** (oldest within priority); also Oldest / Newest
- Tickets already in DB from earlier smoke (`hi`, `new question`, load board, etc.)

URLS:
- WMG: https://wmgos.primetimesystems.ai (hard-refresh)
- Console: https://david-prime2026.github.io/prime-support-triage/ (hard-refresh → Awaiting / All)

PENDING (PRIME): resume A–D; use New chat between scenarios

---

## HOTFIX — Bricely stuck on first question / thinking dots — 2026-09-18

SHIPPED:
- `busy` now cleared in `finally` (never hangs on thinking dots after throw/abort)
- Intake fetch 10s abort timeout
- Do not persist mid-turn (orphan user-only threads)
- Normalize `diag_state` from server; `ensureIntro` on hydrate
- Late hydrate no longer clobbers an in-progress chat

PENDING (PRIME): hard-refresh WMG → re-run A–D (mock). If old orphan thread still shows, close Bricely once and reopen (intro restored).

---

## DR-CS-PLATFORM-005 — Catch-net full deploy — 2026-09-18 — **WIRED + BAKED — STOP for PRIME A–D**

SHIPPED:
- Isolated staging branch DB `rxhiydtqzmksaeegxyqo` (parent `apxbwdxszmdffbduhjen` / prime-support-triage): schema + grants + thread tables + OPEN-TEST seeds
- Edge functions live (verify_jwt false): `intake-ticket`, `bricely-thread`, `approve-handoff`
- **Tickets landed from all 3 surfaces** (API = same contract Bricely uses):
  - internal `17fdcd98-…` · buyer `1c5fe0b1-…` · seller `a561f211-…` (all `is_mock=true`)
- Thread persist round-trip PASS (POST+GET)
- REST `Accept-Profile: support` PASS (no Invalid schema)
- Console hosted: https://david-prime2026.github.io/prime-support-triage/
- Dedicated GitHub repo: https://github.com/David-Prime2026/prime-support-triage
- `wmg-backend` PR #1 **MERGED** to main (FIX console path)
- **WMG Vercel env set** (Production / Preview / Development) + production redeploy Ready:
  - `VITE_BRICELY_INTAKE_URL` → staging `intake-ticket`
  - `VITE_BRICELY_THREAD_URL` → staging `bricely-thread`
  - `VITE_BRICELY_MOCK_EMAILS` → david@ + mockbuyer/mockseller @primeai.systems
- **Baked in live JS** on https://wmgos.primetimesystems.ai (`dpl_7i7S6HVJctfGqMhVgPM8VHPCL19G` / `wmg-site-lafnlrjkg-…`)
- Straight-to-prod OFF (`autonomy-killswitch.json` halt:true); email-notify deferred

STUBBED / PENDING:
- Parent project main (`apxbwdxszmdffbduhjen`) not yet mirrored (staging branch is the live prove target)
- SendGrid approval email deferred
- **Real-user open still blocked** until PRIME A–D clean

SCHEMA: support schema on staging only — **never** on `qcefkoxqkfwnlqfmwzmi`

GUARDRAILS: isolation held; kill switch ON; dispatch staging-only; mock tickets flagged

**STOP — PRIME A–D (eyes-on, mock accounts only):**
1. **A** Internal surface — Bricely open → escalate → ticket in console (`is_mock`)
2. **B** Buyer surface — same with `david+mockbuyer@…`
3. **C** Seller surface — same with `david+mockseller@…`
4. **D** Console — https://david-prime2026.github.io/prime-support-triage/ shows all three; thread survives refresh
Do **not** open to real users until A–D pass.

URLS:
- WMG prod: https://wmgos.primetimesystems.ai
- Console: https://david-prime2026.github.io/prime-support-triage/
- Intake: https://rxhiydtqzmksaeegxyqo.supabase.co/functions/v1/intake-ticket
- Thread: https://rxhiydtqzmksaeegxyqo.supabase.co/functions/v1/bricely-thread
- Staging API: https://rxhiydtqzmksaeegxyqo.supabase.co

---

## DR-CS-PLATFORM-004 — Unblock go-live — 2026-09-17 — **partial / blocked on host**

SHIPPED (code + local prove):
- Server-side Bricely persistence: migration `20260918010621_bricely_thread_persistence.sql` (`bricely_threads` + `bricely_thread_messages`); edge `bricely-thread`; client hydrate prefers server, sessionStorage cache
- Intake tags `is_mock`, links `thread_id`, lands `awaiting_approval`; honesty banner kept
- Mock account scaffold: `config/mock-accounts.proposed.json` + `VITE_BRICELY_MOCK_EMAILS`
- Console `vercel.json` ready; hosting runbook: `docs/DR-CS-PLATFORM-004-hosting.md`
- Local schema: `supabase db reset` PASS including thread persistence
- Autonomy kill switch remains `halt: true` (straight-to-prod OFF)

STUBBED / BLOCKED:
- **No isolated cloud project yet** — org WMGOS only has WMG OS prod (`qcefkoxqkfwnlqfmwzmi`). New project **$10/mo** — awaiting PRIME CONFIRM (or alternate host target)
- Therefore: no public intake URL, no hosted console URL, `VITE_BRICELY_INTAKE_URL` not set on WMG deploy
- Mock account **emails not named** by PRIME yet
- FIX branches not merged to `main` until hosted intake can be proven (avoid shipping demo-mode Bricely to real users)

SCHEMA: support-triage migrations only (local applied). **Zero** changes to WMG OS prod.

GUARDRAILS: isolation held; kill switch ON; dispatch staging-only

PENDING (PRIME):
1. CONFIRM create `prime-support-triage` ($10/mo) **or** provide host target
2. Name mock emails (internal/buyer/seller)
3. After host live: Cursor finishes wire + deploy → PRIME re-runs DR-003 A–D → then open to users

STAGING: local Docker triage · http://127.0.0.1:5179

---

## Catch-Net Go-Live attempt — 2026-09-17 — **NO-GO** (prod deploy blocked)

SHIPPED (prep only, not prod):
- FIX-A conversation persistence implemented on embed branch (`src/bricely/persist.ts` — sessionStorage per surface/user)
- Intake honesty: `BRICELY_INTAKE_WIRED` + demo banner when `VITE_BRICELY_INTAKE_URL` empty; failed intake surfaces warning
- Operator notes composer in console (append via `ticket_events` / local fallback) — thin Step 1
- Autonomy kill switch file: `config/autonomy-killswitch.json` → `halt: true` · straight-to-prod OFF

STUBBED / BLOCKED:
- **Intake not wired in any reachable env** — `VITE_BRICELY_INTAKE_URL` unset; escalations are local demo cards only
- FIX-B/C + embed **not merged to main**; PRs still OPEN (`wmg-backend#1`, `Wmsosv2#1`)
- **No prod CS console host** — only `127.0.0.1:5179`; isolated triage DB is local Docker
- No prod mock-account isolation flag for buyer/seller test traffic
- Must NOT put `support` schema on WMG OS prod (`qcefkoxqkfwnlqfmwzmi`) — isolation held

SCHEMA: no prod schema change

GUARDRAILS:
- Straight-to-prod / Tier 1.1–1.5 **OFF** (kill switch + classification flags)
- Dispatch remains `WMG_OS_STAGING` flat-file — does not auto-execute to prod
- Real-user go-live halted until intake lands tickets in a reachable console

GO/NO-GO checklist:
| # | Item | Result |
|---|------|--------|
| 1 | Intake wired 3 surfaces → console | **NO-GO** |
| 2 | FIX-A/B/C merged/promoted | **NO-GO** (A coded locally; B/C unmerged) |
| 3 | Reachable prod env | **NO-GO** |
| 4 | Mock-account isolation | **NO-GO** |
| 5 | Prod console schema clean | **NO-GO** (no prod console) |
| 6 | Bricely guardrails in prod | **NO-GO** (not on prod) |
| 7 | Straight-to-prod OFF | **GO** |

PENDING (unblock go-live):
1. Host isolated support-triage API (Supabase project or Vercel+edge) with `intake-ticket` public URL
2. Set `VITE_BRICELY_INTAKE_URL` on WMG app deploy; CORS allow app origins
3. Merge/promote FIX-A/B/C after PRIME approve; deploy embed + console
4. Designate mock buyer/seller/internal accounts for prod test
5. Re-run GO checklist → then prod surface test A–D with eyes on

STAGING: local only · http://127.0.0.1:5179 · http://localhost:5173

---

## DR-CS-PLATFORM-002 — Cursor-as-dev (tiered autonomy + in-ticket auth) — 2026-09-17 — proposed

SHIPPED:
- None (spec + execution proposal only; build order TBD)

STUBBED / AUTHORED:
- Execution proposal: `docs/DR-CS-PLATFORM-002-execution.md`
- Tier 1 fence **proposed** (not ratified): `config/risk-fence.proposed.json` — Tier 1 OFF until PRIME ratifies
- **Bug-vs-Change classification method proposed** (not ratified): `config/bug-change-classification.proposed.md` + `.json` — prod-eligible / straight-to-prod **OFF**; ~40% is earned outcome not target
- Worked examples: BUG-001…012 under method → **0/12** straight-to-prod eligible (expected; log is auth/money-heavy)
- Lift: Step 1 notes **7–10 h** · Step 2 Cursor-in-thread **21–33 h** · fence pass **2–3 h** · combined **~30–46 h**

SCHEMA:
- Proposed only (not applied): `ticket_notes`, `dev_assessments`, `authorizations`, `risk_fence`; extend `engineering_handoffs` with tier/promote_target/authorization_id
- Recommend dedicated internal `ticket_notes` (do not overload customer `ticket_messages`)

GUARDRAILS:
- Fence Cursor-proposed / PRIME-ratified; assessments advisory; promote per-fix by PRIME; sensitive never Tier 1; isolation held
- Conservatism: default DOWN on uncertainty; kill switch required before any autonomy enable (`autonomy-killswitch.json` / `CURSOR_DEV_AUTONOMY=off`)
- **Do NOT build prod-eligible Tier 1 / straight-to-prod until PRIME ratifies bug-change method + sets conservatism**

PENDING (PRIME):
- Ratify / edit fence → `config/risk-fence.json`
- Ratify / edit bug-vs-change method + conservatism dial → promote classification files (drop `.proposed`)
- Build order: recommend **002-A Step 1 notes first**
- Flag A: Tier 2 email (propose SendGrid) vs interim console-only
- Flag B: live Cursor connection (propose poll-bridge v1)

STAGING:
- Same Phase 1 branch when build ordered · http://127.0.0.1:5179 · no prod

---

## DR-CS-PLATFORM-001 · FIX-C — Schema integrity, SLA-on-resolved, open-item path — 2026-09-17 — shipped-to-staging

SHIPPED:
- Root cause of **Invalid schema: support**: after hand-recovery wipe, `support` tables existed but **anon lacked GRANT USAGE** on schema `support` (console uses Vite anon key / Accept-Profile). PostgREST rejected the schema.
- **Follow-up (same session):** Vite was also inheriting shell `VITE_SUPABASE_URL=https://brvjzmwnuyuhzwpvhdeg.supabase.co` (no `support` schema) which overrode `.env.local`. `vite.config.ts` now forces file-based local URL; client rejects non-local URLs.
- Repair via **standard path**: `supabase db reset` applied 001→004 + `20260917215116_fix_c_schema_grants_open_seed.sql` (not hand-psql). Migration history restored (5 rows in `schema_migrations`).
- 001 grants updated for future resets: USAGE + DML to `anon` as well as authenticated/service_role.
- FIX-C migration: anon staging RLS policies on core + stub tables; **3 OPEN test tickets** (OPEN-TEST-001 w/ diagnosis P2; OPEN-TEST-002 diagnosis-less P3; OPEN-TEST-003 P1 w/ diagnosis).
- SLA clock **stops on resolved/closed/auto_resolved** — UI shows “SLA settled · met|missed at close”, never active “Breached … ago” on closed cards or detail.
- Diagnosis-less detail pane: explicit “No diagnosis…” copy; Approve→dispatch still uses request text.
- Manual ticket + Approve→dispatch **DB/local fallback** when edge functions are unreachable (still emits staging Handoff B JSON only).

STUBBED:
- Operator JWT / prime_operators auth still bypassed via anon staging policies (local Phase 1 only)
- Case-log BUG-001…012 remain client seed merge (optional future SQL upsert)
- Avg first-touch still Phase 1 stub

SCHEMA (integrity verification — isolated triage DB only):

| Check | Result |
|-------|--------|
| Tables present (16) | PASS — clients, client_contracts, auto_resolve_allowlist, support_tickets, engineering_handoffs, change_order_drafts, ticket_events, prime_operators, ticket_attachments, ticket_messages, knowledge_base_refs, retention_policies, pii_flags, access_log, data_subject_requests, ai_disclosures |
| RLS enabled on all 16 | PASS |
| support_tickets cols (priority, diagnosis_summary, surface, escalation_flag, status, resolved_at, …) | PASS |
| status/priority/ai_lane CHECK constraints | PASS |
| anon USAGE + SELECT on support_tickets | PASS |
| schema_migrations 001–004 + FIX-C | PASS |
| anon REST `Accept-Profile: support` → 200 + open rows | PASS |
| Policies present per table | PASS (1–3 each) |

GUARDRAILS:
- Isolation held (prime-support-triage only; no WMG OS `qcefkoxqkfwnlqfmwzmi`)
- **Do not hand-apply migrations as normal practice** — use CLI reset/up; hand-recovery left migration history empty and grants incomplete (this incident)
- Production untouched; no merge / no prod db push

PENDING:
- PRIME test checklist: (1) no red “Invalid schema” banner (2) resolved BUG seeds show settled SLA not breach (3) open OPEN-TEST-* → re-priority → Approve→dispatch download (4) OPEN-TEST-002 diagnosis-less still workable
- Optional: upsert BUG case log into DB; watched-dir / CS repo naming

STAGING:
- Branch `feat/bricely-support-system` — http://127.0.0.1:5179
- PR https://github.com/David-Prime2026/wmg-backend/pull/1
- Lift: ~2.5h
- Awaiting PRIME test → approve → merge → push

---

## DR-CS-PLATFORM-001 · Case log seed — bugs-and-fixes-log — 2026-09-17 — shipped-to-staging

SHIPPED:
- CS console case log pointed at `docs/bugs-and-fixes-log.md` (BUG-001…BUG-012)
- Seed module `support-triage/src/seeds/bugsCaseLog.ts` + pointer `config/case-log.json`
- All Tickets / counts / filters merge seed with live DB; filter pill “Case log (BUG-…)”
- Sidebar + banner link to GitHub canonical log

STUBBED:
- Seed is client-side merge (not yet upserted into support.support_tickets)
- Audit events for seed cases empty until DB-backed

SCHEMA:
- No new migrations; seed is flat-file → UI

GUARDRAILS:
- Isolation held; production untouched

PENDING:
- Optional SQL 005 upsert of BUG cases into isolated triage DB
- PRIME confirm watched-dir / CS repo naming

STAGING:
- Branch `feat/bricely-support-system` — http://127.0.0.1:5179
- Source: https://github.com/David-Prime2026/wmg-backend/blob/main/docs/bugs-and-fixes-log.md

---

## DR-CS-PLATFORM-001 · FIX-B — Correct admin console — 2026-09-17 — shipped-to-staging

SHIPPED:
- Admin rebuilt as async triage-and-route cockpit (PRIME navy): unified Tickets nav (All / Priority / Breaching / Awaiting Approval / Ambiguous / Assigned to me); Modules + Oversight sidebar groups (Phase 2 stubs)
- Single-line summary bar (open · P1 · breaching · auto-resolved · avg first touch)
- Filter pills (Status: Open, Priority: P1–P2, Clear all) — not toggle tabs
- 2-badge list rows only: P1–P4 + State; routing/coverage in detail pane
- Countdown SLA (time-to-touch / breached) green→amber→red; Exhibit A windows via P1–P4
- Triage list+detail: diagnosis pane, classification (internal), priority, assign, timestamps/audit, Approve→Handoff B, →Change order, Resolve
- Quote module: lift assessment + Emit Handoff A (JSON/CSV, “not the quote”) + Approve for build → Handoff B
- Catch-net landing: manual/intake tickets appear in All Tickets queues

STUBBED:
- Clients / KB / Automations / Dashboard / Audit / Compliance = shell nav placeholders (Phase 2)
- Avg first-touch metric is a Phase 1 stub (“&lt; 1h”) until dense touch events
- Vision on attachments = local staging stub (server vision later)
- Rep take-over of live conversation — NOT built (see PENDING)
- Live reply / real-time agent desk / conversation-threading-for-live-response — NOT built

SCHEMA:
- Isolated support-triage DB only: `003_phase1_cs_platform_extensions.sql` (priority, diagnosis, attachments, messages, Phase 2 stubs); `004_seed_ms_sla_doctrine.sql` (M&S §18/§19 + Exhibit A clocks)
- No WMG OS (`qcefkoxqkfwnlqfmwzmi`) schema changes

GUARDRAILS:
- Isolation held (own ports/branch/support schema)
- WMG embed remains additive-only (separate `feat/bricely-embed`)
- Human gates intact (Approve→dispatch; never auto code/prod)
- Production untouched; no merge / no db push to WMG OS

PENDING:
- Rep take-over + live reply deferred to Phase 2 — no staffing model and no operator notification process once they leave the PC; a “jump in” button would imply availability we cannot honor
- PRIME confirm: watched-dir absolute path; domain spelling; parallel CS repo name/timing
- Apply/verify migrations on any fresh local triage DB; Vercel/preview URL for embed PR when ready

STAGING:
- Branch `feat/bricely-support-system` — local preview http://127.0.0.1:5179
- PR https://github.com/David-Prime2026/wmg-backend/pull/1
- Embed companion: `feat/bricely-embed` / https://github.com/David-Prime2026/Wmsosv2/pull/1 · http://localhost:5173
- Awaiting PRIME test → approve → merge → push

---

## DR-CS-PLATFORM-001 Phase 1 (prior) — catch-net — 2026-09-17 — shipped-to-staging

SHIPPED: Bricely embed ×3 + diagnostic loop + Settings Support + handoffs A/B + M&S doctrine  
STUBBED: Full commercial console (superseded by FIX-B shell); Phase 2 slices  
SCHEMA: support-triage 001–004 only  
GUARDRAILS: held  
PENDING: FIX-B console correction (this entry above)  
STAGING: same branches/PRs — awaiting PRIME
