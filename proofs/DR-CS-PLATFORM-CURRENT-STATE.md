# DR-CS-PLATFORM-CURRENT-STATE — Reconciled system of record

**Status:** AUTHORITATIVE after Cursor reconcile 2026-09-21  
**Owner:** PRIME (David Figueroa)  
**Reconciled by:** Cursor against CONTROL_PLANE + live Supabase + Wmsosv2 main / PR #8  
**Supersedes:** scattered DR-007 / 007R / 008 / 008R / 009 + roadmap claims where they conflict with this file

---

## Canonical project refs (pinned)

| Ref | Role | Verified 2026-09-21 |
|-----|------|---------------------|
| `qcefkoxqkfwnlqfmwzmi` | WMG OS PRODUCTION — **never** autonomously touched/deployed | Hard-excluded in fences + killswitch |
| `apxbwdxszmdffbduhjen` | **Intended** authoritative prime-support-triage (governors / repo of record) | **EMPTY runtime:** no `support` schema, **0** edge functions |
| `rxhiydtqzmksaeegxyqo` | Labeled “rogue/unused” in 007R — **but still the LIVE intake host** | Edge fns ACTIVE: `intake-ticket`, `bricely-thread`, `approve-handoff`; **23 tickets** in `support.support_tickets` |

**Drift (must fix):** Doctrine says apx = live CS platform; production Bricely env + `catch-net-posture.json` still point intake/thread at **rxhiyd**. Treat rxhiyd as *de facto runtime* until functions+schema are cut over to apx.

---

## 1. What the platform IS — CONFIRMED
Standalone multi-tenant PRIME CS platform; WMG beta tenant #1.  
**Bricely** (WMG-green embed on internal / buyer / seller) + **PRIME support console** (async triage). Engine/console = PRIME; Bricely brand = WMG.

---

## 2. LIVE — catch-net (users) — MOSTLY LIVE, with host drift

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Bricely on 3 surfaces | **LIVE** | Prod WMG OS + portals |
| Intake wired; tickets land surface-tagged | **LIVE on rxhiyd, not apx** | Vercel/`VITE_BRICELY_*` → rxhiyd; tickets: awaiting_approval 21, sent_to_engineering 1, new 1 |
| Console hosted | **LIVE** (wired to rxhiyd staging) | `catch-net-posture.json` console_url + prior CONTROL_PLANE |
| Server thread persistence | **LIVE** (rxhiyd `bricely-thread`) | Function ACTIVE; client uses THREAD_URL |
| Guardrails (no billable, accounting soon, escalate) | **LIVE** | Client diagnostic + doctrine |
| Fail-loud intake banner | **LIVE** | `BRICELY_INTAKE_WIRED` / intakeWarn |

**Corrected wording for SoR:** Catch-net is open to users; **runtime DB/API = rxhiyd until cutover**. apx is governance target, not yet the ticket store.

---

