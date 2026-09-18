# Bug-vs-Change classification method (PROPOSED)
**Status:** Proposed — awaiting PRIME ratification · **Tier 1 prod-eligible = OFF**  
**Owner:** PRIME · **Author:** Cursor (DR-CS-PLATFORM-002)  
**Machine-checkable companion:** `bug-change-classification.proposed.json`  
**Rule:** Do NOT build or enable straight-to-prod / prod-eligible Tier 1 until PRIME ratifies this method and sets conservatism.

---

## 0. Purpose

Straight-to-prod is contemplated for **bugs only, never changes**, and only the lightest clear-cut cases. That depends on a **checkable** method to distinguish:

1. **Bug vs Change** (or Ambiguous → treat as change/gated)
2. Within bugs: **1.1–1.5** (prod-eligible *candidates*) vs **1.6–1.10** (staging first)

The “~40% straight-to-prod” idea is an **outcome to be earned by evidence**, not a target. This classifier must never be tuned to hit a percentage.

---

## 1. Definitions

### Bug
**Restoring intended / specified / previously-working behavior** that the system already claimed to provide.

Intended behavior must be evidenced by at least one **anchor** (see §2). The fix’s sole purpose is to make actual behavior match that anchor — not to introduce a new capability, workflow, or product decision.

### Change
**Introducing new or different behavior** — including new features, UX redesigns, policy choices, “it would be better if…”, expanding scope beyond what was delivered, or treating a known **limitation** as if it were a defect in shipped intent.

### Ambiguous
Insufficient evidence to prove an anchor, OR mix of bug + change in one ask, OR Cursor is unsure. **Ambiguity is not a middle tier for prod** — it resolves **conservative** (§5).

---

## 2. Bug signals (enumerable — need ≥1 strong anchor)

Classify as **bug** only if **all** of B0–B2 hold, plus ≥1 of B3–B7:

| ID | Signal | Checkable test |
|----|--------|----------------|
| **B0** | Not a hard disqualifier | None of §4 apply |
| **B1** | Restorative intent | Fix description is “should do X / does Y” — not “add X” / “support Y” / “redesign Z” |
| **B2** | Scoped to existing surface | Touches code paths that already implement the claimed behavior (no new product module) |
| **B3** | Spec / ticket anchor | Written intended behavior in ticket, SOP, closeout, UI label, or API contract: “should X” |
| **B4** | Regression anchor | Worked in a known-good commit/env; now fails with same inputs |
| **B5** | Error / exception anchor | Reproducible crash, 4xx/5xx, constraint violation, or hard failure on a supported path |
| **B6** | Invariant broken | Data/UI inconsistency the product already promised (e.g. saved row missing field the form collected) |
| **B7** | Explicit defect language from ops | Logged as defect in bugs-and-fixes-log / CS ticket with status `open`/`investigating`/`fixed` (not `limitation`) |

### Disqualifiers → Change or Ambiguous (even if “feels broken”)

| ID | Disqualifier | Result |
|----|--------------|--------|
| **D1** | Ask is “add / support / allow / also…” without prior claim | **Change** |
| **D2** | Logged as `limitation` or “works as designed” | **Change** (product/UX work) |
| **D3** | Fix requires inventing new business rules | **Change** or **Ambiguous** |
| **D4** | Multiple commodities of work (bug + enhancement) in one ask | **Ambiguous** → split or stage |
| **D5** | No anchor (B3–B7); only vibe / preference | **Ambiguous** |
| **D6** | Cursor cannot name the intended behavior in one sentence | **Ambiguous** |
| **D7** | “Should we…” / policy / billing / coverage judgment | **Change** (human product call) |

---

## 3. Sub-tiers (bugs only)

Only applied **after** classification = Bug and B0 passes. Each assignment must cite **criteria IDs** so a reviewer sees why.

### Band A — Tier **1.1–1.5** (straight-to-prod *eligible* after ratification — still one-at-a-time, logged, revertible)

Clear, unambiguous, **lightweight** bugs. Must satisfy **all** of:

| ID | Criterion |
|----|-----------|
| **P1** | Single, named failure mode; one primary code locus |
| **P2** | Fix is small: prefer ≤~50 LOC net behavioral change; no new tables/RPCs/edge functions |
| **P3** | No schema / migration / RLS / auth / money / external-contract touch (§4) |
| **P4** | Deterministic repro or obvious invariant (not “sometimes / depends”) |
| **P5** | Trivially revertible (single PR revert; no data backfill required) |
| **P6** | Blast radius = one UI flow or one pure function / display path |
| **P7** | Cursor confidence **high** (can state intended behavior + fix in ≤3 sentences with no hedging) |

**Sub-slot guidance (checkable, not aesthetic):**

