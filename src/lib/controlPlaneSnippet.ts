import type { Ticket } from "./supabase";
import { deskAssignmentFromTicket, prediagnosisFromTicket, pageContextFromTicket } from "./supabase";

/**
 * Short CONTROL_PLANE closure note for the desk (DR-012 Stage 5).
 * Discourse stays in chat; this is the formal SoR snippet posted on closure.
 */
export function buildControlPlaneClosureSnippet(
  t: Ticket,
  opts: {
    closedBy: string;
    role: string;
    notifyStatus?: string;
    reason?: string;
  },
): string {
  const pred = prediagnosisFromTicket(t);
  const page = pageContextFromTicket(t);
  const desk = deskAssignmentFromTicket(t);
  const exact =
    pred.exactIssue || t.ai_summary || t.raw_message.slice(0, 160) || "(no exact issue)";
  const lines = [
    "[CONTROL_PLANE · closure]",
    `ticket: ${t.id}`,
    `exact_issue: ${exact.slice(0, 200)}`,
    `status: ${t.status} · cursor: ${t.cursor_execution_status ?? "done"}`,
    `lane: ${t.ai_lane ?? "—"} · priority: ${t.priority ?? "—"}`,
    page.screenLabel ? `page: ${page.screenLabel}${page.screenId ? ` (${page.screenId})` : ""}` : null,
    `desk: HITL=${desk.hitl ?? "—"} ENG=${desk.eng ?? "—"} DEV=${desk.dev ?? "—"}`,
    `closed_by: ${opts.closedBy} (${opts.role})`,
    opts.notifyStatus ? `requester_notify: ${opts.notifyStatus}` : null,
    `fence: staging-only · never auto qcefkox`,
    opts.reason ? `note: ${opts.reason}` : null,
    `at: ${new Date().toISOString()}`,
  ].filter(Boolean);
  return lines.join("\n");
}
