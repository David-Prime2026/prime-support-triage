# P0 go-live — one brain before all-users

**Ticket:** `9f2ca521`  
**A DONE 2026-09-28.** `bricely-diagnose` is live on `apxbwdxszmdffbduhjen`. Skip five-line LIVE **PASS** (no which-screen).  
**B still blocks all-users.** Live widget `index-DLShFkGa.js` still has `catch{_t=F$}`. Wmsosv2 only.

Never deploy to `qcefkoxqkfwnlqfmwzmi`. Nested `wmg-backend/support-triage` is a freeze.

---

## A. Diagnose function — **DONE**

Deployed from this CS repo to `apxbwdxszmdffbduhjen` only. Proof: `proofs/DR-CS-PLATFORM-008/skip-replay-after-apx-deploy.md`

Revoke the scoped token after you are done deploying CS functions: https://supabase.com/dashboard/account/tokens

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
| `npm run proof:skip-replay` LIVE | **PASS** (A done) |
| New WMG asset has no `catch{_t=F$` | gone |
| Hard-refresh chat: search fail / escalate | ticket, never screenshot / which-screen / specialist wall |
| Ticket `9f2ca521` | close only after the three above |

Still not this P0: `08a999c0` reassign-buyer, `5dc41a1a` Alisa example.
