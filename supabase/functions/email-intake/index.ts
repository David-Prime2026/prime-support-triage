import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Email intake STUB.
 * Wire to SendGrid Inbound Parse (or similar): map envelope → client_id via
 * recipient alias (e.g. wmg-os@support.primetimesystems.ai), then create ticket.
 * Does not auto-classify beyond calling process-ticket-ai.
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

const ALIAS_TO_CLIENT: Record<string, string> = {
  "wmg-os@support.primetimesystems.ai": "a1000001-0001-4001-8001-000000000001",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let to = "";
    let from = "";
    let subject = "";
    let text = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      to = String(body.to ?? "");
      from = String(body.from ?? "");
      subject = String(body.subject ?? "");
      text = String(body.text ?? body.message ?? "");
    } else {
      const form = await req.formData();
      to = String(form.get("to") ?? "");
      from = String(form.get("from") ?? "");
      subject = String(form.get("subject") ?? "");
      text = String(form.get("text") ?? form.get("html") ?? "");
    }

    const alias = Object.keys(ALIAS_TO_CLIENT).find((a) =>
      to.toLowerCase().includes(a.toLowerCase()),
    );
    const clientId = alias ? ALIAS_TO_CLIENT[alias] : null;
    if (!clientId) {
      return json({ error: "Unknown support alias — stub map needs client", to }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const message = [subject && `Subject: ${subject}`, text].filter(Boolean).join("\n\n");

    const res = await fetch(`${url}/functions/v1/intake-ticket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
        ...(Deno.env.get("INTAKE_HMAC_SECRET")
          ? { "x-intake-secret": Deno.env.get("INTAKE_HMAC_SECRET")! }
          : {}),
      },
      body: JSON.stringify({
        client_id: clientId,
        source_channel: "email",
        message,
        requester_email: from,
        requester_name: from.split("@")[0],
      }),
    });
    const data = await res.json();
    return json({ ok: res.ok, stub: true, upstream: data }, res.ok ? 200 : 500);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
