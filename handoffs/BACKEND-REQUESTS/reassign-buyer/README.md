# reassign-buyer — stop the generic Edge Function error

**Ticket:** `08a999c0`  
**Surface:** qcefkox function `reassign-buyer` + Wmsosv2 caller  
**PRIME:** fix push 2026-09-28. Never schema-push from CS. This file is the copy path.

Live UI already calls:

```
pt.functions.invoke("reassign-buyer", {
  body: { load_id, new_buyer_account_id, reason }
})
```

Success shape used by the client: `{ load, sales_memo, compose_context }`.  
Alisa saw **“Edge Function..”** — that is Supabase `FunctionsHttpError.message` when the function returns non-2xx. The live caller does **not** use `pu()` (unlike `set-load-memo-rate`), so she never sees the real `{ error }`.

## Exact change

### 1. Function (qcefkox) — never 500 on a handled miss

Copy `index.ts` in this folder over `supabase/functions/reassign-buyer` on **wmg-backend**, then:

```
npx supabase functions deploy reassign-buyer --project-ref <WMG_FUNCTIONS_REF> --no-verify-jwt
```

Use the same project the live app already uses for `allocate-load` / `deallocate-buyer` / `split-load`. **Not** `apxbwdx`. **Never** a CS-repo deploy from this VM.

The drop-in:
- 400 JSON `{ error }` for bad input (not 500)
- refuses same-buyer no-op
- calls existing deallocate + allocate (or your current replace RPC) inside try/catch and returns `{ error: message }` on failure
- always CORS

If your current function already replaces the buyer, keep that body and **only** wrap throws as JSON. Do not invent a new load schema.

### 2. Client one-liner (Wmsosv2)

Where `reassign-buyer` is invoked, use the same `pu()` helper as memo rate:

```
Ie.error(await pu(He, Oe) ?? "Failed to replace buyer.");
```

### Proof

Replace buyer on one load. Toast is `Buyer replaced — new memo …` or a **specific** error (not “Edge Function”). Then close `08a999c0`.
