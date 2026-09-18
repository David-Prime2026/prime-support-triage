# DR-CS-PLATFORM-002 — Execution proposal (Cursor-validated)
**Status:** Proposed — awaiting PRIME build-order + Tier 1 fence ratification  
**Owner:** PRIME · **Author:** Cursor (Class B)  
**Relates:** DR-CS-PLATFORM-001 Phase 1 catch-net (FIX-A…C)  
**Gate:** isolated · additive · staging-then-promote · human authorize · CONTROL_PLANE on ship

---

## Validation summary

| Claim in DR | Verdict | Notes |
|-------------|---------|--------|
| Symmetry with Bricely tiers | **Sound** | Same shape: allowlist/fence auto → notify/gate → work-to-boundary |
| Extend `ticket_messages` for internal thread | **Sound with caveat** | Today `author_role` is `customer\|bricely\|rep\|system` only — need `operator\|cursor_dev` (or parallel `ticket_notes` + keep messages for customer) |
| Append-only audit via `ticket_events` | **Ready to reuse** | Detail pane already lists events; composer + richer payload missing |
| Flat-file Handoff B as execute path | **Ready for Tier 2/3 v1** | Fire-and-forget today; live in-thread needs a second channel (§ flags) |
| Tier 2 email notify | **Not built** | Ops emails in `resolution-tiers.json` only; no SendGrid outbound in support-triage |
| Sensitive never Tier 1 | **Aligns with doctrine** | Money/auth/RLS/schema/external contracts already Tier C in support doctrine |

**Recommendation:** Ship **Step 1 (operator notes)** on the current Phase 1 branch as a thin additive slice. Hold **Step 2 (Cursor-in-thread)** until fence is ratified and the live-connection flag is decided (see § Flags).

---

## Lift (hours)

| Slice | Cursor (build) | PRIME (review/test) | Total |
|-------|----------------|---------------------|-------|
| **Step 1 — Operator notes/actions** | 6–8 h | 1–2 h | **7–10 h** |
| Schema: extend messages or add `ticket_notes`; events for `note` / `action_instructed` | | | |
| Detail-pane composer + append-only timeline (operator attributed) | | | |
| Action-vs-note distinction in payload; seed/demo on OPEN-TEST tickets | | | |
| CONTROL_PLANE + staging proof | | | |
| **Step 2 — Cursor-as-dev in thread** | 18–28 h | 3–5 h | **21–33 h** |
| `dev_assessments` + `authorizations` tables | | | |
| Advisory assessment UX + “authorize / promote_target” controls | | | |
| Tier classifier vs ratified fence; Tier 1 auto path (staging-only) | | | |
| Tier 2 notify (email) + console deep-link | | | |
| Tier 3 stop-at-sensitive-boundary protocol in dispatch payload | | | |
| Live connection (poll/webhook/agent) — see Flags; upper end of range | | | |
| **Fence draft + ratification pass** | 1–2 h | 1 h | **2–3 h** |
| **Grand total (both steps)** | | | **~30–46 h** |

Step 1 alone is enough to start the authorization *record*; Step 2 closes the loop.

---

## Proposed build slices (order TBD by PRIME)

1. **002-A — Step 1 notes** (ship first): composer + timeline + `ticket_events` audit; no Cursor autonomy yet.  
2. **002-B — Fence v1**: land `config/risk-fence.json` (ratified copy of proposed fence below); UI read-only “Tier 1 fence (ratified)”.  
3. **002-C — Authorizations + assessments**: schema + UI gates; still fire-and-forget dispatch.  
4. **002-D — Tier 2 email notify**: SendGrid (or Resend) outbound using ops list.  
5. **002-E — Live Cursor-in-thread**: interactive assessment/execute (replaces pure outbox for this loop).  
6. **002-F — Tier 1 auto within fence** (staging-only): only after PRIME watches 002-C/E prove safe.

---

## Tier 1 risk-fence — PROPOSED (awaiting PRIME ratification)

Cursor proposes; **PRIME must ratify** before any Tier 1 auto-act. Until ratified, **Tier 1 = OFF**.

### IN — enumerable low-risk categories (staging-only by default)

| ID | Category | Examples in this codebase | Constraints |
|----|----------|---------------------------|-------------|
| F1 | Display copy / labels | Console strings, empty-state text, button labels in `support-triage/src` or additive `src/bricely` copy | No legal/SLA customer-facing doctrine text; no email template meaning change |
| F2 | CSS / layout polish | Spacing, color tokens already in use, non-behavioral class tweaks | No auth screens; no payment UI |
| F3 | Dead-code / unused import cleanup | Lint-driven removals with no behavior change | Diff must be delete-only or import-only |
| F4 | Comments / JSDoc / CONTROL_PLANE narrative | Docs under `support-triage/` | No doctrine M&S customer language edits without review |
| F5 | Additive UI stubs | Placeholder nav panels that already exist as stubs | Must not wire new prod endpoints |
| F6 | Test-only / seed data in isolated DB | OPEN-TEST seeds, fixtures under `support-triage` | Never WMG OS prod project |
| F7 | Config values inside ratified allowlists | Toggle a **already-listed** Tier A allowlist `enabled` flag in staging config | Cannot add new allowlist types without PRIME |

