import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key, { db: { schema: "support" } });
    const body = await req.json();
    const ticketId = body.ticket_id as string;
    const approvedBy = String(body.approved_by ?? "operator").trim();
    if (!ticketId) return json({ error: "ticket_id required" }, 400);

    const { data: ticket } = await sb.from("support_tickets").select("*").eq("id", ticketId).single();
    if (!ticket) return json({ error: "Ticket not found" }, 404);
    if (ticket.status !== "awaiting_approval" && ticket.status !== "approved") {
      return json({ error: `Ticket status ${ticket.status} is not approvable` }, 400);
    }
    if (ticket.ai_lane === "ambiguous") {
      return json({
        error: "Resolve ambiguous classification (override lane) before engineering dispatch",
      }, 400);
    }
    if (ticket.ai_lane === "billable") {
      return json({ error: "Billable tickets use change-order flow, not engineering dispatch" }, 400);
    }

    let { data: handoff } = await sb
      .from("engineering_handoffs")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!handoff) {
      const inserted = await sb
        .from("engineering_handoffs")
        .insert({
          ticket_id: ticketId,
          structured_issue: {
            summary: ticket.ai_summary,
            proposed_fix: ticket.ai_suggested_action,
          },
          cursor_dispatch_status: "pending",
        })
        .select("*")
        .single();
      handoff = inserted.data;
    }

    const now = new Date().toISOString();
    const dispatchId = `DISP-${crypto.randomUUID().slice(0, 8)}`;
    // Flat-file first (Handoff B) — Appendix A.3 shape; same body for future webhook/API.
    const dispatchPayload = {
      schema_version: "1.0",
      dispatch_id: dispatchId,
      dispatched_at: now,
      dispatched_by: approvedBy,
      approval_gate: {
        approved: true,
        approved_by: approvedBy,
        approved_at: now,
        source: "support_ticket_approved",
      },
      origin: {
        type: "bug",
        source_ticket_id: ticketId,
        coverage: "Maintenance & Support (covered, non-billable)",
        note: "Covered bug — approved directly from triage, no quoting.",
      },
      client: {
        id: "wmg",
        name: "Wilson Marketing Group",
        system: "WMG OS",
      },
      task: {
        title: ticket.ai_summary ?? "Support ticket",
        description: ticket.ai_suggested_action ?? ticket.raw_message,
        acceptance_criteria: [
          "Staging preview proves the fix",
          "No production target",
          "PRIME sign-off before promote",
        ],
        affected_areas: ["wmg-canonical (additive unless scoped)"],
        risk_tier: ticket.ai_risk_tier ?? "low",
      },
      execution_guardrails: {
        target_environment: "WMG_OS_STAGING",
        production_ref_forbidden: "qcefkoxqkfwnlqfmwzmi",
        branch: `fix/${String(ticketId).slice(0, 8)}`,
        rules: [
          "Staging branch + preview ONLY",
          "No production deploy",
          "PR + staging sign-off before promotion",
          "Update CONTROL_PLANE.md on closure",
        ],
      },
      return_contract: {
        status_callback: `/api/dispatches/${dispatchId}/status`,
        expected_states: [
          "received",
          "in_progress",
          "in_staging",
          "promoted",
          "failed",
        ],
        staging_preview_url_field: "staging_preview_url",
        on_complete: `Set ticket ${ticketId} resolved and notify requester via Bricely.`,
      },
      mechanism: "flat_file",
      watched_dir: "support-triage/dispatches/outbox",
      handoff_id: handoff.id,
    };

    const webhook = Deno.env.get("CURSOR_DISPATCH_WEBHOOK_URL");
    let dispatchStatus = "pending";
    let cursorReference: string | null = null;

    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dispatchPayload),
      });
      dispatchStatus = res.ok ? "dispatched" : "failed";
      cursorReference = res.ok ? `webhook:${res.status}` : `webhook_error:${res.status}`;
    } else {
      // Flat-file: operator/UI downloads JSON into watched_dir
      dispatchStatus = "pending";
      cursorReference = "flat_file:support-triage/dispatches/outbox";
    }

    await sb
      .from("engineering_handoffs")
      .update({
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        cursor_dispatch_status: dispatchStatus,
        cursor_reference: cursorReference,
      })
      .eq("id", handoff.id);

    await sb
      .from("support_tickets")
      .update({ status: "sent_to_engineering" })
      .eq("id", ticketId);

    await sb.rpc("log_ticket_event", {
      p_ticket_id: ticketId,
      p_event_type: "engineering_approved_dispatched",
      p_actor: "operator",
      p_payload: { approved_by: approvedBy, dispatchStatus, cursorReference },
    });

    return json({
      ok: true,
      handoff_id: handoff.id,
      cursor_dispatch_status: dispatchStatus,
      cursor_reference: cursorReference,
      dispatch_payload: dispatchPayload,
      stubbed: !webhook,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