## 3. LIVE — Bricely “context-aware intelligence” (DR-008) — OVERSTATED

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Comprehension-led (reads message; not a script) | **PARTIAL / NOT as stated** | Client is still `runDiagnosticTurn` **regex + phase state machine** — **no LLM** in `src/bricely/` |
| Never re-asks what’s provided | **PARTIAL** | Improved on branch; prod still can ask “which screen?” |
| Tools only when justified | **PARTIAL** | Soft tips / clarify still patterned |
| Target ~5 turns; soft “keep going or ticket”; no hard cap | **DRIFTED** | Code: hard `DIAGNOSTIC_TURN_CAP = 6` → escalate; no “keep going or create ticket” offer text |
| Page / host context | **STAGED** | On [PR #8](https://github.com/David-Prime2026/Wmsosv2/pull/8) (`feat/bricely-embed`) — **not merged**; prod lacks header “On Load Board”, chips, how-to answers |

**Corrected wording:** Bricely is a **fenced client diagnostic engine** with catch-net intake. True comprehension-led routing is **aspirational / in-progress**, not live on main.

---

## 4. LIVE — Cursor tiered autonomy — CONFIRMED (support-app fence)

| Claim | Verdict |
|-------|---------|
| Tier 1 fenced bugs; classifier default-DOWN | **LIVE** (configs + DR-006 proofs) |
| Tier 2 human-gated / Tier 3 escalate | **POSTURE documented; Tier 2/3 UX not built** (matches §7) |
| Kill / revert / live-log / serial / fence block | **PROVEN** (`proofs/DR-CS-PLATFORM-006/`) |
| Kill switch | **LIVE** `halt: false` (set `true` to stop) |

---

## 5. LIVE — WMG-OS Lane 1/2 (007R) — ENABLED with caveats

| Claim | Verdict |
|-------|---------|
| Lane 1+2 ratified + enabled on governors | **YES** — non-`.proposed` fences + killswitch flags true |
| qcefkox never auto-deploy | **HELD** — PRIME merge/deploy only |
| First-fire Create Load helper | **EXECUTED but PRODUCT-INVISIBLE** — edited dead `CreateLoadModal`; live UI is **Place Load Order**. PR #7 merged; users never saw the string. Visible helper + Bricely context = **PR #8 (open, hold merge)** |
| Lane 2 SF4 New chat | **PROVEN LIVE** under PRIME watch |

CONTROL_PLANE **body still lists 007 as PROPOSED** below the prepend — stale. Treat killswitch + ratified JSON as truth.

---

## 6. Change-order / billable handoff — DESIGN LIVE, VOLUME TBD
Handoff A/B paths + doctrine exist; not re-audited ticket-by-ticket this pass. No contradiction found with configs.

---

## 7. HELD — CONFIRMED
- Cursor Automations complementary (DR-009): **not enabled**
- SendGrid approval email loop: **deferred**
- DR-002 in-ticket Cursor conversation: **not built**

---

## 8–9. Guardrails / portability — CONFIRMED
Unsure→escalate; fence+dispatch authority; contractual merge gate to WMG OS; Cursor = tooling; product logic = fence/CONTROL_PLANE.

---

## Outside-DR improvements (recommended — do not invent as LIVE)

These improve routing / context / console **using Cursor capabilities around already-written Bricely**, without claiming Automations are on:

1. **Cutover intake host apx ← rxhiyd (P0)** — migrate `support` schema + deploy `intake-ticket` / `bricely-thread` / `approve-handoff` to apx; retarget Vercel `VITE_BRICELY_*` + console; then truly mark rxhiyd unused. Until then doctrine and runtime disagree.
2. **Ship Bricely page-context PR #8 after UX pass (P0 for “friendly”)** — host `pageContext`, header “On …”, chips, how-to answers, less ticket-nag. Still client rules — not LLM comprehension.
3. **Comprehension layer (P1, Tier 2)** — optional Claude assist *behind* the existing diagnostic fence (same customer-safe rules; never invent money/scope). Replaces regex-only “reads the message” claim with real comprehension; keep state machine as fallback.
4. **Console ticket context (P1)** — persist `page_context` / diagnosis summary on intake (PR #8 already sends `page_context`); surface on console cards for routing.
5. **Cursor Automations (P2, stays DR-009)** — suggest-only triage digest / stale-ticket ping feeding **dispatch**, never overriding fence; auto-approve only Lane 1 LOOK after PRIME scopes it.
6. **CONTROL_PLANE hygiene (P2)** — collapse prepend vs stale “007 PROPOSED” body; pin this CURRENT-STATE file at top.

---

## Net position (one paragraph)

Catch-net and Bricely embeds are **real and in users’ hands**, with tickets and threads on **rxhiyd** (not apx). Autonomy fences for support-app Tier 1 and WMG-OS Lane 1/2 are **enabled and partially fire-proven**, with the Lane 1 inaugural fire hitting **dead UI**. Bricely is **not yet** the comprehension-led agent DR-008 describes on production; that work is **in flight on PR #8** plus a future optional LLM assist. Cursor Automations remain **held**. Next hard move: **apx cutover**, then merge polished Bricely context — not more W1 copy demos.
