# DR-CS-PLATFORM-016 — Grok connect (this lane)

**Connect to branch:** `cursor/jessica-wichita-empty-ac30`  
**Repo:** `David-Prime2026/prime-support-triage`  
**PR:** https://github.com/David-Prime2026/prime-support-triage/pull/9  
**Base stack:** this branch → `cursor/retire-backlog-current-wmg-ac30` (PR #8) → `main`  
**Authority:** PRIME (David Figueroa). This lane is permanent. Do not start a sibling CS lane.

Full method: [`proofs/DR-CS-PLATFORM-016/METHOD.md`](../../proofs/DR-CS-PLATFORM-016/METHOD.md)

---

## 1. Read first (charter)

| What | Where |
|---|---|
| **How you function** | `SUPPORT_SHIP_RULES.md` and `.cursor/rules/support-ship-rules.mdc` — **DR-015**, always on |
| **Live system of record** | `CONTROL_PLANE.md` — newest **IN FORCE** block at the top. Read that before any ticket |
| **Runtime / isolation** | `proofs/DR-CS-PLATFORM-CURRENT-STATE.md` — `apxbwdxszmdffbduhjen` is CS runtime. `qcefkoxqkfwnlqfmwzmi` is WMG OS prod. Never touch qcefkox |
| **Status board** | `STATUS.md` |
| **This connect DR** | this file + `proofs/DR-CS-PLATFORM-016/METHOD.md` |
| **Ticket numbers** | Live `ticket_number` on apx. `proofs/DR-CS-PLATFORM-016/TICKET-NUMBERS.md`. Do not re-apply |
| **Port shape** | `handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md` — tenant two on same apx, not a second project |

You are **support lane**. You are not WMG main, not `qcefkox`, not operator Bricely mail.

---

## 2. Where files live

| Path | What it is |
|---|---|
| `CONTROL_PLANE.md` | Operating memory. Prepend when something is in force. Do not rewrite history below |
| `SUPPORT_SHIP_RULES.md` | Charter. Do not copy under `wmg-backend/support-triage` |
| `src/` | Support **desk / console** (Vite). Live: GitHub Pages |
| `supabase/functions/` | CS edge: `bricely-diagnose`, `intake-ticket`, `process-ticket-ai`, `bricely-thread` — deploy **apx only**. `email-intake` parked |
| `handoffs/BACKEND-REQUESTS/` | WMG packets. Write here. **Do not auto-send to backend** |
| `handoffs/FIX-SELLER-DEFAULT-PICKUP/` | Wichita pickup = send-from location (ticket `a282b3e2`) |
| `handoffs/DR-CS-PLATFORM-008/` | Diagnose / widget go-live (`wCe.remote.ts`) |
| `proofs/` | Ledgers and gates. `OPS-*` is ops truth for that day |
| `proofs/OPS-JESSICA-ALISA-EMAILS/DRAFTS.md` | Customer mail: sent vs draft vs hold |
| `proofs/OPS-BACKLOG-RETIRE/2026-09-28.md` | Graveyard drain. Do not reopen smoke |
| `config/catch-net-posture.json` | Console / intake URLs |
| `quotes/templates/` | Official CO template only |

Nested `wmg-backend/support-triage` is a **freeze**. Completeness is **this repo’s PRs + `main`**.

---

## 3. How you function

1. Read `CONTROL_PLANE.md` top, then the named ticket. Stay on that ticket. Do not open a duplicate.
2. CS code and schema: this repo → `apxbwdxszmdffbduhjen`. Prove HTTP on apx. **Diagnose 200 is not a live widget.**
3. WMG form / embed / WMG functions: operator `wmg-backend` / `Wmsosv2` `main`. You write **one** packet under `handoffs/BACKEND-REQUESTS/`. Desk must say send. Do not mail backend on your own.
4. Mail: Support sends from `bricely@prime-timesystems.com` **only when the desk says send**. Do not ask operator to email Skip, Jessica, Alisa, or Bricely threads. Do not email Skip.
5. Customer language: polite, non-technical. No SLA / billable / contract words.
6. Log work on the ticket (`ticket_messages` channel=`admin`, `author_role`=`cursor`) and in `CONTROL_PLANE.md`.
7. Ticket **numbers** are live on apx as `ticket_number` (`WMG-YYYY-MM-NNN`). Show that column on the desk. UUID stays `id`. Do **not** re-apply SQL from this VM. Do not badge UUID prefixes.
8. Stack git on this lane. Merge CS `main` only. Never merge into `wmg-backend` / `Wmsosv2`.
9. This VM is **git-only**. No `SUPABASE_ACCESS_TOKEN` unless later apx-only for *other* schema. Never a `qcefkox` token.
10. Do **not** wait on `email-intake`. Bricely owns mail. Parked.

**Fail examples:** “pull WMG main to get diagnose.” “merge CS into wmg-backend so it is live.” “widget is live because diagnose returned 200.” Six sibling draft PRs as the copy path. Looking in retired branches for a live customer ticket.

---

## 4. Support triage panel

**Console (live):** https://david-prime2026.github.io/prime-support-triage/

- Hosted GH Pages, wired to **apx** (`support` schema).
- Session picker: **Approver** (David / `bricely@prime-timesystems.com`) can Approve / Resolve-notify. **Operator** (`david@prime-timesystems.com`) sees the desk, cannot approve.
- Grok uses the **Cursor desk** on a ticket (internal notes, `@cursor` / `@eng` / `@hitl`). That is not customer chat.
- Filter Awaiting / All. Hard-refresh the console if the list looks stale.
- **Do not Approve or Resolve** unless PRIME says so.

**If the Pages UI is down**, same data via PostgREST on apx:

- Base: `https://apxbwdxszmdffbduhjen.supabase.co/rest/v1/`
- Headers: `Accept-Profile: support`, `Content-Profile: support`, apikey = console anon (see `proofs/OPS-BACKLOG-RETIRE/close.py`).
- Tables: `support_tickets`, `ticket_messages`, `ticket_events`.
- Never qcefkox.

**WMG app (customer):** https://wmgos.primetimesystems.ai — Jessica New Portal lives here. You cannot deploy it from this repo.

**Intake:** `https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/intake-ticket`  
**Diagnose:** `…/functions/v1/bricely-diagnose`  
**email-intake:** **parked.** Bricely already owns mail. Do not wait on it. Catch-net must **append** the existing ticket, not stand a new one. Desk shows `ticket_number` (Jessica = `WMG-2026-09-039`).

---

## 5. Backlog you must understand

Do not rediscover Omaha, Lane County pricing, Foundry, or release-09.

| Ticket | State | What to do |
|---|---|---|
| **`a282b3e2`** | **resolved** 2026-09-30 PRIME | Wichita pickup. Do not reopen |
| **`5dc41a1a`** | Open — code live | Split-load store pickup. Waiting Alisa example. Follow-up **DRAFT** `r722570217650437097` — send only if desk says |
| **`08a999c0`** | Open — unproven live | `reassign-buyer` drop-in in `handoffs/BACKEND-REQUESTS/reassign-buyer/`. Needs one success toast, not “Edge Function..” |
| **`9f2ca521`** | Open / likely overtaken | Widget canned `F$` catch. Later live asset `index-ByANBu2q.js` had no `catch{_t=F$`. Do not re-litigate unless a user hits canned loop |
| **`87b47aae`** | **resolved** | Omaha Portals / Julie. Do not rebuild |
| **`3297801d` `7b807646`** | **resolved** | Skip leftover is **product** (pricing period + location search). **Do not email Skip** |
| **`af441aa2`** | **resolved** | Foundry / Middle TN — ops data |
| **`2e93c665`** | closed duplicate | Wrong catch-net of Jessica follow-up. Folded into `a282b3e2` |

Graveyard: `proofs/OPS-BACKLOG-RETIRE/2026-09-28.md`. Smoke / OPEN-TEST / DR proofs are retired.

**CS holes (this repo, not WMG packets):** desk must show live `ticket_number`; `process-ticket-ai` 500 (Anthropic model not_found). `email-intake` parked (Bricely owns mail). Port shape: `handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md`.

**Mail ledger:** `proofs/OPS-JESSICA-ALISA-EMAILS/DRAFTS.md`

**People**

| Who | Address | Rule |
|---|---|---|
| PRIME / David | david@prime-timesystems.com | Desk. Copy on customer mail when he says |
| Alisa | alisa@wilsonmarketing.com | Ops. Copy when desk says. Not default on pricing COs |
| Jessica | jwallace@goodwillks.org | Wichita. Ticket `a282b3e2`. Already mailed 12:54Z |
| Skip | skip@wilsonmarketing.com | Pricing executor only. **Do not email** |
| Bricely | bricely@prime-timesystems.com | Designated support from. Support sends |

---

## 6. First moves on connect

1. Checkout `cursor/jessica-wichita-empty-ac30`. Pull.
2. Read `CONTROL_PLANE.md` (top) + this file + `handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md`.
3. Open the console. Tickets show `ticket_number` (Jessica `a282b3e2` = `WMG-2026-09-039`, **resolved**). UUID stays `id`.
4. Do **not** re-apply numbering SQL. Do **not** put a token on this VM for that apply.
5. Do **not** mail Jessica again unless she writes, or PRIME says send.
6. Do **not** wait on `email-intake`. Next unsent draft: Alisa split-load example (desk must say send).
