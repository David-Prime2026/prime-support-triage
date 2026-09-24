import type { Ticket } from "../lib/supabase";
import { WMG_CLIENT_ID } from "../lib/supabase";

/** Incoming seller requests that are not in the bugs-and-fixes log. */
export const GWKS_PICKUP_HOURS_TICKET_ID = "c1000001-0001-4001-8001-000000000001";

export const INCOMING_REQUEST_TICKETS: Ticket[] = [
  {
    id: GWKS_PICKUP_HOURS_TICKET_ID,
    client_id: WMG_CLIENT_ID,
    requester_name: "Jessica Wallace (Goodwill KS) via Alisa Figueroa",
    requester_email: "jwallace@goodwillks.org",
    source_channel: "email",
    raw_message:
      "Where I highlighted are you able to edit it on your end and able to save it to where I don't have to add our address and shipping hours every time I request a load?\n\nPickup location: 3636 N Oliver Wichita KS\nNotes: SHIPPING HOURS 8AM-2PM\nFrom: Jessica Wallace <jwallace@goodwillks.org> 2026-09-23 15:37 via Alisa.",
    ai_summary:
      "CO-GWKS-DEFAULT-PICKUP-HOURS — remember Goodwill KS pickup + shipping hours on New Portal",
    ai_category: "new_feature",
    ai_risk_tier: "medium",
    ai_lane: "billable",
    ai_billable: true,
    ai_confidence: 0.92,
    ai_suggested_action:
      "Quote then build in wmg-backend: prefill seller portal pickup + hours from account defaults / last-used. See handoffs/CO-GWKS-DEFAULT-PICKUP-HOURS/.",
    ai_contract_clause_ref: "M&S §19 — Excluded Services (new features)",
    ai_reasoning:
      "Not a defect. Pickup is per-order site name; shipping hours are notes. Confirmation emails already persist. Alisa cannot save these two fields onto Jessica’s form today.",
    status: "billable_review",
    priority: "P3",
    escalation_flag: false,
    diagnosis_summary:
      "Live GCe: pickup U and notes B start empty and clear after submit. get-seller-portal-context prefills last_commodity + confirmation_email_events only.",
    surface: "seller_portal_load_request",
    assigned_to: "david@prime-timesystems.com",
    human_override: {
      change_order_id: "CO-GWKS-DEFAULT-PICKUP-HOURS",
      seller: "Goodwill KS",
      pickup: "3636 N Oliver Wichita KS",
      shipping_hours: "8AM-2PM",
    },
    resolution_notes: null,
    created_at: "2026-09-23T20:37:00.000Z",
    updated_at: "2026-09-24T01:20:00.000Z",
  },
];

export const INCOMING_CHANGE_ORDERS = [
  {
    id: "CO-GWKS-DEFAULT-PICKUP-HOURS",
    ticket_id: GWKS_PICKUP_HOURS_TICKET_ID,
    client_id: WMG_CLIENT_ID,
    description:
      "Persist Goodwill KS default pickup (3636 N Oliver, Wichita KS) and shipping hours (8AM–2PM) on the New Portal load-request form",
    rationale:
      "New feature — M&S §19. Alisa cannot save seller-portal pickup or notes today. Confirmation emails already default from account settings.",
    contract_clause_ref: "M&S §19 — Excluded Services (new features)",
    estimated_scope:
      "get-seller-portal-context + GCe prefill; last-used like last_commodity; Alisa CRM defaults; staging only",
    estimated_hours: 12,
    status: "draft",
    created_at: "2026-09-24T01:20:00.000Z",
  },
];
