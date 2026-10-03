/**
 * Local proof for DR-CS-WIDGET-016 open-ticket lock.
 *   node --experimental-strip-types scripts/widget-016-plan-proof.ts
 */
import { planTerminalOpenTicket } from "../supabase/functions/_shared/bricelyDiagnoseLive.ts";

const CLOSED = "be86fad1-ccb2-4cd6-8ee7-56f923fda3c2";
const failures: string[] = [];

function check(name: string, ok: boolean) {
  if (!ok) failures.push(name);
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}

const keep = planTerminalOpenTicket({
  openTicketId: CLOSED,
  ticketStatus: "in_progress",
  text: "add this photo",
});
check("open ticket stays appendable", keep.action === "keep" && keep.openTicketId === CLOSED);

const created = planTerminalOpenTicket({
  openTicketId: CLOSED,
  ticketStatus: "resolved",
  text: "the search is still empty",
});
check("resolved follow-up creates", created.action === "create" && created.openTicketId === null);

for (const status of ["closed", "auto_resolved"]) {
  const plan = planTerminalOpenTicket({
    openTicketId: CLOSED,
    ticketStatus: status,
    text: "still broken",
  });
  check(`${status} follow-up creates`, plan.action === "create" && plan.openTicketId === null);
}

const reset = planTerminalOpenTicket({
  openTicketId: CLOSED,
  ticketStatus: "closed",
  text: "new chat",
});
check("new chat clears without create", reset.action === "clear" && reset.openTicketId === null);

const missing = planTerminalOpenTicket({
  openTicketId: CLOSED,
  ticketStatus: null,
  text: "hello",
});
check("missing ticket clears without create", missing.action === "clear");

const lookupDown = planTerminalOpenTicket({
  openTicketId: CLOSED,
  ticketStatus: undefined,
  text: "hello",
});
check("lookup failure keeps lock", lookupDown.action === "keep");

const none = planTerminalOpenTicket({
  openTicketId: null,
  ticketStatus: "resolved",
  text: "hello",
});
check("no open id is a normal turn", none.action === "keep" && none.openTicketId === null);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("widget-016 plan proof PASS");
