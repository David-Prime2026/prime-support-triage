# Backend request — delete widget `F$` catch (all-users blocker)

```
Surface: Wmsosv2 only (feat/bricely-embed / BricelyChat / wCe)
Ticket: 9f2ca521
Already live on apxbwdx: bricely-diagnose (Skip five-line LIVE PASS 2026-09-28 night)
Exact change: two edits below. Do not redeploy diagnose. Do not db-push qcefkox.
Proof of done: new WMG JS asset has no catch{_t=F$}; hard-refresh chat never says screenshot / which-screen / specialist wall
Out of scope: Omaha, Wichita, Lane County pricing, Foundry, Gmail, CO PDFs, desk UI, mailing Skip, reassign-buyer, split-load proof
```

**Authority:** PRIME — going to all users. This catch is the remaining production blocker. CS cannot ship it; there is no Wmsosv2 checkout on the support lane.

Copy path for the drop-in: `prime-support-triage` branch `cursor/retire-backlog-current-wmg-ac30` (PR #8)  
`handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts`

Nested `wmg-backend/support-triage` is a freeze. Never `qcefkoxqkfwnlqfmwzmi` schema. Do not email Skip.

---

## Request

Stop live Bricely from falling back to the canned brain when diagnose throws.

1. Replace live `wCe` with the CS drop-in (never throws; failed diagnose returns escalate/ticket).
2. Delete the `BricelyChat` catch that assigns `F$`.
3. Ship Wmsosv2 main / Vercel so all users get the new asset.

Diagnose is already live on `apxbwdxszmdffbduhjen`. Do not spend this ticket on another function deploy.

---

## Audit (2026-09-28 night, live)

| Check | Result |
|---|---|
| `POST …/functions/v1/bricely-diagnose` on `apxbwdxszmdffbduhjen` | **200.** Skip five-line LIVE **PASS** (T1 escalate, T2–T3 hold, T4–T5 search-fail ticket). No “which screen.” |
| Widget already POSTs diagnose | **Yes.** URL derived from intake-ticket (`qk()`). Claude assist skipped when `qk()` is true. |
| Live asset | `https://wmgos.primetimesystems.ai/assets/index-DLShFkGa.js` |
| On diagnose throw | **`catch{_t=F$` still present.** That is canned screenshot / clear-filter / “already with our specialist.” |
| CS lane | No wmg-backend / Wmsosv2 repo. Cannot delete the catch from here. |

Live minified source today:

```js
try {
  qk() ? _t = await wCe({ text, state, newAttachments })
       : _t = F$({ text, state, newAttachments, hostScreen })
} catch {
  _t = F$({ text, state, newAttachments, hostScreen })
}
```

Happy path is already `wCe` when the diagnose URL exists. **The catch is the all-users blocker.** If `wCe` throws, every user gets the old loop that Skip already hit.

Proof CS already ran: `proofs/DR-CS-PLATFORM-008/skip-replay-after-apx-deploy.md`

---

## Recommendations for fix

1. **Copy** `handoffs/DR-CS-PLATFORM-008/embed/wCe.remote.ts` over `src/bricely/wCe.ts` (or the live `wCe` module). Same contract: `{ text, state, newAttachments }` → `{ reply, next, terminal, liveFix? }`. Failed fetch **returns** escalate/ticket — it does **not** throw.
2. **Delete the catch that assigns `F$`.** Keep `F$` only when there is no diagnose URL (`!qk()`, local/dev). Catch must ticket:

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
4. Do **not** point diagnose at `qcefkox` or retired staging `rxhiydtqzmksaeegxyqo`. Prod already uses `apxbwdx` via intake URL.
5. Ship. Hard-refresh `https://wmgos.primetimesystems.ai/` until the JS file is **not** `index-DLShFkGa.js`.
6. Grep the new bundle: `catch{_t=F$` **gone**; `bricely-diagnose` **still present**.

**Proof / close `9f2ca521`:** one real chat (search fail or a thrown diagnose) tickets instead of screenshot / which-screen / specialist wall.

Do not rebuild Omaha, Wichita, pricing period, or Foundry. Do not mail Skip.
