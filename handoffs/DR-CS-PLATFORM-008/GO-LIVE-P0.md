# P0 go-live — one brain before all-users

**Ticket:** `9f2ca521`  
**Why this blocks:** live Bricely still re-asks “which screen” after escalate, and a diagnose throw still dumps the canned screenshot / specialist loop. Do not push that to all users. Do not email Skip.

Two ships. Either you run them, or paste a token here so this CS agent can do **A**. **B** is Wmsosv2 only — this VM cannot touch it.

Never deploy to `qcefkoxqkfwnlqfmwzmi`. Nested `wmg-backend/support-triage` is a freeze — do not deploy diagnose from there.

---

## A. Diagnose function (apxbwdx) — 2 minutes

Live `POST https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose` is **200 but old**. This branch already holds: search-fail auto-ticket, hold-escalate (no how-to / which-screen). Need that code on apx.

### This Cloud Agent window (`/workspace`)

You are already on `cursor/retire-backlog-current-wmg-ac30`. **Do not `cd`.** The Windows `path\to\prime-support-triage` line is not a real path here.

The deploy failed because this VM has no Supabase token. Create one, then in **this** terminal:

```bash
export SUPABASE_ACCESS_TOKEN='sbp_PASTE_HERE'
npx supabase functions deploy bricely-diagnose --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
```

Or paste `SUPABASE_ACCESS_TOKEN=sbp_…` in the chat and this agent runs the deploy.

Token: https://supabase.com/dashboard/account/tokens → Generate new token.

### Prefer: you deploy from a machine already logged into Supabase

Must be **this repo** at `cursor/retire-backlog-current-wmg-ac30` (or `main` after PR #8 merges) — not wmg-backend.

```bat
cd C:\Users\daves\wherever\prime-support-triage
git fetch origin
git checkout cursor/retire-backlog-current-wmg-ac30
git pull origin cursor/retire-backlog-current-wmg-ac30

npx supabase login
npx supabase functions deploy bricely-diagnose --project-ref apxbwdxszmdffbduhjen --no-verify-jwt
```

Dashboard check: https://supabase.com/dashboard/project/apxbwdxszmdffbduhjen/functions  
Confirm `bricely-diagnose` updated just now.

### Or: this CS agent deploys — need a token **in this chat**

Environment secrets do not reach an already-running agent. Paste once here (not GitHub, not the PR):

1. Open https://supabase.com/dashboard/account/tokens
2. **Generate new token**. Name: `cs-cloud-diagnose-deploy`. Copy `sbp_…`
3. Reply in this thread with exactly:

```
SUPABASE_ACCESS_TOKEN=sbp_…
```

4. This agent will: `npx supabase functions deploy bricely-diagnose --project-ref apxbwdxszmdffbduhjen --no-verify-jwt` then rerun Skip’s five lines. Then **revoke the token** on the same tokens page.

Do **not** give a token that can also push schema to `qcefkox`. If the account owns both projects, still only ever pass `--project-ref apxbwdxszmdffbduhjen`.

### Prove A (before widget)

```bat
npm run proof:skip-replay
```

LIVE section must **PASS** (T2–T5 hold / search-fail ticket, never “which screen”). Widget F$ may still FAIL until B.

---

## B. Widget catch (Wmsosv2) — the user-visible catch

Live `index-DLShFkGa.js` today:

```js
try {
  qk() ? _t = await wCe({ text, state, newAttachments })
       : _t = F$({ text, state, newAttachments, hostScreen })
} catch {
  _t = F$({ text, state, newAttachments, hostScreen })
}
```

`qk()` is true when the diagnose URL exists (prod already). Happy path is `wCe`. **On throw, `F$` is the old canned brain.** That is the all-users blocker.

On **wmg-backend / Wmsosv2** (`feat/bricely-embed` or current embed path):

1. Replace `src/bricely/wCe.ts` with  
   `prime-support-triage/handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts`  
   (this revision **does not throw** — failed diagnose returns escalate/ticket).
2. In `BricelyChat`, delete the catch that assigns `F$`. Keep `F$` only when there is **no** diagnose URL (`!qk()`). Catch must ticket, not canned-loop:

```ts
} catch {
  _t = {
    reply:
      "I have enough to get a specialist on this instead of looping. I am opening a ticket with what you already said — you will hear back within 24 hours.",
    next: { ...(state ?? {}), phase: "escalate" },
    terminal: "escalate",
    cardStatus: "In progress",
  };
}
```

3. Keep welcome-name `liveFix` wired.
4. Ship Wmsosv2 **main** / Vercel. Hard-refresh `https://wmgos.primetimesystems.ai/` until the JS asset is **not** `index-DLShFkGa.js`.
5. Search the new bundle: `catch{_t=F$` must be **gone**. `bricely-diagnose` must still be present.

This CS VM has no Wmsosv2 checkout. Backend/embed lane does B.

---

## Done when

| Check | Pass |
|---|---|
| `npm run proof:skip-replay` LIVE | PASS |
| New WMG asset has no `catch{_t=F$` | gone |
| Hard-refresh chat: search fail / escalate | ticket, never screenshot / which-screen / specialist wall |
| Ticket `9f2ca521` | close only after the three above |

Still not this P0: `08a999c0` reassign-buyer, `5dc41a1a` Alisa example.
