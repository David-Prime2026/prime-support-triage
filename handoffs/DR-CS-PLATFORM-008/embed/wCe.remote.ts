/**
 * Drop-in replacement for live WMG `wCe`.
 *
 * Same contract: ({ text, state, newAttachments }) → { reply, next, terminal, cardStatus?, liveFix? }
 * Points at staging bricely-diagnose (same project as intake-ticket / bricely-thread).
 *
 * Copy into feat/bricely-embed `src/bricely/wCe.ts` (or replace the local function)
 * and set VITE_BRICELY_DIAGNOSE_URL on WMG Vercel.
 *
 * Diagnose 200 is not a live widget. Operator must also delete the canned `F$`
 * catch in BricelyChat so a failed fetch cannot fall back to screenshot /
 * clear-filter / specialist wall. This drop-in never throws into that catch.
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
  if (!url) {
    return {
      reply:
        "I have enough to get a specialist on this instead of looping. I am opening a ticket with what you already said — you will hear back within 24 hours.",
      next: { ...(e.state ?? {}), phase: "escalate" },
      terminal: "escalate",
      cardStatus: "In progress",
    };
  }

  let data: {
    reply?: string;
    next?: Record<string, unknown>;
    terminal?: string;
    cardStatus?: string;
    liveFix?: { kind: string; desiredName: string };
    append_to_ticket_id?: string;
    error?: string;
  } = {};
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: e.text,
        state: e.state ?? {},
        newAttachments: e.newAttachments ?? [],
      }),
    });
    data = (await res.json()) as typeof data;
    if (!res.ok || !data?.reply || !data?.next || !data?.terminal) {
      throw new Error(data?.error ?? "bricely-diagnose failed");
    }
  } catch {
    // Never throw into the live widget catch — that path still runs canned F$
    // (screenshot / clear-filter / specialist wall). Fail into a ticket instead.
    return {
      reply:
        "I have enough to get a specialist on this instead of looping. I am opening a ticket with what you already said — you will hear back within 24 hours.",
      next: { ...(e.state ?? {}), phase: "escalate" },
      terminal: "escalate",
      cardStatus: "In progress",
    };
  }

  if (!data.reply || !data.next || !data.terminal) {
    return {
      reply:
        "I have enough to get a specialist on this instead of looping. I am opening a ticket with what you already said — you will hear back within 24 hours.",
      next: { ...(e.state ?? {}), phase: "escalate" },
      terminal: "escalate",
      cardStatus: "In progress",
    };
  }

  const followupId = data.append_to_ticket_id;
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
  return {
    reply: data.reply,
    next: data.next,
    terminal: data.terminal,
    cardStatus: data.cardStatus,
    liveFix: data.liveFix,
  };
}
