/**
 * Case log seed — sourced from WMG OS Bugs & Bug Fixes log.
 * Canonical source: docs/bugs-and-fixes-log.md
 * GitHub: https://github.com/David-Prime2026/wmg-backend/blob/main/docs/bugs-and-fixes-log.md
 */
import type { Ticket } from "../lib/supabase";
import { WMG_CLIENT_ID } from "../lib/supabase";

export const CASE_LOG_SOURCE = {
  path: "docs/bugs-and-fixes-log.md",
  absoluteHint: "c:\\Users\\daves\\wmg-backend\\docs\\bugs-and-fixes-log.md",
  github:
    "https://github.com/David-Prime2026/wmg-backend/blob/main/docs/bugs-and-fixes-log.md",
  label: "WMG OS Bugs & Bug Fixes (BUG-001…)",
};

type BugSeed = {
  bugId: string;
  date: string;
  reporter: string;
  summary: string;
  bugStatus: "open" | "investigating" | "limitation" | "fixed" | "wontfix";
  severity: "Critical" | "High" | "Med" | "Low";
  productArea?: string;
  detail?: string;
};

/** Index rows from docs/bugs-and-fixes-log.md (BUG-001…). */
export const BUG_CASE_SEEDS: BugSeed[] = [
  {
    bugId: "BUG-001",
    date: "2026-09-11",
    reporter: "LeeAnn Krogerson (GW Duluth)",
    summary: "Mixed-load multi-commodity + split bale qty not persisted on load/memo",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Seller portal load request · sales memo",
    detail:
      "Multi-select commodities; backend promoted first commodity only. Memo priced rows fixed (MS-1/2); per-SKU qty still Phase 2.",
  },
  {
    bugId: "BUG-002",
    date: "2026-09-16",
    reporter: "Trisha Hecimovich (GW Duluth)",
    summary: "Portal password reset — no self-serve path; customers locked out",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Login / portal invite / password recovery",
    detail:
      "Forgot password + request-portal-password-reset edge function shipped 2026-09-16.",
  },
  {
    bugId: "BUG-003",
    date: "2026-08-10",
    reporter: "Melinda Quintero / Alisa (GW ENC)",
    summary: "Portal invite / verify landed on localhost",
    bugStatus: "fixed",
    severity: "Critical",
    productArea: "Portal invite / Auth Site URL",
    detail: "Auth Site URL / redirects wrong; app-hosted invite links + PORTAL_APP_URL.",
  },
  {
    bugId: "BUG-004",
    date: "2026-08-05",
    reporter: "Trisha (True North / Duluth)",
    summary: "Portal approve broken + wrong-account CRM bind",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Portal access approve · CRM bind",
  },
  {
    bugId: "BUG-005",
    date: "2026-08-10",
    reporter: "Julie Van Kuren (GW ENC)",
    summary: "Seller load in DB but board / invite email path broken",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Seller portal submit · board · invite mail",
  },
  {
    bugId: "BUG-006",
    date: "2026-08-28",
    reporter: "Alisa / Neil (Wiseman)",
    summary: "Buyer primary not seeing assigned loads / distro vs primary",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Buyer portal visibility · distribution vs primary",
  },
  {
    bugId: "BUG-007",
    date: "2026-09-10",
    reporter: "Ops / Neil (Wiseman)",
    summary: "Buyer accept “Later” left no way to add hauler",
    bugStatus: "fixed",
    severity: "Med",
    productArea: "Buyer portal hauler",
  },
  {
    bugId: "BUG-008",
    date: "2026-08-25",
    reporter: "Alisa",
    summary: "Allocate Durham→Value “duplicate key” on sales memo number",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Sales memo sequencer",
  },
  {
    bugId: "BUG-009",
    date: "2026-08-25",
    reporter: "Ops UAT",
    summary: "No invoice / AR after buyer delivery confirm",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Buyer delivery → invoice / AR",
  },
  {
    bugId: "BUG-010",
    date: "2026-08-26",
    reporter: "Alisa / Candy (Value Clothing)",
    summary: "Approve blocked: requester not on CRM / “select contact”",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Portal access approve",
  },
  {
    bugId: "BUG-011",
    date: "2026-09-02",
    reporter: "Skip / Alisa",
    summary: "Commodity pricing date range not sticky / wrong memo dollars",
    bugStatus: "fixed",
    severity: "High",
    productArea: "Commodity pricing / sales memos",
  },
  {
    bugId: "BUG-012",
    date: "2026-08-11",
    reporter: "Alisa",
    summary: "Buyer allocate email UI shows one contact only",
    bugStatus: "limitation",
    severity: "Med",
    productArea: "Load allocate / buyer contacts",
    detail:
      "Limitation: data + distro completeness; track with CRM contact import work.",
  },
  {
    bugId: "BUG-013",
    date: "2026-09-18",
    reporter: "Trisha Hecimovich / Alisa (GW Duluth)",
    summary:
      "Multi-commodity load: extras not on memo UI; unpriced Shoes SKU; Change price doesn’t apply multi-line",
    bugStatus: "open",
    severity: "High",
    productArea: "Seller portal commodities · sales memo · Change price",
    detail:
      "LD-2026-ad8dc1: Shoes+Belts stored; Shoes had no master (Paired Shoes $0.35 does). Ops remapped + seeded Shoes Sept price. Memo waits on buyer allocate. Change price still single-rate; per-SKU qty Phase 2.",
  },
];

