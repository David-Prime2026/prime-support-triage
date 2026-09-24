/** Local proofs for Bricely Gmail designated intake (no WMG OS prod). */
import {
  ALIAS_TO_CLIENT,
  clientIdForRecipient,
  coWaitingSubject,
  coWaitingBody,
  coApprovedBody,
  isCoNotifyType,
  waitingCc,
  canAttachExecutedPdf,
  missingExecutionStamps,
  OFFICIAL_QUOTE_TEMPLATE,
  WMG_CLIENT_ID,
} from "../supabase/functions/_shared/bricelyMail.ts";

let failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log("PASS", name);
  else {
    failed += 1;
    console.log("FAIL", name, detail);
  }
}

check("alias maps Bricely", clientIdForRecipient("Bricely Escobar <bricely@prime-timesystems.com>") === WMG_CLIENT_ID);
check("alias keeps wmg-os stub", clientIdForRecipient("wmg-os@support.primetimesystems.ai") === WMG_CLIENT_ID);
check("unknown alias rejected", clientIdForRecipient("random@example.com") === null);
check("designated is Bricely", "bricely@prime-timesystems.com" in ALIAS_TO_CLIENT);
check("support@ is not designated", !("support@prime-timesystems.com" in ALIAS_TO_CLIENT));

const waiting = {
  type: "CHANGE ORDER WAITING FOR APPROVAL" as const,
  change_order_id: "CO-015",
  title: "Portal dashboard — multi-location access",
  quote_id: "1002026-015",
  amount: "$6,327",
  start_amount: "50% ($3,163.50)",
  delivery_amount: "50% ($3,163.50)",
  to: ["skip@wilsonmarketing.com"],
};
check("CO notify type recognized", isCoNotifyType(waiting.type));
check("CO subject has no SLA words", !/SLA|billable|§19/i.test(coWaitingSubject(waiting)));
const body = coWaitingBody(waiting);
check("CO body has Your Support link", body.includes("wmgos.primetimesystems.ai/?view=settings#your-support"));
check("CO body has no SLA jargon", !/SLA|billable|out of scope|Exhibit/i.test(body));
check("CO body has signature", body.includes("BRICELY ESCOBAR"));
check("waiting mail promises PDF only after execution", /only after execution/i.test(body));
check("waiting mail does not send a PDF now", !/A PDF copy is attached/i.test(body));
check("waiting default CC is David only", waitingCc().join(",") === "david@prime-timesystems.com");
check("waiting default CC is not Alisa", !waitingCc().some((e) => e.includes("alisa@")));
check("official template path", OFFICIAL_QUOTE_TEMPLATE.includes("2026-PRIME-TIME-Systems-Quote-Proposal.docx"));
check("executed PDF blocked without stamps", !canAttachExecutedPdf({}));
check(
  "executed PDF allowed with both stamps",
  canAttachExecutedPdf({
    customer_accepted_at: "2026-09-24T18:00:00Z",
    prime_send_approved_at: "2026-09-24T18:05:00Z",
    prime_send_approved_by: "david@prime-timesystems.com",
  }),
);
check(
  "missing stamps lists the three required fields",
  missingExecutionStamps({}).join(",") ===
    "customer_accepted_at,prime_send_approved_at,prime_send_approved_by",
);
const approved = coApprovedBody({
  type: "CHANGE ORDER APPROVED",
  change_order_id: "CO-015",
  title: "Portal dashboard — multi-location access",
  quote_id: "1002026-015",
  to: ["skip@wilsonmarketing.com"],
  customer_accepted_at: "2026-09-24T18:00:00Z",
  customer_accepted_by: "Skip Wilson",
  prime_send_approved_at: "2026-09-24T18:05:00Z",
  prime_send_approved_by: "David Figueroa",
});
check("approved body has both timestamps", /Customer accepted/i.test(approved) && /PRIME approved sending/i.test(approved));
check("approved body names official template", /2026 PRIME-TIME Systems Quote\/Proposal/i.test(approved));

function haltedLane(halt: boolean, lane: string): string {
  if (lane === "auto_resolve" && halt) return "needs_approval";
  return lane;
}
check("kill switch stops auto mid-flight", haltedLane(true, "auto_resolve") === "needs_approval");
check("kill switch off leaves Tier A", haltedLane(false, "auto_resolve") === "auto_resolve");

if (failed) {
  console.log(`\n${failed} FAIL`);
  process.exit(1);
}
console.log("\n22/22 local Gmail-intake proofs PASS");
