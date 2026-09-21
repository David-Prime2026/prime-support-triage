# Outbox for Cursor staging (DR-013)

**Command plane:** Cursor chat / `node scripts/sync-cursor-outbox.mjs`  
**SoR:** `support.cursor_staging_outbox` on apx  
**Repo artifacts:** this folder (synced from apx — not browser downloads)

## Flow
1. Approver **Approve → record** or **Queue to Cursor outbox** in console  
2. Row lands in apx `cursor_staging_outbox` (`pending`)  
3. Cursor/operator runs sync → JSON written here  
4. Claim / Complete in console **Cursor outbox** module  
5. Human still owns promote — never auto `qcefkox`

## Guardrails
- `target_environment = WMG_OS_STAGING`
- `production_ref_forbidden = qcefkoxqkfwnlqfmwzmi`
- Never auto-merge / never target production
