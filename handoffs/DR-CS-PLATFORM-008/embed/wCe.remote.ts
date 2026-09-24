/**
 * Drop-in replacement for live WMG `wCe`.
 *
 * Same contract: ({ text, state, newAttachments }) → { reply, next, terminal, cardStatus?, liveFix? }
 * Points at staging bricely-diagnose (same project as intake-ticket / bricely-thread).
 *
 * Copy into feat/bricely-embed `src/bricely/wCe.ts` (or replace the local function)
 * and set VITE_BRICELY_DIAGNOSE_URL on WMG Vercel. Local policy is the fallback
 * if the function is unreachable — copy the two _shared files beside this module
 * or keep the fetch-only path after deploy is proven.
 */

export type LiveWceInput = {
  text: string;
  state?: Record<string, unknown>;
  newAttachments?: unknown[];
};

function diagnoseUrl(): string {
  const explicit = (import.meta as { env?: Record<string, string> }).env?.VITE_BRICELY_DIAGNOSE_URL;
  if (explicit) return explicit;
  const intake = (import.meta as { env?: Record<string, string> }).env?.VITE_BRICELY_INTAKE_URL ?? "";
  return intake.replace(/\/intake-ticket\/?$/, "/bricely-diagnose");
}

export async function wCe(e: LiveWceInput): Promise<{
  reply: string;
  next: Record<string, unknown>;
  terminal: string;
  cardStatus?: string;
  liveFix?: { kind: string; desiredName: string };
}> {
  const url = diagnoseUrl();
  if (!url) throw new Error("VITE_BRICELY_DIAGNOSE_URL / intake URL missing");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: e.text,
      state: e.state ?? {},
      newAttachments: e.newAttachments ?? [],
    }),
  });
  const data = await res.json();
  if (!res.ok || !data?.reply || !data?.next || !data?.terminal) {
    throw new Error(data?.error ?? "bricely-diagnose failed");
  }

  const followupId = data.append_to_ticket_id as string | undefined;
  const intake = (import.meta as { env?: Record<string, string> }).env?.VITE_BRICELY_INTAKE_URL;
  if (followupId && intake && e.text?.trim()) {
    try {
      await fetch(intake, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: (e.state as { client_id?: string } | undefined)?.client_id,
          source_channel: "widget",
          message: e.text.trim(),
          followup_ticket_id: followupId,
        }),
      });
    } catch {
      /* thread persist still keeps the chat; ticket follow-up is best-effort */
    }
  }
  return data;
}
