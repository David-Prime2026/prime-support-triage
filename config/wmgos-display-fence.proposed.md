# WMG OS display fence (PROPOSED) — Lane 1
**Status:** Proposed — awaiting PRIME ratification · **ENABLED = false**  
**Authority:** DR-CS-PLATFORM-007  
**Companion:** `wmgos-display-fence.proposed.json`  
**Target:** WMG OS prod `qcefkoxqkfwnlqfmwzmi` (higher stakes → stricter than support-app fence)

---

## Principle (hold this line)

In WMG OS, autonomy may change how things **LOOK**, never what they **DO or SHOW**.

- **LOOK** = presentational only (static copy, help text, non-behavioral CSS, comments).
- **DO** = actions, navigation gates, permissions, handlers, enabled/disabled.
- **SHOW** = which data fields/values/formats appear (amounts, tons, status membership, contact names from data).

**Unsure in WMG OS = escalate to PRIME. Always. Never auto.**

---

## In fence (proposed categories)

| ID | Category | Allowed only if… |
|----|----------|------------------|
| **W1** | Static UI copy typo | Hard-coded string; no DB/RPC/derived binding; typo/misspell only |
| **W2** | Static tooltip / help / aria | `STATUS_HELP` prose, `aria-label`, static `title=`; **status keys unchanged** |
| **W3** | Cosmetic CSS non-behavioral | Spacing/type/chrome only; does **not** hide/move controls or change rendered data |
| **W4** | Comments / JSDoc / internal docs | Operator-invisible |

`prod_allowed_after_ratification` is **false** in the JSON until PRIME ratifies and a separate enable step flips it.

---

## Explicit exclusions (never Lane 1)

| ID | Exclusion | Why |
|----|-----------|-----|
| **X1** | Status keys / column identity | `STATUS_CONFIG` keys drive board columns, filters, DnD |
| **X2** | Live data display | `fmt(money)`, tonnage `.toFixed`, release/memo fields, payment status maps, welcome from `contact` |
| **X3** | Nav route ids / permissions | `canAccessView`, portal screen ids |
| **X4** | Conditional visibility CSS/render | Hiding CTAs or accounting panes changes DO/SHOW |
| **X5** | Money / AR / pricing / load-state writes | Permanent hard exclude |
| **X6** | Auth / RLS / schema / edge | Permanent hard exclude |
| **X7** | Bricely behavior (not copy) | Diagnostic routing, intake, liveFix kinds |
| **X8** | Unsure or mixed diffs | Absolute default-down |

---

## Data-coupling traps (real WMG OS)

### 1. Load board column labels — `LoadBoardKanban.tsx`
- **Looks cosmetic:** `STATUS_CONFIG.uncovered.label = 'Not Covered'`
- **Coupled to:** status key `uncovered`, filter `<option value="uncovered">`, board membership, DnD
- **Safe slice after ratification:** typo in the **label string only**, or `STATUS_HELP.uncovered` prose only — keys/`value=` untouched
- **Unsafe:** rename column product language broadly, remap keys, change filter values

### 2. Seller/buyer money & tons — portals
- **Looks cosmetic:** “show one more decimal”
- **Actually SHOW:** `(lbs/2000).toFixed(…)` and `fmt(commission)` change displayed quantities/money → **excluded**

### 3. Welcome name — portals
- **Looks cosmetic:** “Welcome Dave”
- **Actually data/session:** `buyer.contact` / profile — **not Lane 1 source edits**; see Lane 2 if ratified

### 4. Nav “Accounting” label — `App.tsx`
- **Looks cosmetic:** rename nav text
- **Coupled to:** `id: 'accounting'` + feature permissions — treat as **excluded** unless PRIME explicitly ratifies label-only with id frozen (still escalate if unsure)

### 5. Allocate CTA caption
- **Safe:** fix typo `Alocate` → `Allocate` with handler unchanged
- **Unsafe:** CSS-enable a disabled allocate button; change caption to imply a different workflow

---

## Worked examples

| ID | Ask | Verdict |
|----|-----|---------|
| EX-SAFE-1 | Typo in Create Load helper prose | **Candidate W1** (literal unbound string) |
| EX-SAFE-2 | Clarify `STATUS_HELP.uncovered` wording | **Candidate W2** (key unchanged) |
| EX-UNSAFE-1 | Rename column “Not Covered” → “Awaiting Hauler” | **Excluded X1** — product change; escalate |
| EX-UNSAFE-2 | Tons to 3 decimals | **Excluded X2** — changes SHOW |
| EX-UNSAFE-3 | Hide Accounting nav | **Excluded X3/X4** — changes DO |
| EX-UNSAFE-4 | Wrong commission on statement | **Excluded X5** — money |
| EX-UNSAFE-5 | Welcome = Dave via code hard-code | **Excluded** — use Lane 2 or escalate |

Bug-vs-change still governs: a pure product rename with no defect anchor is a **change** → never autonomous.

---

## STOP

Nothing in WMG OS auto-executes under this fence until PRIME:

1. Edits/ratifies categories  
2. Promotes to `wmgos-display-fence.json`  
3. Explicitly enables in a **separate** DR/step  

Kill switch + DR-006 guardrails remain mandatory when/if enabled.
