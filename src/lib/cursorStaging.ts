import type { Ticket } from "./supabase";
import {
  prediagnosisFromTicket,
  pageContextFromTicket,
  deskAssignmentFromTicket,
} from "./supabase";
import { DISPATCH_OUTBOX_PATH } from "./handoffs";

export type DeskThreadItem = {
  author_role: string;
  body: string;
  created_at: string;
};

/**
 * Fenced Cursor staging proposal (DR-011 Stage 4 / DR-012 Stage 2).
 * Suggest-only until console Approve. Never targets qcefkox production.
 * Desk thread (HITL/ENG/Cursor) rides along so execution notes stay ticket-sourced.
 */
export function buildCursorStagingProposal(
  t: Ticket,
  approvedBy: string,
  deskThread: DeskThreadItem[] = [],
) {
  const pred = prediagnosisFromTicket(t);
  const page = pageContextFromTicket(t);
  const deskAssign = deskAssignmentFromTicket(t);
  const shortId = t.id.slice(0, 8);
  const exact =
    pred.exactIssue ||
    t.ai_summary ||
    t.raw_message.slice(0, 240) ||
    "Issue not captured";

  return {
    schema: "prime.cs.cursor_staging.v1",
    posture: "suggest_only_until_approve",
    never_auto_prod: true,
    production_ref_forbidden: "qcefkoxqkfwnlqfmwzmi",
    target_environment: "WMG_OS_STAGING",
    watched_dir: DISPATCH_OUTBOX_PATH,
    generated_at: new Date().toISOString(),
    approved_by: approvedBy,
    ticket_id: t.id,
    branch: `fix/${shortId}`,
    title: exact.slice(0, 80),
    exact_issue: exact,
    page_context: page.screenLabel
      ? { screen_id: page.screenId, screen_label: page.screenLabel }
      : null,
    routing: {
      priority: pred.suggestedPriority ?? t.priority,
      lane: pred.suggestedLane ?? t.ai_lane,
      assignee_hint: pred.assigneeHint,
      capture_confidence: pred.captureConfidence,
      cursor_execution_status: t.cursor_execution_status ?? "idle",
    },
    /** HITL / ENG / Cursor desk discourse — captured on ticket; Cursor must read before staging work. */
    desk_thread: deskThread.map((m) => ({
      author_role: m.author_role,
      body: m.body,
      at: m.created_at,
    })),
    desk_assignment: deskAssign,
    fence: {
      allow: [
        "Additive UI / copy / filter defaults",
        "Existing liveFixes / Tier A self-serve paths",
        "Staging branch + preview URL",
      ],
      forbid: [
        "Autonomous production deploy",
        "Invent money / billable / SLA in customer chat",
        "Rewrite core business logic without PRIME scope",
      ],
      real_time_fix: "Only within existing Bricely fence (liveFixes / allowlist); else staging PR",
      billable_path:
        "If billable: estimate hours on console → change-order draft → route back awaiting_approval (do not auto-quote in chat)",
    },
    acceptance_criteria: [
      "Staging preview proves the fix against exact_issue",
      "Desk thread instructions honored (HITL/ENG)",
      "No production target",
      "PRIME sign-off before promote",
      "CONTROL_PLANE updated on closure",
    ],
    hitl_note:
      "HITL already assessed/approved. Cursor executes in staging only — do not re-diagnose unless capture was low. Desk thread is source of truth for execution notes.",
  };
}

/** Patch fields from Bricely prediagnosis onto a ticket row (operator-confirmed). */
export function routingPatchFromPrediagnosis(t: Ticket): {
  priority?: string;
  ai_lane?: string;
  assigned_to?: string | null;
} {
  const pred = prediagnosisFromTicket(t);
  const patch: { priority?: string; ai_lane?: string; assigned_to?: string | null } = {};
  if (pred.suggestedPriority && ["P1", "P2", "P3", "P4"].includes(pred.suggestedPriority)) {
    patch.priority = pred.suggestedPriority;
  }
  if (
    pred.suggestedLane &&
    ["needs_approval", "ambiguous", "auto_resolve", "billable"].includes(pred.suggestedLane)
  ) {
    patch.ai_lane = pred.suggestedLane;
  }
  if (pred.assigneeHint) {
    patch.assigned_to = pred.assigneeHint;
  }
  return patch;
}
