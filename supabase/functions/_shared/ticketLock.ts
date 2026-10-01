/** Terminal ticket statuses for widget lock + intake follow-up (DR-CS-WIDGET-016). */
const TERMINAL = new Set(["resolved", "closed", "auto_resolved"]);

export function isTerminalTicketStatus(status: string | null | undefined): boolean {
  return TERMINAL.has((status ?? "").trim().toLowerCase());
}

/** Browser embed must not send x-intake-secret. HMAC is server-to-server only. */
export function widgetSkipsIntakeSecret(sourceChannel: string | null | undefined): boolean {
  const source = (sourceChannel ?? "widget").trim().toLowerCase() || "widget";
  return source === "widget";
}

export function publicTicketPayload(ticket: {
  id: string;
  ticket_number?: string | null;
  status?: string | null;
}): { id: string; ticket_number: string | null; status: string | null } {
  return {
    id: ticket.id,
    ticket_number: ticket.ticket_number ?? null,
    status: ticket.status ?? null,
  };
}
