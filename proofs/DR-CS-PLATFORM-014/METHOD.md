# DR-CS-PLATFORM-014 — Execute Omaha portal invites + GWKS pickup prefill

**Status:** READY FOR THE WMG LANE  
**Date:** 2026-09-25  
**Authority:** PRIME — “provide a DR for the other lane to execute 1 and 2 properly”  
**This CS lane:** Bricely diagnosis is committed/pushed (PR #4). Do **not** redo diagnose here.  
**Your lane:** WMG OS operator + wmg-backend / Wmsosv2. You have the session this CS VM does not.

**Runtime:** live WMG `wmgos.primetimesystems.ai` · functions/intake already on `apxbwdxszmdffbduhjen`  
**Never** `db push` / schema deploy / autonomous merge to `qcefkoxqkfwnlqfmwzmi`.

## Why this DR

Customers are waiting. Bricely filed tickets and then stalled.

| # | Customer | What is true | What you do |
|---|---|---|---|
| **1** | Goodwill Omaha / Julie Chandler | Portals + CRM contacts already exist | Invite / revoke **today** |
| **2** | Goodwill KS / Jessica Wallace | CRM default pickup is **set**; New Portal ignores it | Prefill the seller form from that default |

Do not write a change-order. Do not tell Alisa it is impossible. Do not email a shared password.

## Sequencing

| Stage | What | Done when |
|-------|------|-----------|
| **1** | Omaha roster on Portals | Prove table below; ticket `87b47aae` closed |
| **2** | Wichita pickup + hours prefill | Jessica (or Alisa-as-Jessica) opens New Portal and both fields are filled; ticket `a282b3e2` closed |

## Guardrails

- Augment only — no Bricely rewrite on this DR  
- Invite emails a set-password link — never send `Omaha!` or any shared password  
- Hold `accounting@` and `roc@`  
- Staging/Vercel for Stage 2 first if you cannot prove on a preview; PRIME promotes  
- Unsure → stop and ask PRIME  
