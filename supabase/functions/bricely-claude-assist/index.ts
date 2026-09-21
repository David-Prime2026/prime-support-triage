import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Bricely Claude assist — advisory replies only (DR-010 Stage 7b / G3).
 * Host: apxbwdxszmdffbduhjen ONLY. Never WMG OS production (qcefkox…).
 * Diagnostic state machine remains authority for escalate / ticket / money.
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

const SYSTEM = `You are Bricely, WMG's customer-facing AI support assistant.
You help in real time by asking short clarifying questions and giving plain how-to steps.
You are advisory only — a separate diagnostic fence owns tickets and escalation.

HARD RULES (never break):
- Never invent prices, invoice amounts, billable scope, change orders, or SLA promises.
- Never claim you already fixed production data unless the user confirms a self-serve action they did.
- If unsure or out of depth, say you can open a ticket (user says "open ticket").
- Keep replies under ~80 words, warm, concrete. One question at a time when diagnosing.
- If host_screen is known, use it; do not ask which screen they are on.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const text = String(body.text ?? "").trim();
    if (!text) return json({ error: "text required" }, 400);

    const hostScreen =
      typeof body.host_screen === "string" ? body.host_screen.trim() : null;
    const screen = typeof body.screen === "string" ? body.screen.trim() : null;
    const notes = Array.isArray(body.notes)
      ? body.notes.map((n: unknown) => String(n)).slice(-6)
      : [];
    const exchanges = Number(body.exchanges ?? 0);

    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) {
      // Fail soft — client keeps regex diagnostic path
      return json({ reply: null, reason: "assist_unconfigured" }, 503);
    }

    const user = [
      hostScreen || screen ? `Host screen: ${hostScreen || screen}` : "Host screen: unknown",
      `Diagnostic exchanges so far: ${exchanges}`,
      notes.length ? `Prior notes: ${notes.join(" | ")}` : null,
      `Customer message:\n${text}`,
      "Reply as Bricely (advisory only).",
    ]
      .filter(Boolean)
      .join("\n\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("[bricely-claude-assist] Anthropic", res.status, errText.slice(0, 200));
      return json({ reply: null, reason: "upstream_error" }, 502);
    }

    const data = await res.json();
    const reply = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n")
      .trim();

    if (!reply) return json({ reply: null, reason: "empty" }, 502);
    if (/\b(\$|usd|invoice amount|billable|change order|\$\d)\b/i.test(reply)) {
      return json({ reply: null, reason: "fence_reject_money" }, 200);
    }

    return json({ reply: reply.slice(0, 1200), advisory: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[bricely-claude-assist]", message);
    return json({ reply: null, reason: "error", error: message }, 500);
  }
});
