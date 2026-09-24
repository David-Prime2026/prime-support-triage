/** Shared Bricely mail helpers. Customer-facing copy only — no SLA/billable words. */

export const WMG_CLIENT_ID = "a1000001-0001-4001-8001-000000000001";

export const ALIAS_TO_CLIENT: Record<string, string> = {
  "bricely@prime-timesystems.com": WMG_CLIENT_ID,
  "wmg-os@support.primetimesystems.ai": WMG_CLIENT_ID,
};

export const BRICELY_SIGNATURE = [
  "--",
  "PRIME-TIME SYSTEMS",
  "BRICELY ESCOBAR",
  "CUSTOMER SUCCESS LEAD",
  "T: (844) 777-4631",
  "W: www.prime-timesystems.com",
].join("\n");

export const YOUR_SUPPORT_URL =
  "https://wmgos.primetimesystems.ai/?view=settings#your-support";

/** Official change-order / quote form. Never a homemade PDF. */
export const OFFICIAL_QUOTE_TEMPLATE =
  "quotes/templates/2026-PRIME-TIME-Systems-Quote-Proposal.docx";

export const PRIME_INTERNAL_COPY = "david@prime-timesystems.com";

export type CoExecutionStamps = {
  customer_accepted_at?: string;
  customer_accepted_by?: string;
  prime_send_approved_at?: string;
  prime_send_approved_by?: string;
};

export function waitingCc(explicit?: string[]): string[] {
  const src = explicit ?? [PRIME_INTERNAL_COPY];
  return Array.from(
    new Set(src.map((e) => e.trim().toLowerCase()).filter(Boolean)),
  );
}

export function approvedCc(explicit?: string[]): string[] {
  return Array.from(
    new Set(
      [...(explicit ?? []), PRIME_INTERNAL_COPY]
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export function missingExecutionStamps(p: CoExecutionStamps): string[] {
  const missing: string[] = [];
  if (!p.customer_accepted_at) missing.push("customer_accepted_at");
  if (!p.prime_send_approved_at) missing.push("prime_send_approved_at");
  if (!p.prime_send_approved_by) missing.push("prime_send_approved_by");
  return missing;
}

/** PDF only after customer accept + PRIME (David) send-approval. */
export function canAttachExecutedPdf(p: CoExecutionStamps): boolean {
  return missingExecutionStamps(p).length === 0;
}

export function clientIdForRecipient(to: string): string | null {
  const hay = to.toLowerCase();
  const alias = Object.keys(ALIAS_TO_CLIENT).find((a) => hay.includes(a.toLowerCase()));
  return alias ? ALIAS_TO_CLIENT[alias] : null;
}

export function parseFrom(from: string): { email: string; name: string } {
  const angle = from.match(/<([^>]+)>/);
  const email = (angle?.[1] ?? from).trim().toLowerCase();
  const name = from.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || email.split("@")[0];
  return { email, name };
}

export type CoWaitingPayload = {
  type: "CHANGE ORDER WAITING FOR APPROVAL";
  change_order_id: string;
  title: string;
  quote_id?: string;
  amount?: string;
  start_amount?: string;
  delivery_amount?: string;
  to: string[];
  cc?: string[];
  review_url?: string;
};

export type CoApprovedPayload = CoExecutionStamps & {
  type: "CHANGE ORDER APPROVED";
  change_order_id: string;
  title: string;
  quote_id?: string;
  approver_name?: string;
  approved_at?: string;
  to: string[];
  cc?: string[];
};

export function coWaitingSubject(p: CoWaitingPayload): string {
  const q = p.quote_id ? ` (Quote ${p.quote_id})` : "";
  return `Change order waiting for your approval — ${p.change_order_id} ${p.title}${q}`;
}

export function coWaitingBody(p: CoWaitingPayload): string {
  const url = p.review_url || YOUR_SUPPORT_URL;
  const money = p.amount
    ? `\n\nThis change order is ${p.amount}. ${p.start_amount ?? "50%"} is due to start and ${p.delivery_amount ?? "50%"} is due when delivered. Maintenance (21%) is not due until contract renewal.`
    : "";
  return [
    "A change order is waiting for your approval on Your Support.",
    "",
    `${p.change_order_id} — ${p.title}${p.quote_id ? ` (Quote ${p.quote_id})` : ""}`,
    money.trim(),
    "",
    "Open and review here:",
    url,
    "",
    "Nothing starts until you approve. After you approve, we stamp your name and the time on the signature line. A PDF is emailed only after execution — it will show your acceptance timestamp together with PRIME's send-approval timestamp.",
    "",
    BRICELY_SIGNATURE,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");
}

export function coApprovedSubject(p: CoApprovedPayload): string {
  return `Change order approved — ${p.change_order_id} ${p.title}`;
}

export function coApprovedBody(p: CoApprovedPayload): string {
  const customerWho = p.customer_accepted_by || p.approver_name || "the customer";
  const customerWhen = p.customer_accepted_at || p.approved_at || "";
  const primeWho = p.prime_send_approved_by || "PRIME";
  const primeWhen = p.prime_send_approved_at || "";
  return [
    "The change order is executed.",
    "",
    `${p.change_order_id} — ${p.title}${p.quote_id ? ` (Quote ${p.quote_id})` : ""}`,
    "",
    `Customer accepted: ${customerWho}${customerWhen ? ` at ${customerWhen}` : ""}.`,
    `PRIME approved sending this copy: ${primeWho}${primeWhen ? ` at ${primeWhen}` : ""}.`,
    "",
    "A PDF of the official 2026 PRIME-TIME Systems Quote/Proposal is attached. It carries both timestamps.",
    "",
    BRICELY_SIGNATURE,
  ].join("\n");
}

export function isCoNotifyType(value: unknown): value is CoWaitingPayload["type"] | CoApprovedPayload["type"] {
  return value === "CHANGE ORDER WAITING FOR APPROVAL" || value === "CHANGE ORDER APPROVED";
}
