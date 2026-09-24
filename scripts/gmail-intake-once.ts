/**
 * One-shot Bricely Gmail → intake-ticket pipe.
 * This channel polls Gmail MCP, then POSTs here (or run after MCP fetch).
 * Replies with the same email_thread_id append; they do not spawn duplicates.
 *
 * Usage (after Gmail MCP listed unread support mail):
 *   TRIAGE_URL=https://apxbwdxszmdffbduhjen.supabase.co \
 *   TRIAGE_ANON=... \
 *   node --experimental-strip-types scripts/gmail-intake-once.ts < messages.json
 *
 * messages.json: [{ thread_id, message_id, from, to, subject, text }]
 */
import { readFileSync } from "node:fs";

const WMG_CLIENT_ID = "a1000001-0001-4001-8001-000000000001";
const SKIP_FROM = [
  "workspace-noreply@google.com",
  "mail-noreply@google.com",
  "no-reply@",
  "noreply@",
];

type Inbound = {
  thread_id: string;
  message_id?: string;
  from: string;
  to?: string;
  subject: string;
  text: string;
};

function skip(from: string): boolean {
  const f = from.toLowerCase();
  return SKIP_FROM.some((s) => f.includes(s));
}

async function main() {
  const url = (process.env.TRIAGE_URL ?? "https://apxbwdxszmdffbduhjen.supabase.co").replace(/\/$/, "");
  const anon = process.env.TRIAGE_ANON ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";
  const hmac = process.env.INTAKE_HMAC_SECRET ?? "";
  if (!anon) {
    console.error("TRIAGE_ANON or VITE_SUPABASE_ANON_KEY required");
    process.exit(2);
  }
  const raw = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
  const items = JSON.parse(raw) as Inbound[];
  const seenThread = new Map<string, string>();

  for (const item of items) {
    if (skip(item.from)) {
      console.log("skip-marketing", item.from, item.subject);
      continue;
    }
    const followup = seenThread.get(item.thread_id);
    const body: Record<string, unknown> = {
      client_id: WMG_CLIENT_ID,
      source_channel: "email",
      message: [`Subject: ${item.subject}`, item.text].filter(Boolean).join("\n\n"),
      requester_email: item.from.replace(/.*<|>.*/g, "") || item.from,
      requester_name: item.from.replace(/<[^>]+>/, "").trim(),
      surface: "email",
      human_override: {
        email_thread_id: item.thread_id,
        rfc_message_id: item.message_id ?? null,
        designated_alias: "bricely@prime-timesystems.com",
      },
    };
    if (followup) body.followup_ticket_id = followup;

    const res = await fetch(`${url}/functions/v1/intake-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        ...(hmac ? { "x-intake-secret": hmac } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const ticketId = data.ticket?.id ?? data.ticket_id ?? followup;
    if (ticketId && item.thread_id) seenThread.set(item.thread_id, ticketId);
    console.log(res.status, followup ? "followup" : "new", ticketId, item.subject);
    if (!res.ok) console.log(JSON.stringify(data));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
