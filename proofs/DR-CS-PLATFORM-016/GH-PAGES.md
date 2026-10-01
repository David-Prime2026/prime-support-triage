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
The **hosted** console stays on the last `gh-pages` push (**21 Sep 2026**, `f467613`) until CS rebuilds with apx `VITE_SUPABASE_*` and pushes `gh-pages`.

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

Proof after push: live `index.html` asset hash changes from `index-Cvdzr8Q4.js` (21 Sep), and the new JS contains `WMG-2026-09-039` / `ticket_number`. Live JS must contain `apxbwdxszmdffbduhjen` and must not contain `qcefkoxqkfwnlqfmwzmi`.
