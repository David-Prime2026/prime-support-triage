import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  diagnose,
  type ChatMessage,
  type DiagState,
} from "../_shared/bricelyDiagnose.ts";
import {
  diagnoseLiveTurn,
  followupOnTerminalTicket,
  planTerminalOpenTicket,
  type LiveAttachment,
  type LiveDiagState,
} from "../_shared/bricelyDiagnoseLive.ts";

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

function isLivePayload(body: Record<string, unknown>): boolean {
  return typeof body.text === "string" || body.state != null || body.newAttachments != null;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "diagnose failed";
}

async function ticketStatus(ticketId: string): Promise<string | null | undefined> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return undefined;
  const sb = createClient(url, key, { db: { schema: "support" } });
  const { data, error } = await sb
    .from("support_tickets")
    .select("status")
    .eq("id", ticketId)
    .maybeSingle();
  if (error) return undefined;
  return data?.status ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const liveWidget = isLivePayload(body) && !Array.isArray(body.messages);

    // HMAC is server-to-server. The browser widget does not send x-intake-secret.
    const secret = Deno.env.get("INTAKE_HMAC_SECRET");
    if (secret && !liveWidget) {
      const provided = req.headers.get("x-intake-secret") ?? "";
      if (provided !== secret) return json({ error: "Unauthorized" }, 401);
    }

    // Live WMG widget contract (wCe): { text, state, newAttachments }
    if (liveWidget) {
      const text = String(body.text ?? "");
      const rawState = (body.state ?? body.diag_state ?? {}) as Partial<LiveDiagState>;
      const openId = typeof rawState.openTicketId === "string" ? rawState.openTicketId.trim() : "";
      const status = openId ? await ticketStatus(openId) : undefined;
      const plan = planTerminalOpenTicket({
        openTicketId: openId || null,
        ticketStatus: openId ? status : undefined,
        text,
      });
      const state =
        plan.action === "keep"
          ? rawState
          : { ...rawState, openTicketId: null };
      if (plan.action === "create") {
        return json({ ok: true, ...followupOnTerminalTicket(state, text) });
      }
      const live = diagnoseLiveTurn({
        text,
        state,
        newAttachments: (body.newAttachments ?? []) as LiveAttachment[],
      });
      if (plan.action === "clear") {
        live.next = { ...live.next, openTicketId: null };
        delete live.append_to_ticket_id;
      }
      return json({ ok: true, ...live });
    }

    const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
    const diagState = (body.diag_state ?? {}) as Partial<DiagState>;
    const result = diagnose({
      messages,
      diag_state: diagState,
      diagnostic_turn_cap: body.diagnostic_turn_cap as number | undefined,
      diagnostic_soft_backstop: body.diagnostic_soft_backstop as number | undefined,
    });
    return json({ ok: true, ...result });
  } catch (e) {
    return json({ error: errorMessage(e) }, 500);
  }
});