### OUT — never Tier 1 (Tier 2 minimum; sensitive → Tier 3)

| Excluded | Why |
|----------|-----|
| Any SQL migration / schema / RLS / grants | Data integrity + FIX-C lesson |
| Auth, JWT, invite, password, portal bind | Auth surface |
| Money, invoice, AR, QBO, pricing, memo dollars | Accounting / money |
| External contracts (SendGrid, webhooks, third-party APIs) | External blast radius |
| Dispatch/handoff payload shape or approve gates | Human-gate integrity |
| RLS policies, `anon` staging bypass widening | Security |
| WMG OS production project / prod env vars | Isolation |
| New edge functions or changes to AI classifier thresholds | Behavior / risk model |
| Anything touching `qcefkoxqkfwnlqfmwzmi` | Hard STOP |

**Start posture:** all F1–F7 = **staging branch + PR only**; no direct-to-prod until PRIME widens named IDs in `risk_fence` (`prod_allowed: false` → `true` per category).

---

## Flags (PRIME decisions needed)

### Flag A — Tier 2 notification mechanism
**Today:** no outbound mailer in support-triage.  
**Options:**
1. **SendGrid** (matches WMG OS patterns) via new edge `notify-ops` — lowest integration friction if keys already in PRIME vault.  
2. **Resend / Postmark** — clean API, still needs DNS from-domain.  
3. **Interim:** console badge + optional webhook to Slack/email bridge; ship Step 1 without email.

**Propose default:** (1) SendGrid to `resolution-tiers.json` ops list, subject `CS Tier 2 · {ticket_id} · needs authorization`, deep-link `http://127.0.0.1:5179/?ticket={id}` (later staging URL).

### Flag B — Live in-ticket Cursor connection
**Today:** fire-and-forget Handoff B JSON → `dispatches/outbox/` (operator drops file / watched dir). No bidirectional thread.  
**Options for Step 2:**
1. **Poll bridge (v1):** console posts `dev_request` row; local Cursor agent / watched-dir watcher writes `dev_assessments` + outcome files; UI polls every N seconds. Keeps isolation; no always-on cloud agent.  
2. **Webhook in + out:** edge receives Cursor callbacks; needs public URL / tunnel for local.  
3. **Same-session agent tool:** only works when PRIME has an active Cursor chat attached to the ticket (not durable for async).

**Propose default:** **Poll bridge (v1)** for staging proof; keep Handoff B download as the execute artifact; thread shows assessment + auth + outcome. Escalate to webhook when staging URL is stable.

---

## Data model (proposed migrations — not applied)

```
support.ticket_notes          — if we avoid overloading customer ticket_messages
  id, ticket_id, author_email, actor_type (operator|cursor_dev|system),
  kind (note|action|question|assessment|authorization|outcome),
  body, meta jsonb, created_at  -- append-only (no UPDATE/DELETE policies)

support.dev_assessments
  id, ticket_id, note_id?, impact, dependencies, blast_radius, confidence,
  advisory boolean DEFAULT true, created_at

support.authorizations
  id, ticket_id, authorized_by, scope text, tier (1|2|3),
  promote_target (staging|prod), assessment_id?, created_at

support.risk_fence
  id, version, categories jsonb, ratified_by, ratified_at, effective_date

ALTER engineering_handoffs
  ADD tier, promote_target, authorization_id
```

Alternatively: extend `ticket_messages.author_role` + `channel='admin'` for Step 1 only (faster), then split notes later for SOC clarity.

**Cursor recommendation:** dedicated `ticket_notes` for the **internal** PRIME↔dev trail (keeps customer/`bricely` thread clean for SOC/GDPR narrative).

---

## Guardrails (reaffirm)

1. Fence ratified before Tier 1 ON.  
2. Tier 1 staging-only until PRIME widens categories.  
3. Sensitive areas never Tier 1.  
4. Assessments advisory; human authorizes; record says so.  
5. Everything logged, committed, reversible, visible.  
6. Promote is PRIME’s per fix; prod never without it.  
7. Isolation + CONTROL_PLANE unchanged.

---

## Definition of done (when build ordered)

Per DR §6. Plus: fence JSON ratified file in repo; Step 1 demonstrable on OPEN-TEST ticket; Step 2 demonstrable assessment→authorize→dispatch→outcome in thread; CONTROL_PLANE SHIPPED entry.

**STOP** after each slice for PRIME test → approve → merge → push.
