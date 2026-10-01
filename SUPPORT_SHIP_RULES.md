# Support ship rules

**In force:** DR-CS-PLATFORM-015 (2026-09-28)

You: **support lane**. Not you: WMG main, `qcefkoxqkfwnlqfmwzmi`, Bricely mail from operator.

This file lives at the root of `David-Prime2026/prime-support-triage` and in `.cursor/rules/`. Do **not** keep a second live copy under `wmg-backend/support-triage`.

---

## Source of truth

| Check | Use |
|---|---|
| CS completeness | `prime-support-triage` PRs + that repo’s `main` |
| CS deploys | `apxbwdxszmdffbduhjen` |
| WMG live | Operator `wmg-backend` / `Wmsosv2` `main` |

Nested `wmg-backend/support-triage` is a **freeze**. Do not develop there. Do not tell operator “it isn’t pushed” because that folder or WMG `main` lacks your drafts.

---

## Git

- Work on **this repo only**.
- Keep **one integration branch** for anything operator might copy (`cursor/integrate-cs-1-6-ac30` or successor). Rebase onto CS `main` first. Stack PRs; do not leave six sibling drafts as the copy path.
- Merge to `prime-support-triage` `main` **only**. Never to `wmg-backend` or `Wmsosv2`.
- Deduplicate overlapping PRs before stacking (#4 / #5 overlap).
- Draft is fine. **Unmerged and split is not a copy path.**

---

## Deploy

- Functions and CS schema: `apxbwdxszmdffbduhjen` only.
- Never `db push`, `apply_migration`, or `deploy_edge_function` against `qcefkoxqkfwnlqfmwzmi`.
- Never point diagnose / intake / email-intake at WMG inbound-email or the WMG SendGrid path.
- Prove with HTTP on the support project, then record the version. **Diagnose 200 is not a live widget.**
- **Token:** keep this VM git-only. Do **not** drop `SUPABASE_ACCESS_TOKEN` unless it is scoped to `apxbwdx` only. Never a WMG prod (`qcefkox`) token on this machine. Later CLI apply for *other* apx schema may use an apx-only token. Not before.
- **Numbering:** `ticket_number` is already live on apx (`WMG-YYYY-MM-NNN`). Desk UI is on CS `main` (PR #11). **Do not re-apply** SQL.
- **Console host:** GitHub Pages does **not** rebuild from `main`. Hosted source is the `gh-pages` branch. Rebuild + push `gh-pages` (apx `VITE_SUPABASE_*` only) when the live console must pick up desk changes. Last Pages push before 2026-10-01 was 21 Sep.
- **Mail pipe:** do **not** wait on `email-intake`. Bricely already owns mail. Parked. Alisa split-load draft stays unsent until PRIME says send.

---

## Mail

- Support sends. Operator does not.
- From `bricely@prime-timesystems.com` only when the desk says send.
- Do not ask operator to email Skip, Jessica, Alisa, or Bricely threads.

---

## Asking operator (WMG work)

Only if the change needs WMG schema, a WMG edge function, or the live Wmsosv2 embed.

One packet. Path: `handoffs/BACKEND-REQUESTS/<NAME>.md`

```
Surface: qcefkox | Wmsosv2 | both
Tickets:
Already live on apxbwdx:
Exact change (RPC / function / file + behavior):
Proof of done:
Out of scope:
```

Do not attach six PRs. Do not mix Gmail intake, CO PDFs, or desk UI into a WMG packet.

---

## What you build next (CS maturation)

1. Rebuild `gh-pages` when the hosted desk must match `main`. Desk `ticket_number` is already on `main` (#11). Do not re-apply numbering.
2. One-brain diagnose + intake on `apxbwdx` (no canned fallback on the function).
3. Tenant-two isolation on **current apx** (contracts, intake bind, allowlist, embed env, RLS, HITL scope, own prefix). A second `clients` row is not enough. Do not stand a second Supabase project until that is proven. See `handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md`.
4. Phase 2 desk (notes, SLA, COs) on the CS repo.

Do not wait on `email-intake`. Bricely owns mail. Parked.  
Stop rediscovering Omaha / Wichita / release-09 as WMG packets. Those are operator ops or already-shipped schema.  
**Not required / must stay out:** anything on `qcefkox` / `Wmsosv2`. CS does not become a second WMG OS.

---

## Fail examples

- “Pull WMG main to get diagnose.”
- “Merge CS into wmg-backend so it is live.”
- “Widget is live because diagnose returned 200.”
- Six draft PRs, no stack, asking operator to find the hole.
- Re-apply ticket numbering from this VM. (`ticket_number` is already live.)
- Drop a `qcefkox` token (or any unscoped token) on this machine.
- Wait on `email-intake`. Bricely owns mail. Parked.
- Stand a second Supabase project before tenant-two is isolated on current `apx`.
- Ask to merge #8 / #9. `main` already has the stack. Desk UI is #11. Leave drafts #1–#6, #10 alone.
- Treat a `main` merge as a live console update. Hosted source is `gh-pages`.
