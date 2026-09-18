/** Handoff A/B helpers — shapes aligned to DR-BRICELY-001 Appendix A (runtime emit). */

export type HandoffAPackage = {
  schema_version: "1.0";
  change_order_id: string;
  source_ticket_id: string;
  generated_at: string;
  generated_by: "prime-support-triage";
  state: "ready_to_quote";
  client: {
    id: string;
    name: string;
    system: string;
    contract_ref: string;
  };
  billable_basis: {
    is_billable: true;
    contract_clause_ref: string | null;
    reason: string;
  };
  request: {
    verbatim: string;
    summary: string;
    requested_by: string;
    requested_via: string;
  };
  scope: {
    description: string;
    deliverables: string[];
    risks: string[];
    dependencies: string[];
    sequencing_notes: string;
  };
  lift: {
    hours: { snr: number; ai: number; sec: number; data: number; total: number };
    confidence: string;
    assessment_notes: string;
    affected_areas: string[];
    assessed_by: "cursor" | "operator";
    assessed_at: string;
  };
  rate_card_ref: {
    version: string;
    effective_date: string;
    note: string;
  };
  internal_value_estimate: {
    low: number;
    high: number;
    currency: "USD";
    note: "Internal ballpark for pipeline sizing only. NOT the quote.";
  };
  handoff: {
    destination: "external_quoting_platform";
    formats_emitted: ["json", "csv"];
    external_quote_id: null;
    return_status_endpoint: string;
  };
};

export type DispatchPayload = {
  schema_version: "1.0";
  dispatch_id: string;
  dispatched_at: string;
  dispatched_by: string;
  approval_gate: {
    approved: true;
    approved_by: string;
    approved_at: string;
    source: "support_ticket_approved" | "change_order_accepted";
  };
  origin:
    | {
        type: "bug";
        source_ticket_id: string;
        coverage: string;
        note: string;
      }
    | {
        type: "change_order";
        change_order_id: string;
        source_ticket_id: string;
        external_quote_id: string | null;
        external_quote_status: string | null;
      };
  client: { id: string; name: string; system: string };
  task: {
    title: string;
    description: string;
    acceptance_criteria: string[];
    affected_areas: string[];
    risk_tier?: string;
    reproduction?: string;
    dependencies?: string[];
    lift_reference?: { hours_total: number; confidence: string } | null;
  };
  execution_guardrails: {
    target_environment: "WMG_OS_STAGING";
    production_ref_forbidden: "qcefkoxqkfwnlqfmwzmi";
    branch: string;
    rules: string[];
  };
  return_contract: {
    status_callback: string;
    expected_states: string[];
    staging_preview_url_field: "staging_preview_url";
    on_complete: string;
  };
  /** Flat-file mechanism (future = webhook/API same body). */
  mechanism: "flat_file";
  watched_dir: string;
};

export function buildHandoffA(input: {
  change_order_id: string;
  ticket_id: string;
  description: string;
  rationale: string;
  estimated_hours: number | null;
  estimated_scope: string | null;
  contract_clause_ref: string | null;
}): HandoffAPackage {
  const total = Number(input.estimated_hours ?? 12);
  const snr = Math.round(total * 0.67);
  const data = Math.max(0, total - snr);
  const now = new Date().toISOString();
  return {
    schema_version: "1.0",
    change_order_id: input.change_order_id,
    source_ticket_id: input.ticket_id,
    generated_at: now,
    generated_by: "prime-support-triage",
    state: "ready_to_quote",
    client: {
      id: "wmg",
      name: "Wilson Marketing Group",
      system: "WMG OS",
      contract_ref: "MSA-WMG-2026",
    },
    billable_basis: {
      is_billable: true,
      contract_clause_ref: input.contract_clause_ref,
      reason: input.rationale,
    },
    request: {
      verbatim: input.description,
      summary: input.description,
      requested_by: "operator",
      requested_via: "Bricely (support assistant)",
    },
    scope: {
      description: input.estimated_scope || input.description,
      deliverables: [],
      risks: [],
      dependencies: [],
      sequencing_notes: "",
    },
    lift: {
      hours: { snr, ai: 0, sec: 0, data, total },
      confidence: "medium",
      assessment_notes: input.rationale,
      affected_areas: [],
      assessed_by: "operator",
      assessed_at: now,
    },
    rate_card_ref: {
      version: "wmg-2026-v1",
      effective_date: "2026-09-01",
      note: "Reference only. Real pricing is set in the external quoting platform.",
    },
    internal_value_estimate: {
      low: Math.round(total * 150),
      high: Math.round(total * 250),
      currency: "USD",
      note: "Internal ballpark for pipeline sizing only. NOT the quote.",
    },
    handoff: {
      destination: "external_quoting_platform",
      formats_emitted: ["json", "csv"],
      external_quote_id: null,
      return_status_endpoint: `/api/change-orders/${input.change_order_id}/decision`,
    },
  };
}

