# DR-014 — other-lane execute card

Copy this into the WMG lane. Work from `C:\Users\daves\wmg-backend` and live WMG as an operator.

Source CS PR (diagnosis already pushed — do not re-implement):  
https://github.com/David-Prime2026/prime-support-triage/pull/4

Drop-in for Stage 2: `handoffs/FIX-SELLER-DEFAULT-PICKUP/seller-portal-prefill.ts` on that PR.

---

## Stage 1 — Omaha portal access (do this first)

**Ticket:** `87b47aae-caf0-4b1b-88ea-a718415735a4`  
**Prior miss:** `f206e13f` (Bricely only kept the email)

### Path

1. Sign in to https://wmgos.primetimesystems.ai as ops (Alisa or PRIME).
2. **Seller Accounts** → Goodwill Omaha (goodwillomaha.org).
3. Add/update CRM contacts (`upsert_seller_account_contact`) for anyone missing.
4. **Portals** → invite each contact via `invite-portal-user`:
   `{ contact_id, portal_type: "seller", contact_role, full_name }`
5. Default role on that screen is `distribution`. Change it **before** invite.

### Roster (exact)

| Action | `contact_role` | Name | Email |
|---|---|---|---|
| **Revoke** | — | Chowdhury | mchowdhury@goodwillomaha.org |
| **Invite** | `principal` | Ryan | rgale@goodwillomaha.org |
| **Invite** | `principal` | Dakota | dpierce@goodwillomaha.org |
| **Invite** | `principal` | Chris | ctrautman@goodwillomaha.org |
| **Invite** | `seller` | Julie | jchandler@goodwillomaha.org |
| **Invite** | `seller` | Melissa | meanderson@goodwillomaha.org |
| **Do not invite** | — | shared | accounting@goodwillomaha.org |
| **Do not invite** | — | shared | roc@goodwillomaha.org |

`principal` = full portal (accounting, loads, overview).  
`seller` = load request + load history.

Invite sends the set-password email. Copy the `action_link` if they say it is in spam.  
**Do not** email a password.

### Stage 1 GATE

- [ ] Chowdhury has no portal access  
- [ ] Ryan, Dakota, Chris invited as `principal`  
- [ ] Julie, Melissa invited as `seller`  
- [ ] accounting@ and roc@ untouched  
- [ ] Note on ticket `87b47aae` + close it  
- [ ] Desk note: who invited, timestamps  

If a contact is missing on the seller, create it first (`p_first_name`, `p_email`, `p_contact_lane: "operations"`, `p_is_primary` only if Julie named a primary — use Chris or Ryan, not Julie).

---

## Stage 2 — GW Wichita pickup prefill

**Tickets:** `a282b3e2-ce6d-4e59-a718-0fff3992ab13` · note `c283c80a`  
**Seller:** Goodwill KS · Jessica Wallace `jwallace@goodwillks.org`  
**Values already on the account (Alisa set them; form ignores them):**

- Pickup: `3636 N Oliver Wichita KS`  
- Notes / hours: `SHIPPING HOURS 8AM-2PM`

### Root cause (do not rediscover)

Live seller form (`GCe` in `index-Bo-k3d31.js`) starts pickup + notes at `""`.  
`get-seller-portal-context` returns commodity + confirmation-email defaults only.  
`default_pickup_location` is used on the seller **card**, not this form.  
Internal create recalls `list_seller_pickup_locations`; seller portal does not.

### Code (wmg-backend / Wmsosv2 — `feat/bricely-dr011-prediagnosis` or current embed branch)

1. **`get-seller-portal-context`**  
   After the seller row loads, return:

   ```
   default_pickup_location
   last_pickup_location
   default_shipping_hours
   last_notes
   ```

   Use `handoffs/FIX-SELLER-DEFAULT-PICKUP/seller-portal-prefill.ts` → `attachPickupDefaults`.

2. **Seller load-request form**  
   Pickup state and notes state must init from context, and **reset after submit must reload those defaults** (not `""`).

   ```
   pickup = default_pickup_location || last_pickup_location
   notes  = default_shipping_hours → "SHIPPING HOURS …"  else last_notes
   ```

3. Confirm Goodwill KS row still has `3636 N Oliver Wichita KS`. If hours have no column, keep them in notes / `last_notes`.

4. Deploy **WMG Vercel** (preview first if you cannot prove on prod).  
   **No** `qcefkox` schema push. This is function + embed only.

### Stage 2 GATE

- [ ] Open New Portal as Jessica (or Alisa-as-Jessica)  
- [ ] Pickup already shows `3636 N Oliver Wichita KS`  
- [ ] Notes already show `SHIPPING HOURS 8AM-2PM`  
- [ ] Submit still works; next open still prefills  
- [ ] Other sellers unchanged unless they have a default  
- [ ] Close `a282b3e2` with the bake URL / screenshot  

Jessica should not type those two fields again.

---

## Out of scope for this DR

- Deploying `bricely-diagnose` (CS lane already pushed that — see `handoffs/DR-CS-PLATFORM-008/PUSH-FROM-WMG-BACKEND.md`, target **`apxbwdxszmdffbduhjen`**)  
- Shared Omaha inboxes  
- Split-load pickup ticket `5dc41a1a`  
- Any WMG OS prod migration  

## If you get stuck

Stop. Post the error on the ticket. Do not invent a password. Do not file another “is this possible?” ticket.