function priorityFromSeverity(sev: BugSeed["severity"]): string {
  if (sev === "Critical") return "P1";
  if (sev === "High") return "P2";
  if (sev === "Med") return "P3";
  return "P4";
}

function ticketStatusFromBug(s: BugSeed["bugStatus"]): string {
  if (s === "fixed") return "resolved";
  if (s === "limitation" || s === "wontfix") return "closed";
  if (s === "investigating") return "in_progress";
  return "awaiting_approval";
}

function bugUuid(n: number): string {
  const suffix = String(n).padStart(12, "0");
  return `b1000001-0001-4001-8001-${suffix}`;
}

/** Map bug seeds → support Ticket shapes for the Phase 1 console case log. */
export function bugsAsTickets(): Ticket[] {
  return BUG_CASE_SEEDS.map((b, i) => {
    const n = Number(b.bugId.replace(/\D/g, "")) || i + 1;
    const created = `${b.date}T16:00:00.000Z`;
    const resolved =
      b.bugStatus === "fixed" || b.bugStatus === "limitation" || b.bugStatus === "wontfix"
        ? created
        : null;
    return {
      id: bugUuid(n),
      client_id: WMG_CLIENT_ID,
      requester_name: b.reporter,
      requester_email: null,
      source_channel: "manual",
      raw_message: `${b.bugId}: ${b.summary}${b.detail ? `\n\n${b.detail}` : ""}`,
      ai_summary: `${b.bugId} — ${b.summary}`,
      ai_category: b.productArea ?? "defect",
      ai_risk_tier: b.severity === "Critical" || b.severity === "High" ? "high" : "medium",
      ai_lane:
        b.bugStatus === "limitation"
          ? "needs_approval"
          : b.bugStatus === "fixed"
            ? "auto_resolve"
            : "needs_approval",
      ai_billable: false,
      ai_confidence: 0.9,
      ai_suggested_action:
        b.bugStatus === "fixed"
          ? "Case closed in bugs-and-fixes-log (fixed)."
          : b.bugStatus === "limitation"
            ? "Logged as product limitation — see bugs-and-fixes-log."
            : "Triage from case log; see docs/bugs-and-fixes-log.md",
      ai_contract_clause_ref: "M&S §18 — Covered (defect / channel support)",
      ai_reasoning: `Seeded from ${CASE_LOG_SOURCE.path}`,
      status: ticketStatusFromBug(b.bugStatus),
      priority: priorityFromSeverity(b.severity),
      escalation_flag: b.severity === "Critical" || b.bugStatus === "open",
      diagnosis_summary: `Case log ${b.bugId} · status=${b.bugStatus} · severity=${b.severity}`,
      surface: "internal",
      assigned_to: null,
      human_override: { bug_id: b.bugId, source: CASE_LOG_SOURCE.path },
      resolution_notes:
        b.bugStatus === "fixed"
          ? `Fixed — see ${b.bugId} in bugs-and-fixes-log.md`
          : b.bugStatus === "limitation"
            ? `Limitation — see ${b.bugId}`
            : null,
      created_at: created,
      updated_at: created,
      resolved_at: resolved,
    } as Ticket & { resolved_at?: string | null };
  });
}
