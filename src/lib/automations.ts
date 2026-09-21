import type { Ticket } from "./supabase";
import { pageContextFromTicket } from "./supabase";
import { DISPATCH_OUTBOX_PATH } from "./handoffs";

/** Suggest-only Cursor CS digests — never auto-dispatch / never override operator Approve. */
export type AutomationSuggestion = {
  id: string;
  kind: "stale_awaiting" | "sla_breach" | "missing_page_context" | "priority_open";
  title: string;
  rationale: string;
  ticket_ids: string[];
  severity: "info" | "warn" | "high";
};

const OPEN = new Set(["awaiting_approval", "ai_processing", "new", "billable_review"]);

function ageHours(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3600_000;
}

/** Build operator-facing suggestions from the live ticket list (client-side, suggest-only). */
export function buildAutomationSuggestions(tickets: Ticket[]): AutomationSuggestion[] {
  const open = tickets.filter((t) => OPEN.has(t.status) && !t.is_mock);
  const out: AutomationSuggestion[] = [];

  const stale = open.filter(
    (t) => t.status === "awaiting_approval" && ageHours(t.created_at) >= 24,
  );
  if (stale.length) {
    out.push({
      id: "stale_awaiting",
      kind: "stale_awaiting",
      title: `${stale.length} ticket(s) awaiting approval ≥24h`,
      rationale: "Nudge triage — still suggest-only; operator must Approve before any dispatch.",
      ticket_ids: stale.map((t) => t.id),
      severity: "warn",
    });
  }

  const breach = open.filter((t) => {
    const hours =
      t.priority === "P1" ? 3 : t.priority === "P2" ? 24 : t.priority === "P3" ? 48 : 72;
    return ageHours(t.created_at) >= hours;
  });
  if (breach.length) {
    out.push({
      id: "sla_breach",
      kind: "sla_breach",
      title: `${breach.length} open ticket(s) past Exhibit A initial window`,
      rationale: "Surface for human touch — Automations never auto-escalate or auto-dispatch.",
      ticket_ids: breach.map((t) => t.id),
      severity: "high",
    });
  }

  const noPage = open.filter((t) => !pageContextFromTicket(t).screenLabel);
  if (noPage.length) {
    out.push({
      id: "missing_page_context",
      kind: "missing_page_context",
      title: `${noPage.length} open ticket(s) without page context`,
      rationale: "Routing hint missing — intake may predate page_context persist, or manual create.",
      ticket_ids: noPage.map((t) => t.id),
      severity: "info",
    });
  }

  const p1p2 = open.filter((t) => t.priority === "P1" || t.priority === "P2");
  if (p1p2.length) {
    out.push({
      id: "priority_open",
      kind: "priority_open",
      title: `${p1p2.length} P1/P2 still open`,
      rationale: "Priority digest for operator queue — no autonomous action.",
      ticket_ids: p1p2.map((t) => t.id),
      severity: "high",
    });
  }

  return out;
}

/** Flat-file digest for outbox drop — posture matches DR-009 suggest-only. */
export function buildSuggestionDigestPayload(suggestions: AutomationSuggestion[]) {
  return {
    schema: "prime.cs.automation_suggestion.v1",
    posture: "suggest_only",
    never_auto_dispatch: true,
    never_override_approve: true,
    production_ref_forbidden: "qcefkoxqkfwnlqfmwzmi",
    watched_dir: DISPATCH_OUTBOX_PATH,
    generated_at: new Date().toISOString(),
    suggestions,
  };
}