export function handoffAToCsvRow(pkg: HandoffAPackage): Record<string, string | number | null> {
  return {
    change_order_id: pkg.change_order_id,
    ticket_id: pkg.source_ticket_id,
    client: pkg.client.name,
    system: pkg.client.system,
    contract_clause: pkg.billable_basis.contract_clause_ref,
    request_summary: pkg.request.summary,
    scope_summary: pkg.scope.description,
    hours_snr: pkg.lift.hours.snr,
    hours_ai: pkg.lift.hours.ai,
    hours_sec: pkg.lift.hours.sec,
    hours_data: pkg.lift.hours.data,
    hours_total: pkg.lift.hours.total,
    confidence: pkg.lift.confidence,
    est_low: pkg.internal_value_estimate.low,
    est_high: pkg.internal_value_estimate.high,
    currency: pkg.internal_value_estimate.currency,
    state: pkg.state,
    generated_at: pkg.generated_at,
  };
}

export function buildDispatchPayload(input: {
  ticket_id: string;
  client_id: string;
  approved_by: string;
  title: string;
  description: string;
  handoff_id?: string;
  change_order_id?: string;
  lift_hours?: number | null;
  origin?: "bug" | "change_order";
}): DispatchPayload {
  const now = new Date().toISOString();
  const dispatchId = `DISP-${Date.now().toString().slice(-6)}`;
  const isCo = input.origin === "change_order" || Boolean(input.change_order_id);
  return {
    schema_version: "1.0",
    dispatch_id: dispatchId,
    dispatched_at: now,
    dispatched_by: input.approved_by,
    approval_gate: {
      approved: true,
      approved_by: input.approved_by,
      approved_at: now,
      source: isCo ? "change_order_accepted" : "support_ticket_approved",
    },
    origin: isCo
      ? {
          type: "change_order",
          change_order_id: input.change_order_id ?? "CO-pending",
          source_ticket_id: input.ticket_id,
          external_quote_id: null,
          external_quote_status: "accepted",
        }
      : {
          type: "bug",
          source_ticket_id: input.ticket_id,
          coverage: "Maintenance & Support (covered, non-billable)",
          note: "Covered bug — approved directly from triage, no quoting.",
        },
    client: {
      id: "wmg",
      name: "Wilson Marketing Group",
      system: "WMG OS",
    },
    task: {
      title: input.title,
      description: input.description,
      acceptance_criteria: [
        "Staging preview proves the fix",
        "No production target",
        "PRIME sign-off before promote",
      ],
      affected_areas: ["wmg-canonical (additive unless scoped)"],
      lift_reference:
        input.lift_hours != null
          ? { hours_total: Number(input.lift_hours), confidence: "medium" }
          : null,
    },
    execution_guardrails: {
      target_environment: "WMG_OS_STAGING",
      production_ref_forbidden: "qcefkoxqkfwnlqfmwzmi",
      branch: isCo
        ? `feat/${input.change_order_id ?? "change-order"}`
        : `fix/${input.ticket_id.slice(0, 8)}`,
      rules: [
        "Staging branch + preview ONLY",
        "No production deploy",
        "PR + staging sign-off before promotion",
        "Update CONTROL_PLANE.md on closure",
      ],
    },
    return_contract: {
      status_callback: `/api/dispatches/${dispatchId}/status`,
      expected_states: ["received", "in_progress", "in_staging", "promoted", "failed"],
      staging_preview_url_field: "staging_preview_url",
      on_complete: isCo
        ? `Set change_order ${input.change_order_id} to done and notify requester via Bricely.`
        : `Set ticket ${input.ticket_id} resolved and notify requester via Bricely.`,
    },
    mechanism: "flat_file",
    watched_dir: DISPATCH_OUTBOX_PATH,
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, rows: Record<string, string | number | null>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number | null) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? null)).join(",")),
  ].join("\n");
  const blob = new Blob([body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const DISPATCH_OUTBOX_PATH = "support-triage/dispatches/outbox";
export const HANDOFF_A_PATH = "support-triage/handoffs";
