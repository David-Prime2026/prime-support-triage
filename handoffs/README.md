## Asking operator (WMG work)

Only if the change needs WMG schema, a WMG edge function, or the live Wmsosv2 embed.

One packet. Path: `BACKEND-REQUESTS/<NAME>.md` — see [`BACKEND-REQUESTS/README.md`](./BACKEND-REQUESTS/README.md).

# Handoff A — external quoting packages

Emit from the Change-order board (**Emit Handoff A**).

Writes **JSON (canonical) + CSV (flattened)** for the external quoting platform.

- Hours-forward; scope included.
- Internal value estimate labeled **"not the quote"**.
- Drop downloaded files here (or send to the quoting tool).

Return trip: set decision = accepted + external_quote_id → Approve for build (Handoff B).
