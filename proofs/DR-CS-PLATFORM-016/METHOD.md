# DR-CS-PLATFORM-016 — Connect Grok to the support lane

**Status:** IN FORCE — 2026-09-30  
**Authority:** PRIME — this lane is permanent; Grok connects here, does not stand a new CS lane  
**Connect branch:** `cursor/jessica-wichita-empty-ac30`  
**Repo:** `David-Prime2026/prime-support-triage`  
**PR:** https://github.com/David-Prime2026/prime-support-triage/pull/9  

Paste / start-here card: [`handoffs/DR-CS-PLATFORM-016/GROK-CONNECT.md`](../../handoffs/DR-CS-PLATFORM-016/GROK-CONNECT.md)

---

## Intent

Hand the next Grok the charter, the file map, how this lane operates, the support desk URL, and the real backlog — so it does not rediscover Omaha / Wichita / retired branches / six sibling PRs.

---

## Connect

```text
Repo:   github.com/David-Prime2026/prime-support-triage
Branch: cursor/jessica-wichita-empty-ac30
Stack:  jessica-wichita-empty-ac30 → cursor/retire-backlog-current-wmg-ac30 (PR #8) → main
```

Work on this branch (or stack `cursor/<name>-ac30` off it). Merge CS `main` only. Never `wmg-backend` / `Wmsosv2`. Nested `wmg-backend/support-triage` is a freeze.

---

## Charter (how you function)

In force: **DR-CS-PLATFORM-015**.

| File | Role |
|---|---|
| `SUPPORT_SHIP_RULES.md` | Human-readable charter (repo root) |
| `.cursor/rules/support-ship-rules.mdc` | Always-applied Cursor rule. Same text. Do not keep a third copy |
| `CONTROL_PLANE.md` | Live operating memory. Newest **IN FORCE** at the top. Read before acting |
| `STATUS.md` | Area-by-area board |
| `proofs/DR-CS-PLATFORM-CURRENT-STATE.md` | Canonical runtime: apx vs qcefkox vs retired rxhiyd |

You: **support lane**. Completeness = this repo’s PRs + `main`. Deploy = `apxbwdxszmdffbduhjen`. WMG live = operator `wmg-backend` / `Wmsosv2` `main`.

Support sends mail from `bricely@prime-timesystems.com` only when the desk says send. Operator does not email Skip / Jessica / Alisa / Bricely threads. Do not auto-send backend packets. One WMG packet format in `handoffs/BACKEND-REQUESTS/`. Diagnose 200 is not a live widget. Never `db push` / `deploy_edge_function` against `qcefkoxqkfwnlqfmwzmi`.

Stay on the named ticket. Catch-net appends; it does not stand a duplicate (`2e93c665` was the fail). Ticket numbers are a later lift — do not badge UUID prefixes.

---

## File map

See GROK-CONNECT §2. Short:

- Console UI: `src/`
- CS functions: `supabase/functions/`
- WMG copy packets: `handoffs/BACKEND-REQUESTS/`
- Wichita pickup spec: `handoffs/FIX-SELLER-DEFAULT-PICKUP/`
- Ops ledgers: `proofs/OPS-*`
- Customer mail ledger: `proofs/OPS-JESSICA-ALISA-EMAILS/DRAFTS.md`
- Backlog drain: `proofs/OPS-BACKLOG-RETIRE/2026-09-28.md`
- URLs: `config/catch-net-posture.json`

---

## Support triage panel

**https://david-prime2026.github.io/prime-support-triage/**

| Item | Value |
|---|---|
| Host | GitHub Pages |
| Data | apx `support.*` (anon + `Accept-Profile: support`) |
| Approver session | labeled David · email `bricely@prime-timesystems.com` · can Approve / Resolve-notify |
| Operator session | `david@prime-timesystems.com` · desk visible, cannot approve |
| Cursor | `ticket_messages` `channel=admin` `author_role=cursor` |
| WMG customer app | https://wmgos.primetimesystems.ai |

Grok does not Approve or Resolve unless PRIME says. Hard-refresh the console if rows look stale.

REST fallback: `https://apxbwdxszmdffbduhjen.supabase.co/rest/v1/` with `Accept-Profile: support`. Anon key lives with the hosted console / `proofs/OPS-BACKLOG-RETIRE/close.py`. Never qcefkox.

Functions on apx: `intake-ticket`, `bricely-diagnose` (live). `email-intake` **404**. `process-ticket-ai` **500** (model not_found).

---

## Backlog (do not rediscover)

| Ticket | Do |
|---|---|
| `a282b3e2` | **Wait on Jessica.** Prod v7 / `3503e55` shipped. Mailed 12:54Z. Close only when she sees 3636 N Oliver filled |
| `5dc41a1a` | Split-load proof. Alisa example. Draft `r722570217650437097` unsent |
| `08a999c0` | One live `reassign-buyer` success toast |
| `9f2ca521` | Canned widget catch. Later asset dropped `catch{_t=F$`. Reopen only if users hit the loop |
| `87b47aae` `3297801d` `7b807646` `af441aa2` | Done. Skip leftover is product. **Do not email Skip** |
| `2e93c665` | Duplicate. Stay on `a282b3e2` |

CS maturation (not WMG packets): email-intake deploy on apx; process-ticket-ai model; Phase 2 desk (notes / SLA / COs); ticket-number lift.

Mail: Jessica apology **SENT**. Alisa first split-load **SENT**. Alisa waiting-on-example **DRAFT**. Julie how-to hold (Omaha resolved).

---

## Guardrails

- Never qcefkox from this VM.
- Do not email Skip.
- Do not mail Jessica again unless she replies empty or PRIME says send.
- Do not auto-notify backend.
- Do not invent ticket numbers.
- Customer-facing copy: no SLA / billable / contract words.
- Unsure → ask PRIME. Do not tunnel.

---

## Closeout of this DR

Grok is connected when it is on `cursor/jessica-wichita-empty-ac30`, has opened the console, has read `a282b3e2` desk notes, and treats DR-015 + `CONTROL_PLANE.md` as charter — without standing a new lane.
