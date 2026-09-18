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

  try {
    const secret = Deno.env.get("INTAKE_HMAC_SECRET");
    if (secret) {
      const provided = req.headers.get("x-intake-secret") ?? "";
      if (provided !== secret) return json({ error: "Unauthorized" }, 401);
    }

    const sb = service();
    const url = new URL(req.url);

    if (req.method === "GET") {
      const clientId = url.searchParams.get("client_id") ?? "";
      const surface = url.searchParams.get("surface") ?? "";
      const userKey = (url.searchParams.get("user_key") ?? "anon").toLowerCase();
      if (!clientId || !surface) return json({ error: "client_id and surface required" }, 400);

      const { data: thread, error } = await sb
        .from("bricely_threads")
        .select("*")
        .eq("client_id", clientId)
        .eq("surface", surface)
        .eq("user_key", userKey)
        .maybeSingle();
      if (error) throw error;
      if (!thread) return json({ thread: null, messages: [] });

      const { data: messages, error: mErr } = await sb
        .from("bricely_thread_messages")
        .select("*")
        .eq("thread_id", thread.id)
        .order("created_at", { ascending: true });
      if (mErr) throw mErr;
      return json({ thread, messages: messages ?? [] });
    }

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const body = await req.json();
    const clientId = String(body.client_id ?? "").trim();
    const surface = String(body.surface ?? "").trim();
    const userKey = String(body.user_key ?? body.requester_email ?? "anon").trim().toLowerCase();
    if (!clientId || !surface || !userKey) {
      return json({ error: "client_id, surface, user_key required" }, 400);
    }

    const isMock = Boolean(body.is_mock);
    const diagState = body.diag_state ?? {};
    const msgs = Array.isArray(body.messages) ? body.messages : [];

    const { data: existing } = await sb
      .from("bricely_threads")
      .select("id")
      .eq("client_id", clientId)
      .eq("surface", surface)
      .eq("user_key", userKey)
      .maybeSingle();

    let threadId = existing?.id as string | undefined;
    if (threadId) {
      const { error: uErr } = await sb
        .from("bricely_threads")
        .update({
          diag_state: diagState,
          is_mock: isMock,
          requester_name: body.requester_name ?? null,
          requester_email: body.requester_email ?? null,
          linked_account: body.linked_account ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", threadId);
      if (uErr) throw uErr;
      // Replace message list with authoritative snapshot (full durability sync)
      await sb.from("bricely_thread_messages").delete().eq("thread_id", threadId);
    } else {
      const { data: created, error: cErr } = await sb
        .from("bricely_threads")
        .insert({
          client_id: clientId,
          surface,
          user_key: userKey,
          diag_state: diagState,
          is_mock: isMock,
          requester_name: body.requester_name ?? null,
          requester_email: body.requester_email ?? null,
          linked_account: body.linked_account ?? null,
        })
        .select("id")
        .single();
      if (cErr) throw cErr;
      threadId = created.id;
    }

    if (msgs.length) {
      const rows = msgs.map((m: Record<string, unknown>) => ({
        thread_id: threadId,
        client_id: clientId,
        role: String(m.role ?? "user"),
        body: String(m.text ?? m.body ?? ""),
        card: m.card ?? null,
        attachments: m.attachments ?? [],
        client_msg_id: m.id ? String(m.id) : null,
        created_at: m.at
          ? new Date(Number(m.at)).toISOString()
          : new Date().toISOString(),
      }));
      const { error: iErr } = await sb.from("bricely_thread_messages").insert(rows);
      if (iErr) throw iErr;
    }

    // Mirror last user/bricely turns into ticket_messages when an open ticket is linked later via intake
    return json({ ok: true, thread_id: threadId });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
