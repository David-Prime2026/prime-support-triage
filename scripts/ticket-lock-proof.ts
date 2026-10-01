import {
  isTerminalTicketStatus,
  publicTicketPayload,
  widgetSkipsIntakeSecret,
} from "../supabase/functions/_shared/ticketLock.ts";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(isTerminalTicketStatus("resolved"), "resolved");
assert(isTerminalTicketStatus("CLOSED"), "CLOSED");
assert(isTerminalTicketStatus("auto_resolved"), "auto_resolved");
assert(!isTerminalTicketStatus("in_progress"), "in_progress");
assert(!isTerminalTicketStatus("awaiting_approval"), "awaiting_approval");
assert(widgetSkipsIntakeSecret("widget"), "widget skips");
assert(widgetSkipsIntakeSecret(""), "default widget skips");
assert(!widgetSkipsIntakeSecret("email"), "email hmac");
const p = publicTicketPayload({ id: "abc", ticket_number: "WMG-2026-10-006", status: "new" });
assert(p.id === "abc" && p.ticket_number === "WMG-2026-10-006", "payload");
console.log("ticketLock ok");
