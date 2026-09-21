import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-intake-secret, x-client-id",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function service() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { db: { schema: "support" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const secret = Deno.env.get("INTAKE_HMAC_SECRET");
    if (secret) {
      const provided = req.headers.get("x-intake-secret") ?? "";
      if (provided !== secret) return json({ error: "Unauthorized intake" }, 401);
    }

    const body = await req.json();
    const clientId = String(body.client_id ?? req.headers.get("x-client-id") ?? "").trim();
    const rawMessage = String(body.message ?? body.raw_message ?? "").trim();
    const source = String(body.source_channel ?? "widget").trim();
    if (!clientId || !rawMessage) {
      return json({ error: "client_id and message are required" }, 400);
    }
    if (!["widget", "email", "manual"].includes(source)) {
      return json({ error: "invalid source_channel" }, 400);
    }

    const sb = service();
    const { data: client, error: clientErr } = await sb
      .from("clients")
      .select("id, status")
      .eq("id", clientId)
      .maybeSingle();
    if (clientErr) throw clientErr;
    if (!client || client.status !== "active") {
      return json({ error: "Unknown or inactive client" }, 404);
    }

    const diagnosis = body.diagnosis ? String(body.diagnosis).trim() : null;
    const surface = body.surface ? String(body.surface).trim() : null;
    const attachmentPayload = Array.isArray(body.attachments) ? body.attachments : [];
    const isMock = Boolean(body.is_mock);
    const threadId = body.thread_id ? String(body.thread_id).trim() : null;

    const pageContextRaw = body.page_context;
    const pageContext =
      pageContextRaw && typeof pageContextRaw === "object"
        ? {
            screen_id:
              typeof (pageContextRaw as { screen_id?: unknown }).screen_id === "string"
                ? String((pageContextRaw as { screen_id: string }).screen_id).trim() || null
                : null,
            screen_label:
              typeof (pageContextRaw as { screen_label?: unknown }).screen_label === "string"
                ? String((pageContextRaw as { screen_label: string }).screen_label).trim() || null
                : null,
          }
        : null;

    const overrideBase =
      body.human_override && typeof body.human_override === "object"
        ? { ...(body.human_override as Record<string, unknown>) }
        : {};
    if (pageContext && (pageContext.screen_id || pageContext.screen_label)) {
      overrideBase.page_context = pageContext;
    }
    if (isMock) {
      overrideBase.mock = true;
      overrideBase.isolation = "no_customer_contact";
    }
    const humanOverride = Object.keys(overrideBase).length ? overrideBase : null;

    const { data: ticket, error } = await sb
      .from("support_tickets")
      .insert({
        client_id: clientId,
        requester_name: body.requester_name ?? null,
        requester_email: body.requester_email ?? null,
        source_channel: source,
        raw_message: rawMessage,
        attachments: attachmentPayload,
        linked_account: body.linked_account ?? null,
        diagnosis_summary: diagnosis,
        surface,
        priority: body.priority ?? "P3",
        escalation_flag: Boolean(diagnosis),
        status: "awaiting_approval",
        is_mock: isMock,
        human_override: humanOverride,
      })
      .select("*")
      .single();
    if (error) throw error;

    if (threadId) {
      await sb
        .from("bricely_threads")
        .update({ open_ticket_id: ticket.id, updated_at: new Date().toISOString() })
        .eq("id", threadId);
    }

    await sb.from("ticket_messages").insert({
      ticket_id: ticket.id,
      client_id: clientId,
      author_role: "customer",
      channel: source === "email" ? "email" : "widget",
      body: rawMessage,
    });
    if (diagnosis) {
      await sb.from("ticket_messages").insert({
        ticket_id: ticket.id,
        client_id: clientId,
        author_role: "bricely",
        channel: "system",
        body: `Diagnostic context: ${diagnosis}`,
      });
    }

    for (const att of attachmentPayload) {
      const fileName = String(att?.name ?? att?.file_name ?? "attachment");
      const kindRaw = String(att?.kind ?? att?.file_type ?? "other");
      const fileType = ["image", "pdf", "other"].includes(kindRaw) ? kindRaw : "other";
      await sb.from("ticket_attachments").insert({
        ticket_id: ticket.id,
        client_id: clientId,
        file_type: fileType,
        file_name: fileName,
        storage_ref: att?.storage_ref ?? null,
        vision_analysis_summary: att?.vision_summary ?? att?.vision_analysis_summary ?? null,
        uploaded_by: body.requester_email ?? body.requester_name ?? "widget",
      });
    }

    await sb.rpc("log_ticket_event", {
      p_ticket_id: ticket.id,
      p_event_type: "ticket_created",
      p_actor: "system",
      p_payload: {
        source_channel: source,
        has_diagnosis: Boolean(diagnosis),
        attachment_count: attachmentPayload.length,
        page_context: pageContext,
      },
    });
    // Fire-and-forget AI pipeline
    const base = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    fetch(`${base}/functions/v1/process-ticket-ai`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ticket_id: ticket.id }),
    }).catch((err) => console.warn("[intake-ticket] process-ticket-ai invoke failed", err));

    return json({ ok: true, ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: message }, 500);
  }
});
