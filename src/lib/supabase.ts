import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const WMG_CLIENT_ID = "a1000001-0001-4001-8001-000000000001";

/** Never point the CS console at WMG OS production. */
const WMG_OS_PROD_REF = "qcefkoxqkfwnlqfmwzmi";

/** Isolated support-triage hosts (parent + staging branch). */
const TRIAGE_REFS = ["rxhiydtqzmksaeegxyqo", "apxbwdxszmdffbduhjen"];

const looksLocal =
  typeof url === "string" && (url.includes("127.0.0.1") || url.includes("localhost"));

const looksIsolatedTriage =
  typeof url === "string" &&
  !url.includes(WMG_OS_PROD_REF) &&
  TRIAGE_REFS.some((ref) => url.includes(ref));

export const supabaseConfigured = Boolean(
  url && anon && !anon.includes("replace") && (looksLocal || looksIsolatedTriage),
);

export const supabase = supabaseConfigured
  ? createClient(url, anon, { db: { schema: "support" } })
  : null;

export const supabaseConfigHint = !supabaseConfigured
  ? url?.includes(WMG_OS_PROD_REF)
    ? "Blocked WMG OS production URL — console must use isolated prime-support-triage (staging)."
    : `Supabase not configured for console (${url ?? "unset"}). Use staging rxhiydtqzmksaeegxyqo or local 127.0.0.1:54341.`
  : null;

export type Ticket = {
  id: string;
  client_id: string;
  requester_name: string | null;
  requester_email: string | null;
  source_channel: string;
  raw_message: string;
  ai_summary: string | null;
  ai_category: string | null;
  ai_risk_tier: string | null;
  ai_lane: string | null;
  ai_billable: boolean | null;
  ai_confidence: number | null;
  ai_suggested_action: string | null;
  ai_contract_clause_ref: string | null;
  ai_reasoning: string | null;
  status: string;
  priority: string | null;
  escalation_flag: boolean | null;
  diagnosis_summary: string | null;
  surface: string | null;
  assigned_to: string | null;
  human_override: Record<string, unknown> | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  is_mock?: boolean | null;
};

export type TicketEvent = {
  id: string;
  ticket_id: string;
  event_type: string;
  actor: string;
  payload: Record<string, unknown>;
  created_at: string;
};

/** Standard CS queue: P1 → P2 → P3 → … then FIFO (oldest first) within priority. */
export function priorityRank(p: string | null | undefined): number {
  switch ((p ?? "").toUpperCase()) {
    case "P1":
      return 0;
    case "P2":
      return 1;
    case "P3":
      return 2;
    case "P4":
      return 3;
    default:
      return 4;
  }
}

export function sortCsQueue(a: Ticket, b: Ticket): number {
  const pr = priorityRank(a.priority) - priorityRank(b.priority);
  if (pr !== 0) return pr;
  return a.created_at.localeCompare(b.created_at);
}
