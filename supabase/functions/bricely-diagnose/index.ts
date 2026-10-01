import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  diagnose,
  type ChatMessage,
  type DiagState,
} from "../_shared/bricelyDiagnose.ts";
import {
  diagnoseLiveTurn,
  type LiveAttachment,
  type LiveDiagState,
} from "../_shared/bricelyDiagnoseLive.ts";
import { errMessage } from "../_shared/errMessage.ts";
import { isTerminalTicketStatus } from "../_shared/ticketLock.ts";

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

function service() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { db: { schema: "support" } });
}

async function stripTerminalOpenTicket(state: Partial<LiveDiagState>): Promise<Partial<LiveDiagState>> {
  const id = typeof state.openTicketId === "string" ? state.openTicketId.trim() : "";
  if (!id) return state;
  try {
    const sb = service();
    const { data } = await sb
      .from("support_tickets")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();
    if (!data || !isTerminalTicketStatus(data.status)) return state;
    await sb.rpc("clear_locks_for_ticket", { p_ticket_id: id });
    return { ...state, openTicketId: null };
  } catch {
    return state;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // Live widget POSTs from the browser. Do not require x-intake-secret.
    const body = (await req.json()) as Record<string, unknown>;

    // Live WMG widget contract (wCe): { text, state, newAttachments }
    if (isLivePayload(body) && !Array.isArray(body.messages)) {
      const rawState = (body.state ?? body.diag_state ?? {}) as Partial<LiveDiagState>;
      const state = await stripTerminalOpenTicket(rawState);
      const live = diagnoseLiveTurn({
        text: String(body.text ?? ""),
        state,
        newAttachments: (body.newAttachments ?? []) as LiveAttachment[],
      });
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
    return json({ error: errMessage(e) }, 500);
  }
});
