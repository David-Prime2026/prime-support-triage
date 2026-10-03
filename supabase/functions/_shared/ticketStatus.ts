/** Statuses that must release the widget's open-ticket lock. */
export const TERMINAL_TICKET_STATUSES = ["resolved", "closed", "auto_resolved"] as const;

export function isTerminalTicketStatus(status: string | null | undefined): boolean {
  return (TERMINAL_TICKET_STATUSES as readonly string[]).includes(String(status ?? "").trim());
}
