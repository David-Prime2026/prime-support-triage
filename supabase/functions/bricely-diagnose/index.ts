import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const secret = Deno.env.get("INTAKE_HMAC_SECRET");
    if (secret) {
      const provided = req.headers.get("x-intake-secret") ?? "";
      if (provided !== secret) return json({ error: "Unauthorized" }, 401);
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Live WMG widget contract (wCe): { text, state, newAttachments }
    if (isLivePayload(body) && !Array.isArray(body.messages)) {
      const live = diagnoseLiveTurn({
        text: String(body.text ?? ""),
        state: (body.state ?? body.diag_state ?? {}) as Partial<LiveDiagState>,
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
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