| Slot | Extra criterion |
|------|-----------------|
| **1.1** | Typo / wrong string / wrong constant that breaks labeled behavior; one-file |
| **1.2** | Null/undefined guard or off-by-one on an existing pure display/transform |
| **1.3** | Wrong branch/condition that clearly inverts intended boolean already in code comments/tests |
| **1.4** | Missing field map / forgotten key in an existing serializer when schema already has the column |
| **1.5** | Equivalent to 1.1–1.4 but two tightly coupled files in same feature folder |

If any P-criterion fails → **not** 1.1–1.5.

### Band B — Tier **1.6–1.10** (staging first — still “bug,” not change)

Heavier or **conditional** bugs Cursor may still treat as bugs but **must stage**. Any one of:

| ID | Pushes to 1.6–1.10 |
|----|-------------------|
| **S1** | Multi-step repro / environment-conditioned (“only if primary vs distro”) |
| **S2** | Touches >2 modules or shared helpers used by multiple portals |
| **S3** | Partial fix history (some shipped, remainder deferred) — remaining work may be conditional |
| **S4** | Needs data migration, backfill, or dual-write — even if restorative |
| **S5** | Fix size or uncertainty exceeds P2/P7 but still clearly a bug |
| **S6** | Side effects on email/board/notify paths (even if not “external contract” rewrite) |
| **S7** | Requires feature flag / staged rollout to observe safely |

| Slot | Typical shape |
|------|----------------|
| **1.6** | Clear bug; 2–3 files; staging for observation |
| **1.7** | Conditional on role/account type |
| **1.8** | Cross-portal (seller↔buyer↔ops) |
| **1.9** | Needs seed/fixture proof in staging DB |
| **1.10** | Bug-confident but high blast radius → stage + PRIME promote |

**Anything above 1.10 or failing bug test** → Tier 2/3 notify / authorize (DR-CS-PLATFORM-002), not autonomous.

---

## 4. Hard disqualifiers (never straight-to-prod)

Regardless of how bug-like:

| ID | Area |
|----|------|
| **H1** | Money / AR / invoice / pricing / memo dollars / QBO |
| **H2** | Auth / invite / password / JWT / portal bind / CRM identity |
| **H3** | Schema / migrations / RLS / grants |
| **H4** | External contracts (SendGrid, webhooks, third-party APIs) |
| **H5** | Dispatch / approve / handoff gates / human-authorization integrity |
| **H6** | Any write targeting prod project `qcefkoxqkfwnlqfmwzmi` without explicit PRIME promote |
| **H7** | Cursor **unsure** (bug vs change, tier, or blast radius) |

H1–H7 ⇒ minimum **staging + PRIME gate**; sensitive → Tier 3 work-to-boundary.

---

## 5. Conservatism rule (mandatory)

1. **Default DOWN on uncertainty.** Unsure bug vs change → **Change/Ambiguous → stage or notify**. Unsure tier → **higher** (more gated) band, never lower.
2. Never “round up” into 1.1–1.5 to increase straight-to-prod rate.
3. Every straight-to-prod-eligible execution (when someday enabled) must be: **committed (PR)**, **trivially revertible**, **one-at-a-time**, **observed**, **CONTROL_PLANE logged in real time**.
4. **Kill switch** (required before any enablement):
   - File: `support-triage/config/autonomy-killswitch.json` → `{ "halt": true }`
   - Env: `CURSOR_DEV_AUTONOMY=off`
   - CONTROL_PLANE banner: autonomy halted  
   Any one active ⇒ **no** Tier 1 auto / no straight-to-prod pipeline.

---

## 6. On the ~40% estimate

Not a KPI. Classifier reports honest labels; empirical rate of 1.1–1.5 among real bugs is an **observed statistic** for PRIME after ratification. PRIME sets final conservatism (e.g. tighten P2 LOC, require tests, or disable 1.4–1.5 entirely).

---

## 7. Worked examples (bugs-and-fixes-log)

Method applied retrospectively to known cases. Classifications are **illustrative for ratification** — not permission to auto-ship.

### BUG-001 — Mixed-load multi-commodity + split qty
- **Bug vs Change:** **Bug** (B3/B6/B7 — form collected multi-commodity; backend promoted first only). Remainder “qty split Phase 2” = **Change/Ambiguous** if bundled.
- **Hard disqualifier?** Memo pricing touch → careful; priced-rows fix was money-adjacent → **H1 risk** for any dollar path.
- **Tier:** Full original ask → **1.8–1.10** staging (S3 partial fix, S2 cross-path). Pure “persist selected commodity ids already on form” with no price math might be argued 1.6 — **still staging** under H1 caution.
- **Straight-to-prod?** **No.**

