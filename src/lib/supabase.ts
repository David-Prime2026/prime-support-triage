import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const WMG_CLIENT_ID = "a1000001-0001-4001-8001-000000000001";

const looksLocal =
  typeof url === "string" &&
  (url.includes("127.0.0.1") || url.includes("localhost"));

/** Staging console must hit isolated local stack — never a remote project missing `support`. */
export const supabaseConfigured = Boolean(
  url && anon && !anon.includes("replace") && looksLocal,
);

export const supabase = supabaseConfigured
  ? createClient(url, anon, { db: { schema: "support" } })
  : null;

export const supabaseConfigHint = !looksLocal
  ? `Blocked non-local Supabase URL (${url ?? "unset"}). Use support-triage/.env.local → http://127.0.0.1:54341`
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
};

export type TicketEvent = {
  id: string;
  ticket_id: string;
  event_type: string;
  actor: string;
  payload: Record<string, unknown>;
  created_at: string;
};
