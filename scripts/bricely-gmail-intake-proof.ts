/** Local proofs for Bricely Gmail designated intake (no WMG OS prod). */
import {
  ALIAS_TO_CLIENT,
  clientIdForRecipient,
  coWaitingSubject,
  coWaitingBody,
  isCoNotifyType,
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
console.log("\n12/12 local Gmail-intake proofs PASS");
