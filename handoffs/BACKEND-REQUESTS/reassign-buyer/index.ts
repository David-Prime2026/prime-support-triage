import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Drop-in for WMG `reassign-buyer` (ticket 08a999c0).
 * Deploy on the same project as allocate-load / deallocate-buyer — not apxbwdx.
 * Never qcefkox schema push from the CS repo; function deploy is operator WMG.
 *
 * Live client: { load_id, new_buyer_account_id, reason }
 * → { load, sales_memo, compose_context } or { error } (JSON, not a raw 500).
 *
 * Implementation: deallocate then allocate (the two functions the UI already uses).
 * That is the replace path; crashing here is what Alisa saw as "Edge Function..".
 */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function invokeSibling(name: string, body: Record<string, unknown>, auth: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? auth;
  if (!url) throw new Error("SUPABASE_URL missing");
  const res = await fetch(`${url}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || typeof data.error === "string") {
    throw new Error(String(data.error ?? `${name} HTTP ${res.status}`));
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const loadId = String(body.load_id ?? "").trim();
    const newBuyer = String(body.new_buyer_account_id ?? "").trim();
    const reason = String(body.reason ?? "").trim();
    if (!loadId || !newBuyer) {
      return json({ error: "load_id and new_buyer_account_id are required" }, 400);
    }
    if (!reason) {
      return json({ error: "A reason is required for buyer replacement." }, 400);
    }

    const auth = req.headers.get("Authorization") ?? "";
    await invokeSibling("deallocate-buyer", { load_id: loadId, reason }, auth);
    const allocated = await invokeSibling(
      "allocate-load",
      { load_id: loadId, buyer_account_id: newBuyer },
      auth,
    );
    return json({
      ok: true,
      load: allocated.load ?? null,
      sales_memo: allocated.sales_memo ?? null,
      compose_context: allocated.compose_context ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return json({ error: message }, 200);
  }
});
