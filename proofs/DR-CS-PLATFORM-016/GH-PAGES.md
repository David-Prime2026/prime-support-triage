# GitHub Pages — hosted console

**Authority:** PRIME 2026-10-01 — Pages does **not** rebuild from `main`.  
**Hosted source:** branch `gh-pages`  
**Live URL:** https://david-prime2026.github.io/prime-support-triage/

## What is already on `main`

| Item | State |
|---|---|
| Stack | On CS `main`. Nothing else to merge from the jessica / #9 lane |
| #8 | Merged |
| #9 | Closed when its base branch was deleted |
| Desk UI | [#11](https://github.com/David-Prime2026/prime-support-triage/pull/11) · `4099360` on `main` |
| Desk code | List / Find / detail read `ticket_number` |
| Token / SQL / mail | No token. No SQL re-apply. No mail |
| Alisa split-load draft | Unsent until PRIME says send |
| Drafts #1–#6, #10 | Left alone |

## Hole

apx already has `ticket_number` (`WMG-2026-09-039` on Jessica).  
`main` already has the desk UI.  
The hosted console was on **21 Sep 2026** `f467613` until this lane rebuilt it. Now `332950f` (2026-10-01).

Default Vite build URL without `.env.production.local` is retired `rxhiyd`. Build **must** pin:

```
VITE_SUPABASE_URL=https://apxbwdxszmdffbduhjen.supabase.co
VITE_SUPABASE_ANON_KEY=<apx anon already on the live console / proofs/OPS-BACKLOG-RETIRE/close.py>
```

Never `qcefkox`. Do not commit `.env.production.local`. Anon is the public console key, not a CLI token.

## Rebuild (this VM)

```bash
# gitignored overlay — apx only
npm run build
# copy dist/ onto gh-pages worktree, commit, push origin gh-pages
```

## Shipped 2026-10-01

| Check | Result |
|---|---|
| `gh-pages` commit | `332950f` — Deploy desk ticket_number from main 4099360 |
| Pages build | `built` 2026-10-01 02:31:55Z |
| Live HTML (after cache miss) | `index-Dsjhl9ii.js` + `index-C07LHg-J.css` |
| Previous | `index-Cvdzr8Q4.js` (21 Sep `f467613`) |
| Baked URL | `https://apxbwdxszmdffbduhjen.supabase.co` only |
| Bundle | contains `ticket_number` and `WMG-2026-09-039` |
| Token / SQL / mail | none |

Hard-refresh https://david-prime2026.github.io/prime-support-triage/ if the old HTML is still cached (`max-age=600`).
