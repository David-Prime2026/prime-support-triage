import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key, { db: { schema: "support" } });
    const body = await req.json();
    const ticketId = body.ticket_id as string;
    const newLane = body.new_lane as string;
    const by = String(body.by ?? "operator");
    const reason = String(body.reason ?? "").trim();

    if (!ticketId || !newLane) return json({ error: "ticket_id and new_lane required" }, 400);
    if (!["auto_resolve", "needs_approval", "billable", "ambiguous"].includes(newLane)) {
      return json({ error: "invalid new_lane" }, 400);
    }

    const { data: ticket } = await sb.from("support_tickets").select("*").eq("id", ticketId).single();
    if (!ticket) return json({ error: "not found" }, 404);

    const override = {
      original_lane: ticket.ai_lane,
      new_lane: newLane,
      by,
      reason,
      at: new Date().toISOString(),
    };

    const status =
      newLane === "billable"
        ? "billable_review"
        : newLane === "auto_resolve"
        ? "awaiting_approval" // still requires allowlist execution path — do not silent auto
        : "awaiting_approval";

    await sb
      .from("support_tickets")
      .update({
        ai_lane: newLane,
        human_override: override,
        status,
        ai_billable: newLane === "billable" ? true : ticket.ai_billable,
      })
      .eq("id", ticketId);

    await sb.rpc("log_ticket_event", {
      p_ticket_id: ticketId,
      p_event_type: "human_override",
      p_actor: "operator",
      p_payload: override,
    });

    return json({ ok: true, override, note: "Override stored as training signal. auto_resolve override does not execute without re-run through allowlist pipeline." });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
