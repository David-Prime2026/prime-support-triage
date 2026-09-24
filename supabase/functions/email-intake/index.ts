import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  ALIAS_TO_CLIENT,
  WMG_CLIENT_ID,
  clientIdForRecipient,
  parseFrom,
  isCoNotifyType,
  coWaitingSubject,
  coWaitingBody,
  coApprovedSubject,
  coApprovedBody,
  waitingCc,
  approvedCc,
  canAttachExecutedPdf,
  missingExecutionStamps,
  OFFICIAL_QUOTE_TEMPLATE,
  type CoWaitingPayload,
  type CoApprovedPayload,
} from "../_shared/bricelyMail.ts";

/**
 * Bricely designated email intake + change-order notify.
 * Inbound: Gmail / SendGrid / Apps Script POST → ticket on this triage project.
 * Outbound trigger from WMG: type CHANGE ORDER WAITING FOR APPROVAL | CHANGE ORDER APPROVED.
 * Never pointed at WMG OS prod.
 */
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-intake-secret",
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

function requireHmac(req: Request): Response | null {
  const secret = Deno.env.get("INTAKE_HMAC_SECRET");
  if (!secret) return null;
  const provided = req.headers.get("x-intake-secret") ?? "";
  if (provided !== secret) return json({ error: "Unauthorized intake" }, 401);
  return null;
}

async function findTicketByThread(threadId: string) {
  if (!threadId) return null;
  const sb = service();
  const { data } = await sb
    .from("support_tickets")
    .select("id, status, human_override")
    .eq("source_channel", "email")
    .order("created_at", { ascending: false })
    .limit(80);
  return (
    (data ?? []).find((t) => {
      const ov = (t.human_override ?? {}) as { email_thread_id?: string };
      return ov.email_thread_id === threadId;
    }) ?? null
  );
}

async function callIntake(payload: Record<string, unknown>) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

function queueMail(kind: string, to: string[], cc: string[], subject: string, body: string, extra: Record<string, unknown>) {
  const item = {
    kind,
    from: "bricely@prime-timesystems.com",
    to,
    cc,
    subject,
    body,
    created_at: new Date().toISOString(),
    ...extra,
  };
  console.log("[bricely-mail-outbox]", JSON.stringify({ kind, to, subject }));
  return item;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const denied = requireHmac(req);
  if (denied) return denied;

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, unknown> = {};
    if (contentType.includes("application/json")) {
      body = (await req.json()) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      body = {
        to: String(form.get("to") ?? ""),
        from: String(form.get("from") ?? ""),
        subject: String(form.get("subject") ?? ""),
        text: String(form.get("text") ?? form.get("html") ?? ""),
        thread_id: String(form.get("thread_id") ?? form.get("In-Reply-To") ?? ""),
      };
    }

    const notifyType = body.type ?? body.event ?? body.payload_type;
    if (isCoNotifyType(notifyType)) {
      if (notifyType === "CHANGE ORDER WAITING FOR APPROVAL") {
        const p = body as unknown as CoWaitingPayload;
        if (!p.change_order_id || !p.title || !p.to?.length) {
          return json({ error: "change_order_id, title, to required" }, 400);
        }
        const queued = queueMail(
          notifyType,
          p.to,
          waitingCc(p.cc),
          coWaitingSubject(p),
          coWaitingBody(p),
          {
            change_order_id: p.change_order_id,
            quote_id: p.quote_id ?? null,
            attach_pdf: false,
            template: OFFICIAL_QUOTE_TEMPLATE,
          },
        );
        return json({ ok: true, queued: true, notify: notifyType, attach_pdf: false, mail: queued });
      }
      const p = body as unknown as CoApprovedPayload;
      if (!p.change_order_id || !p.title || !p.to?.length) {
        return json({ error: "change_order_id, title, to required" }, 400);
      }
      if (!canAttachExecutedPdf(p)) {
        return json({
          error: "CO PDF cannot be sent until after execution",
          missing: missingExecutionStamps(p),
          attach_pdf: false,
          required: ["customer_accepted_at", "prime_send_approved_at", "prime_send_approved_by"],
        }, 409);
      }
      const queued = queueMail(
        notifyType,
        p.to,
        approvedCc(p.cc),
        coApprovedSubject(p),
        coApprovedBody(p),
        {
          change_order_id: p.change_order_id,
          attach_pdf: true,
          template: OFFICIAL_QUOTE_TEMPLATE,
          customer_accepted_at: p.customer_accepted_at,
          customer_accepted_by: p.customer_accepted_by ?? p.approver_name ?? null,
          prime_send_approved_at: p.prime_send_approved_at,
          prime_send_approved_by: p.prime_send_approved_by,
        },
      );
      return json({ ok: true, queued: true, notify: notifyType, attach_pdf: true, mail: queued });
    }

    const to = String(body.to ?? body.recipient ?? "bricely@prime-timesystems.com");
    const fromRaw = String(body.from ?? body.sender ?? "");
    const subject = String(body.subject ?? "");
    const text = String(body.text ?? body.message ?? body.raw_message ?? "");
    const threadId = String(body.thread_id ?? body.email_thread_id ?? body.in_reply_to ?? "").trim();
    const messageId = String(body.message_id ?? body.rfc_message_id ?? "").trim();

    const clientId = clientIdForRecipient(to) ?? (fromRaw ? WMG_CLIENT_ID : null);
    if (!clientId) {
      return json({ error: "Unknown support alias — designated seat is bricely@prime-timesystems.com", to, aliases: Object.keys(ALIAS_TO_CLIENT) }, 400);
    }
    if (!fromRaw || (!subject && !text)) {
      return json({ error: "from and subject/text required" }, 400);
    }

    const { email, name } = parseFrom(fromRaw);
    const message = [subject && `Subject: ${subject}`, text].filter(Boolean).join("\n\n");

    const existing = threadId ? await findTicketByThread(threadId) : null;
    const upstream = await callIntake({
      client_id: clientId,
      source_channel: "email",
      message,
      requester_email: email,
      requester_name: name,
      surface: "email",
      followup_ticket_id: existing?.id ?? undefined,
      human_override: {
        email_thread_id: threadId || null,
        rfc_message_id: messageId || null,
        designated_alias: "bricely@prime-timesystems.com",
      },
    });

    return json({
      ok: upstream.ok,
      stub: false,
      designated: "bricely@prime-timesystems.com",
      followup: Boolean(existing),
      ticket_id: existing?.id ?? upstream.data?.ticket?.id ?? upstream.data?.ticket_id ?? null,
      upstream: upstream.data,
    }, upstream.ok ? 200 : upstream.status);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
