# Goodwill Omaha — primary contacts / portal access

**Yes, this is possible today.** Do not wait on a change order. Use Portals + CRM contacts.

| | |
|---|---|
| Customer | Julie Chandler `<jchandler@goodwillomaha.org>` via Alisa 2026-09-23 |
| Ticket | `87b47aae-caf0-4b1b-88ea-a718415735a4` |
| Prior miss | `f206e13f` — Bricely only captured the email and mixed in Wichita |
| Related | `6b27e0c2` multi-employee logins (general) |

## Roster (execute)

| Access | Role in `invite-portal-user` | People |
|---|---|---|
| **Remove** | revoke / delete portal invite | `mchowdhury@goodwillomaha.org` |
| **Full** (accounting, loads, overview) | `principal` | Ryan `rgale@goodwillomaha.org` · Dakota `dpierce@goodwillomaha.org` · Chris `ctrautman@goodwillomaha.org` |
| **Partial** (load request + load history) | `seller` | Julie `jchandler@goodwillomaha.org` · Melissa `meanderson@goodwillomaha.org` |
| **Hold** | — | `accounting@goodwillomaha.org` · `roc@goodwillomaha.org` (shared inboxes — Julie said later) |

## Operator path (WMG internal)

1. Seller Accounts → Goodwill Omaha → add/update CRM contacts (`upsert_seller_account_contact`). Mark one operations contact `is_primary` if Julie wants a primary on the account card (Chris or Ryan).
2. Portals → invite each contact: `{ contact_id, portal_type: "seller", contact_role }` via `invite-portal-user`.
3. Invite emails them a set-password link. **Do not email a shared password.**
4. Remove Chowdhury’s invite / contact.

Live UI already does this (`NOe` Portals queue). Default role in that screen is `distribution` — change Full people to **principal** before inviting.

This VM has no WMG OS session, so the clicks have to happen on `wmgos.primetimesystems.ai` as an operator. Never `db-push` to `qcefkoxqkfwnlqfmwzmi`.