### BUG-002 — Portal password reset missing
- **Bug vs Change:** Debatable product gap vs defect; ops treated as lockout defect. Method: missing advertised recovery → could be Bug (B3/B5) **but**
- **Hard disqualifier:** **H2 auth** + **H4** email/SendGrid.
- **Tier:** Tier 3 / gated.
- **Straight-to-prod?** **No.**

### BUG-003 — Invite/verify landed on localhost
- **Bug vs Change:** **Bug** (B4/B5 — Auth Site URL / redirects wrong vs intended prod URL).
- **Hard disqualifier:** **H2 auth**.
- **Straight-to-prod?** **No.**

### BUG-004 — Portal approve broken + wrong-account CRM bind
- **Bug vs Change:** **Bug** (B5/B6 — approve path + identity bind invariant).
- **Hard disqualifier:** **H2 auth/CRM bind**.
- **Straight-to-prod?** **No.**

### BUG-005 — Seller load in DB but board/invite email broken
- **Bug vs Change:** **Bug** (B6 — row exists, board/email path failed).
- **Hard disqualifier:** **H4** email path; possibly multi-system → **S6**.
- **Tier:** **1.8–1.10** staging minimum.
- **Straight-to-prod?** **No.**

### BUG-006 — Buyer primary not seeing assigned loads
- **Bug vs Change:** **Bug** (B3/B6 — primary should see assignments; distro vs primary condition).
- **Hard disqualifier:** none of H1–H6 necessarily; **S1/S7** role-conditioned.
- **Tier:** **1.7** (conditional on role) → staging first.
- **Straight-to-prod?** **No** (fails P4 deterministic-simple / S1).

### BUG-007 — Accept “Later” left no way to add hauler
- **Bug vs Change:** **Bug or Ambiguous** — if product intended a later hauler path that was omitted, Bug (B3); if never designed, **Change (D1/D2)**.
- Without a written anchor → **Ambiguous → stage / notify** (conservatism).
- **Straight-to-prod?** **No.**

### BUG-008 — Duplicate key on sales memo number
- **Bug vs Change:** **Bug** (B5 — constraint/duplicate on sequencer).
- **Hard disqualifier:** **H1** money/memo numbering.
- **Straight-to-prod?** **No.**

### BUG-009 — No invoice/AR after delivery confirm
- **Bug vs Change:** **Bug** (B3/B6 — confirm should create invoice/AR).
- **Hard disqualifier:** **H1** money/AR.
- **Straight-to-prod?** **No.**

### BUG-010 — Approve blocked: requester not on CRM
- **Bug vs Change:** **Bug** (B5 — approve blocked incorrectly) or data issue.
- **Hard disqualifier:** **H2** CRM/approve identity.
- **Straight-to-prod?** **No.**

### BUG-011 — Commodity pricing date range not sticky / wrong memo dollars
- **Bug vs Change:** **Bug** (B6 — sticky range / wrong dollars).
- **Hard disqualifier:** **H1** pricing/money.
- **Straight-to-prod?** **No.**

### BUG-012 — Allocate email UI shows one contact only
- **Bug vs Change:** Log status **`limitation`** → **Change (D2)** — data/UX completeness, not defect-in-intent for auto bug path.
- **Straight-to-prod?** **No.**

### Hypothetical (for contrast) — eligible shape
“Seller board column header reads `Staus` instead of `Status`; one string in one component; no logic change.”  
→ **Bug** (B3 label) · **1.1** · no H\* · P1–P7 pass · **only this class** is a straight-to-prod *candidate* after ratification.

### Scoreboard on the real 12
| Outcome under this method | Count |
|---------------------------|-------|
| Straight-to-prod eligible (1.1–1.5) | **0 / 12** |
| Bug but staging (1.6–1.10) | ~2–3 (e.g. BUG-006; maybe narrow slice of BUG-001) |
| Hard-disqualified or Change/Ambiguous | **majority** |

This is expected. The real soft-launch log is heavy on auth/money/cross-portal. A ~40% prod rate would only appear later on a different mix of **light** defects — if earned.

---

## 8. Ratification checklist (PRIME)

- [ ] Accept / edit definitions (§1)
- [ ] Accept / edit signals & disqualifiers (§2)
- [ ] Accept / edit 1.1–1.5 and 1.6–1.10 criteria (§3)
- [ ] Confirm hard disqualifiers (§4)
- [ ] Confirm conservatism + kill switch (§5)
- [ ] Set conservatism dial (e.g. disable 1.4–1.5; require tests; lower LOC cap)
- [ ] Explicitly: **prod-eligible tier remains OFF** until a separate enable decision

**STOP.** No build of prod-eligible autonomy until ratification.
