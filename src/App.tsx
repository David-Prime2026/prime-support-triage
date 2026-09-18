import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  LayoutDashboard,
  Plus,
  RefreshCw,
  ScrollText,
  Users,
} from "lucide-react";
import {
  supabase,
  supabaseConfigured,
  supabaseConfigHint,
  WMG_CLIENT_ID,
  type Ticket,
  type TicketEvent,
  sortCsQueue,
} from "./lib/supabase";
import {
  buildDispatchPayload,
  buildHandoffA,
  DISPATCH_OUTBOX_PATH,
  downloadCsv,
  downloadJson,
  handoffAToCsvRow,
} from "./lib/handoffs";
import { bugsAsTickets, BUG_CASE_SEEDS, CASE_LOG_SOURCE } from "./seeds/bugsCaseLog";

type QueueSort = "priority_fifo" | "newest" | "oldest";

function applyQueueSort(list: Ticket[], mode: QueueSort): Ticket[] {
  const copy = [...list];
  if (mode === "newest") return copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (mode === "oldest") return copy.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return copy.sort(sortCsQueue);
}

const PRIME = {
  bg: "#0b1220",
  panel: "#111827",
  card: "#1a2332",
  border: "#243044",
  accent: "#3b82f6",
  text: "#e5eefb",
  muted: "#94a3b8",
};

type NavKey =
  | "all"
  | "priority"
  | "breaching"
  | "awaiting"
  | "ambiguous"
  | "assigned"
  | "change-orders"
  | "clients"
  | "kb"
  | "automations"
  | "dashboard"
  | "audit"
  | "compliance";

type ChangeOrder = {
  id: string;
  ticket_id: string;
  client_id: string;
  description: string;
  rationale: string;
  contract_clause_ref: string | null;
  estimated_scope: string | null;
  estimated_hours: number | null;
  status: string;
  created_at: string;
};

type FilterChip = { id: string; label: string };

const OPERATORS = [
  "bricely@prime-timesystems.com",
  "david@prime-timesystems.com",
];

const LANES = ["auto_resolve", "needs_approval", "billable", "ambiguous"] as const;

const DEMO_COS: ChangeOrder[] = [
  {
    id: "demo-co-1",
    ticket_id: "demo-t-1",
    client_id: WMG_CLIENT_ID,
    description: "Add tonnage per buyer to aging report",
    rationale: "New reporting capability — M&S §19 excluded (new features)",
    contract_clause_ref: "M&S §19 — Excluded Services (new features)",
    estimated_scope: "Tonnage aggregation + aging UI column + portal parity",
    estimated_hours: 12,
    status: "draft",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-co-2",
    ticket_id: "demo-t-2",
    client_id: WMG_CLIENT_ID,
    description: "Buyer portal remittance PDF attach",
    rationale: "Enhancement beyond covered defect fix",
    contract_clause_ref: "M&S §19 — custom development",
    estimated_scope: "Upload UI + storage path",
    estimated_hours: 10,
    status: "sent",
    created_at: new Date().toISOString(),
  },
];

/** Exhibit A initial-response windows (hours) mapped from P1–P4 for countdown UI. */
function slaHours(priority: string | null): number {
  switch (priority) {
    case "P1":
      return 3;
    case "P2":
      return 24;
    case "P3":
      return 48;
    case "P4":
      return 72;
    default:
      return 24;
  }
}

type SlaTone = "ok" | "warn" | "breach" | "settled";

const CLOSED_STATUSES = new Set(["resolved", "closed", "auto_resolved"]);

function slaCountdown(ticket: Ticket): { label: string; tone: SlaTone; msLeft: number } {
  const hours = slaHours(ticket.priority);
  const created = new Date(ticket.created_at).getTime();
  const deadline = created + hours * 3600_000;

  // FIX-C: stop the SLA clock on closed states — never show active "Breached … ago"
  if (CLOSED_STATUSES.has(ticket.status)) {
    const resolvedRaw =
      (ticket as Ticket & { resolved_at?: string | null }).resolved_at || ticket.updated_at || ticket.created_at;
    const resolvedMs = new Date(resolvedRaw).getTime();
    // Imported/pre-resolved seeds often set resolved_at ≈ created_at → treat as met at close
    if (resolvedMs <= deadline) {
      return { label: "SLA settled · met", tone: "settled", msLeft: 0 };
    }
    const late = resolvedMs - deadline;
    const h = Math.floor(late / 3600_000);
    const m = Math.floor((late % 3600_000) / 60_000);
    return {
      label: `SLA settled · missed by ${h}h ${m}m at close`,
      tone: "warn",
      msLeft: 0,
    };
  }

  const msLeft = deadline - Date.now();
  const abs = Math.abs(msLeft);
  const h = Math.floor(abs / 3600_000);
  const m = Math.floor((abs % 3600_000) / 60_000);
  if (msLeft <= 0) {
    return { label: `Breached ${h}h ${m}m ago`, tone: "breach", msLeft };
  }
  const ratio = msLeft / (hours * 3600_000);
  const tone: SlaTone = ratio < 0.2 ? "breach" : ratio < 0.4 ? "warn" : "ok";
  return { label: `${h}h ${m}m to touch`, tone, msLeft };
}

function stateLabel(t: Ticket): string {
  if (t.status === "auto_resolved") return "Auto-resolved";
  if (t.status === "awaiting_approval") return "Awaiting approval";
  if (t.status === "billable_review") return "Billable review";
  if (t.status === "sent_to_engineering") return "Dispatched";
  if (t.status === "resolved" || t.status === "closed") return "Resolved";
  if (t.status === "ai_processing" || t.status === "new") return "Open";
  return t.status.replace(/_/g, " ");
}

function priorityBadge(p: string | null) {
  const map: Record<string, string> = {
    P1: "bg-rose-600 text-white",
    P2: "bg-orange-500/90 text-white",
    P3: "bg-blue-600 text-white",
    P4: "bg-slate-500 text-white",
  };
  return map[p ?? ""] ?? "bg-slate-600 text-slate-200";
}

function slaToneClass(tone: SlaTone) {
  if (tone === "breach") return "text-rose-300";
  if (tone === "warn") return "text-amber-300";
  if (tone === "settled") return "text-slate-400";
  return "text-emerald-300";
}

function NavBtn(props: {
  active: boolean;
  label: string;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`w-full text-left rounded-lg px-3 py-2 text-sm flex items-center justify-between ${
        props.active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5"
      }`}
    >
      <span>{props.label}</span>
      {props.count != null && (
        <span className={`text-[10px] font-semibold ${props.active ? "text-white/80" : "text-slate-500"}`}>
          {props.count}
        </span>
      )}
    </button>
  );
}

export default function App() {
  const [nav, setNav] = useState<NavKey>("all");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [selectedCo, setSelectedCo] = useState<ChangeOrder | null>(null);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [queueSort, setQueueSort] = useState<QueueSort>("priority_fifo");
  const [nowTick, setNowTick] = useState(Date.now());
  const [noteDraft, setNoteDraft] = useState("");
  const [localNotes, setLocalNotes] = useState<
    { id: string; ticketId: string; body: string; author: string; at: string }[]
  >([]);

  const functionsBase = (import.meta.env.VITE_SUPABASE_URL as string)?.replace(/\/$/, "");
  const me = OPERATORS[0];

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setError(null);
      setTickets([]);
      setChangeOrders(DEMO_COS);
      return;
    }
    setLoading(true);
    setError(null);
    const [{ data, error: qErr }, { data: cos, error: coErr }] = await Promise.all([
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("change_order_drafts").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setLoading(false);
    if (qErr) {
      setError(qErr.message);
      setTickets([]);
      return;
    }
    setTickets((data ?? []) as Ticket[]);
    if (coErr) setChangeOrders(DEMO_COS);
    else {
      const rows = (cos ?? []) as ChangeOrder[];
      setChangeOrders(rows.length ? rows : DEMO_COS);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Merge BUG-001… case log seed so the console always shows the bugs log as cases. */
  const ticketsWithCaseLog = useMemo(() => {
    const seeded = bugsAsTickets();
    const byId = new Map<string, Ticket>();
    for (const t of seeded) byId.set(t.id, t);
    for (const t of tickets) byId.set(t.id, t);
    return applyQueueSort(Array.from(byId.values()), "priority_fifo");
  }, [tickets]);

  useEffect(() => {
    if (!supabase || !selected) {
      setEvents([]);
      return;
    }
    if (selected.id.startsWith("b1000001-")) {
      setEvents([]);
      return;
    }
    void supabase
      .from("ticket_events")
      .select("*")
      .eq("ticket_id", selected.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setEvents((data ?? []) as TicketEvent[]));
  }, [selected]);

  const counts = useMemo(() => {
    const list = ticketsWithCaseLog;
    const open = list.filter((t) => !["resolved", "closed", "auto_resolved"].includes(t.status));
    const p1 = list.filter((t) => t.priority === "P1" && !["resolved", "closed"].includes(t.status));
    const breaching = list.filter(
      (t) => !["resolved", "closed", "auto_resolved"].includes(t.status) && slaCountdown(t).tone === "breach",
    );
    const auto = list.filter((t) => t.status === "auto_resolved" || t.status === "resolved");
    const awaiting = list.filter((t) => t.status === "awaiting_approval");
    const ambiguous = list.filter((t) => t.ai_lane === "ambiguous");
    const assigned = list.filter((t) => t.assigned_to === me);
    return {
      open: open.length,
      p1: p1.length,
      breaching: breaching.length,
      auto: auto.length,
      awaiting: awaiting.length,
      ambiguous: ambiguous.length,
      assigned: assigned.length,
      all: list.length,
    };
  }, [ticketsWithCaseLog, me, nowTick]);

  const avgFirstTouch = useMemo(() => {
    const resolved = ticketsWithCaseLog.filter(
      (t) => t.status === "auto_resolved" || t.status === "resolved",
    );
    if (!resolved.length) return "—";
    return "< 1h";
  }, [ticketsWithCaseLog]);

  const visibleTickets = useMemo(() => {
    let list = [...ticketsWithCaseLog];
    if (nav === "priority") list = list.filter((t) => t.priority === "P1" || t.priority === "P2");
    if (nav === "breaching") {
      list = list.filter(
        (t) => !["resolved", "closed", "auto_resolved"].includes(t.status) && slaCountdown(t).tone === "breach",
      );
    }
    if (nav === "awaiting") list = list.filter((t) => t.status === "awaiting_approval");
    if (nav === "ambiguous") {
      list = list
        .filter((t) => t.ai_lane === "ambiguous" || t.status === "awaiting_approval")
        .sort((a, b) => (a.ai_lane === "ambiguous" ? 0 : 1) - (b.ai_lane === "ambiguous" ? 0 : 1));
    }
    if (nav === "assigned") {
      list = list.filter((t) => t.assigned_to === me);
    }
    for (const f of filters) {
      if (f.id === "status:open") {
        list = list.filter((t) => !["resolved", "closed", "auto_resolved"].includes(t.status));
      }
      if (f.id === "priority:p1p2") {
        list = list.filter((t) => t.priority === "P1" || t.priority === "P2");
      }
      if (f.id === "source:case-log") {
        list = list.filter(
          (t) =>
            t.id.startsWith("b1000001-") ||
            Boolean(t.ai_summary?.startsWith("BUG-")) ||
            Boolean((t.human_override as { bug_id?: string } | null)?.bug_id),
        );
      }
      if (f.id.startsWith("status:")) {
        const s = f.id.slice("status:".length);
        if (s !== "open") list = list.filter((t) => t.status === s);
      }
    }
    // Ambiguous nav keeps its lane bias; otherwise apply CS queue sort
    if (nav !== "ambiguous") {
      list = applyQueueSort(list, queueSort);
    }
    return list;
  }, [ticketsWithCaseLog, nav, filters, me, nowTick, queueSort]);

  async function invoke(name: string, body: Record<string, unknown>) {
    if (!functionsBase) throw new Error("Missing VITE_SUPABASE_URL");
    const res = await fetch(`${functionsBase}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? res.statusText);
    return data;
  }

  async function createManual() {
    if (!createMsg.trim()) return;
    setBusy(true);
    try {
      try {
        await invoke("intake-ticket", {
          client_id: WMG_CLIENT_ID,
          source_channel: "manual",
          message: createMsg.trim(),
          requester_name: createName || "WMG operator",
          requester_email: createEmail || null,
          priority: "P3",
        });
      } catch {
        // Edge may be down in local preview — insert OPEN ticket directly (FIX-C path)
        if (!supabase) throw new Error("Supabase not configured");
        const { error: insErr } = await supabase.from("support_tickets").insert({
          client_id: WMG_CLIENT_ID,
          requester_name: createName || "WMG operator",
          requester_email: createEmail || null,
          source_channel: "manual",
          raw_message: createMsg.trim(),
          ai_summary: createMsg.trim().slice(0, 120),
          status: "new",
          priority: "P3",
          ai_lane: "needs_approval",
          diagnosis_summary: null,
          surface: "internal",
        });
        if (insErr) throw insErr;
      }
      setShowCreate(false);
      setCreateMsg("");
      setNav("all");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function approveSelected() {
    if (!selected) return;
    setBusy(true);
    try {
      let handoffId: string | undefined;
      let dispatchFromEdge: unknown;
      try {
        const data = await invoke("approve-handoff", {
          ticket_id: selected.id,
          approved_by: me,
        });
        handoffId = data?.handoff_id;
        dispatchFromEdge = data?.dispatch_payload;
      } catch {
        // Local fallback: mark dispatched + emit flat-file Handoff B (staging only)
        if (supabase && !selected.id.startsWith("b1000001-")) {
          await supabase
            .from("support_tickets")
            .update({ status: "sent_to_engineering" })
            .eq("id", selected.id);
          const { data: handoff } = await supabase
            .from("engineering_handoffs")
            .insert({
              ticket_id: selected.id,
              structured_issue: {
                summary: selected.ai_summary,
                diagnosis: selected.diagnosis_summary,
                proposed_fix: selected.ai_suggested_action,
              },
              approved_by: me,
              approved_at: new Date().toISOString(),
              cursor_dispatch_status: "dispatched",
            })
            .select("id")
            .single();
          handoffId = handoff?.id;
        }
      }
      const payload = buildDispatchPayload({
        ticket_id: selected.id,
        client_id: selected.client_id,
        approved_by: me,
        title: selected.ai_summary || selected.raw_message.slice(0, 80),
        description:
          [selected.ai_suggested_action, selected.diagnosis_summary, selected.raw_message]
            .filter(Boolean)
            .join("\n\n") || selected.raw_message,
        handoff_id: handoffId,
        origin: "bug",
      });
      downloadJson(
        `dispatch-${payload.dispatch_id}-${Date.now()}.json`,
        dispatchFromEdge ?? payload,
      );
      await refresh();
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function overrideLane(newLane: string) {
    if (!selected) return;
    const reason = window.prompt("Override reason (training signal)") ?? "";
    if (!reason.trim()) return;
    setBusy(true);
    try {
      await invoke("override-classification", {
        ticket_id: selected.id,
        new_lane: newLane,
        by: me,
        reason,
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function setPriority(p: string) {
    if (!supabase || !selected) return;
    setBusy(true);
    const { error: uErr } = await supabase
      .from("support_tickets")
      .update({ priority: p })
      .eq("id", selected.id);
    if (!uErr) {
      setSelected({ ...selected, priority: p });
      await refresh();
    } else setError(uErr.message);
    setBusy(false);
  }

  async function assignTo(email: string) {
    if (!supabase || !selected) return;
    setBusy(true);
    const { error: uErr } = await supabase
      .from("support_tickets")
      .update({ assigned_to: email })
      .eq("id", selected.id);
    if (!uErr) {
      setSelected({ ...selected, assigned_to: email } as Ticket);
      await refresh();
    } else setError(uErr.message);
    setBusy(false);
  }

  async function markBillableCo() {
    if (!selected || !supabase) return;
    setBusy(true);
    try {
      await supabase
        .from("support_tickets")
        .update({ status: "billable_review", ai_lane: "billable", ai_billable: true })
        .eq("id", selected.id);
      await supabase.from("change_order_drafts").insert({
        ticket_id: selected.id,
        client_id: selected.client_id,
        description: selected.ai_summary || selected.raw_message.slice(0, 200),
        rationale: selected.ai_reasoning || "Operator marked billable",
        contract_clause_ref: selected.ai_contract_clause_ref,
        estimated_scope: selected.ai_suggested_action,
        estimated_hours: 12,
        status: "draft",
      });
      await refresh();
      setNav("change-orders");
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function markResolved() {
    if (!supabase || !selected) return;
    setBusy(true);
    const { error: uErr } = await supabase
      .from("support_tickets")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", selected.id);
    if (!uErr) {
      await supabase.rpc("log_ticket_event", {
        p_ticket_id: selected.id,
        p_event_type: "resolved",
        p_actor: "operator",
        p_payload: {},
      });
      await refresh();
      setSelected(null);
    } else setError(uErr.message);
    setBusy(false);
  }

  function emitHandoffA(co: ChangeOrder) {
    const pkg = buildHandoffA({
      change_order_id: co.id.startsWith("demo-") ? "CO-2042" : `CO-${co.id.slice(0, 8)}`,
      ticket_id: co.ticket_id,
      description: co.description,
      rationale: co.rationale,
      estimated_hours: co.estimated_hours,
      estimated_scope: co.estimated_scope,
      contract_clause_ref: co.contract_clause_ref,
    });
    const stamp = Date.now();
    downloadJson(`handoff-a-${pkg.change_order_id}-${stamp}.json`, pkg);
    downloadCsv(`handoff-a-${pkg.change_order_id}-${stamp}.csv`, [handoffAToCsvRow(pkg)]);
    if (supabase && !co.id.startsWith("demo-")) {
      void supabase
        .from("change_order_drafts")
        .update({ status: "sent" })
        .eq("id", co.id)
        .then(() => void refresh());
    }
  }

  function approveCoForBuild(co: ChangeOrder) {
    const payload = buildDispatchPayload({
      ticket_id: co.ticket_id,
      client_id: co.client_id,
      change_order_id: co.id.startsWith("demo-") ? "CO-2042" : `CO-${co.id.slice(0, 8)}`,
      approved_by: me,
      title: co.description,
      description: co.rationale,
      lift_hours: co.estimated_hours,
      origin: "change_order",
    });
    downloadJson(`dispatch-co-${payload.dispatch_id}-${Date.now()}.json`, payload);
  }

  async function addOperatorNote() {
    if (!selected || !noteDraft.trim()) return;
    const body = noteDraft.trim();
    const at = new Date().toISOString();
    setBusy(true);
    try {
      if (supabase && !selected.id.startsWith("b1000001-")) {
        const { error: eErr } = await supabase.from("ticket_events").insert({
          ticket_id: selected.id,
          event_type: "operator_note",
          actor: "operator",
          payload: { body, author: me, kind: "note" },
        });
        if (eErr) throw eErr;
        const { data } = await supabase
          .from("ticket_events")
          .select("*")
          .eq("ticket_id", selected.id)
          .order("created_at", { ascending: false });
        setEvents((data ?? []) as TicketEvent[]);
      } else {
        setLocalNotes((n) => [
          {
            id: `ln-${Date.now()}`,
            ticketId: selected.id,
            body,
            author: me,
            at,
          },
          ...n,
        ]);
      }
      setNoteDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function addFilter(chip: FilterChip) {
    setFilters((f) => (f.some((x) => x.id === chip.id) ? f : [...f, chip]));
  }

  const ticketViews: NavKey[] = ["all", "priority", "breaching", "awaiting", "ambiguous", "assigned"];
  const showTicketList = ticketViews.includes(nav);

  return (
    <div className="min-h-screen flex" style={{ background: PRIME.bg, color: PRIME.text }}>
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 border-r flex flex-col"
        style={{ background: PRIME.panel, borderColor: PRIME.border }}
      >
        <div className="px-4 py-4 border-b" style={{ borderColor: PRIME.border }}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300/80">PRIME · CS</p>
          <h1 className="text-sm font-semibold mt-0.5">Support Console</h1>
          <p className="text-[10px] mt-1" style={{ color: PRIME.muted }}>
            Async triage & route · not a live desk
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-sm">
          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Tickets
            </p>
            <div className="space-y-0.5">
              <NavBtn active={nav === "all"} label="All Tickets" count={counts.all} onClick={() => setNav("all")} />
              <NavBtn active={nav === "priority"} label="Priority" count={counts.p1} onClick={() => setNav("priority")} />
              <NavBtn
                active={nav === "breaching"}
                label="Breaching"
                count={counts.breaching}
                onClick={() => setNav("breaching")}
              />
              <NavBtn
                active={nav === "awaiting"}
                label="Awaiting Approval"
                count={counts.awaiting}
                onClick={() => setNav("awaiting")}
              />
              <NavBtn
                active={nav === "ambiguous"}
                label="Ambiguous"
                count={counts.ambiguous}
                onClick={() => setNav("ambiguous")}
              />
              <NavBtn
                active={nav === "assigned"}
                label="Assigned to me"
                count={counts.assigned}
                onClick={() => setNav("assigned")}
              />
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Modules
            </p>
            <div className="space-y-0.5">
              <NavBtn
                active={nav === "change-orders"}
                label="Change Orders"
                count={changeOrders.length}
                onClick={() => setNav("change-orders")}
              />
              <NavBtn active={nav === "clients"} label="Clients / Tenants" onClick={() => setNav("clients")} />
              <NavBtn active={nav === "kb"} label="Knowledge Base" onClick={() => setNav("kb")} />
              <NavBtn active={nav === "automations"} label="Automations" onClick={() => setNav("automations")} />
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Oversight
            </p>
            <div className="space-y-0.5">
              <NavBtn active={nav === "dashboard"} label="Dashboard" onClick={() => setNav("dashboard")} />
              <NavBtn active={nav === "audit"} label="Audit Log" onClick={() => setNav("audit")} />
              <NavBtn active={nav === "compliance"} label="Admin / Compliance" onClick={() => setNav("compliance")} />
            </div>
          </div>
        </nav>

        <div className="p-3 border-t space-y-1 text-[10px]" style={{ borderColor: PRIME.border, color: PRIME.muted }}>
          <p>
            Case log:{" "}
            <a
              href={CASE_LOG_SOURCE.github}
              target="_blank"
              rel="noreferrer"
              className="text-blue-300/90 underline underline-offset-2"
            >
              {CASE_LOG_SOURCE.path}
            </a>
          </p>
          <p>Outbox: {DISPATCH_OUTBOX_PATH}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="border-b px-4 py-2.5 flex flex-wrap items-center gap-3 justify-between"
          style={{ background: PRIME.panel, borderColor: PRIME.border }}
        >
          <p className="text-xs" style={{ color: PRIME.muted }}>
            <span className="text-slate-200 font-medium">{counts.open}</span> open ·{" "}
            <span className="text-rose-300 font-medium">{counts.p1}</span> P1 ·{" "}
            <span className="text-amber-300 font-medium">{counts.breaching}</span> breaching ·{" "}
            <span className="text-emerald-300 font-medium">{counts.auto}</span> auto-resolved · avg
            first touch {avgFirstTouch}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm"
            >
              <Plus className="w-4 h-4" /> Manual ticket
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-slate-300"
              style={{ borderColor: PRIME.border }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </header>

        {!supabaseConfigured && (
          <div className="mx-4 mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {supabaseConfigHint ??
              "Staging DB not configured — case log seed (BUG-001…) still loads. Never point at WMG OS production."}
          </div>
        )}
        {error && (
          <div className="mx-4 mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </div>
        )}
        {showTicketList && (
          <div className="mx-4 mt-3 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-xs text-slate-300">
            Case log seed:{" "}
            <span className="text-slate-100 font-medium">{CASE_LOG_SOURCE.label}</span>
            {" · "}
            <code className="text-blue-200/90">{CASE_LOG_SOURCE.path}</code>
            {" · "}
            {BUG_CASE_SEEDS.length} cases
          </div>
        )}

        {/* Filter pills */}
        {showTicketList && (
          <div className="px-4 pt-3 flex flex-wrap items-center gap-2">
            <label className="text-[11px] text-slate-400 flex items-center gap-1.5 mr-2">
              Queue
              <select
                value={queueSort}
                onChange={(e) => setQueueSort(e.target.value as QueueSort)}
                className="rounded border bg-slate-900 text-slate-200 text-[11px] px-2 py-1"
                style={{ borderColor: PRIME.border }}
                title="Standard CS queue: Priority then FIFO (oldest first within priority)"
              >
                <option value="priority_fifo">Priority → FIFO</option>
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
              </select>
            </label>
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-100"
                onClick={() => setFilters((all) => all.filter((x) => x.id !== f.id))}
              >
                {f.label} ×
              </button>
            ))}
            <button
              type="button"
              className="rounded-full border border-dashed px-2.5 py-1 text-xs text-slate-400"
              style={{ borderColor: PRIME.border }}
              onClick={() => addFilter({ id: "status:open", label: "Status: Open" })}
            >
              + Add filter
            </button>
            <button
              type="button"
              className="rounded-full border border-dashed px-2.5 py-1 text-xs text-slate-400"
              style={{ borderColor: PRIME.border }}
              onClick={() => addFilter({ id: "priority:p1p2", label: "Priority: P1–P2" })}
            >
              Priority: P1–P2
            </button>
            <button
              type="button"
              className="rounded-full border border-dashed px-2.5 py-1 text-xs text-slate-400"
              style={{ borderColor: PRIME.border }}
              onClick={() => addFilter({ id: "source:case-log", label: "Source: Case log" })}
            >
              Case log (BUG-…)
            </button>
            {filters.length > 0 && (
              <button
                type="button"
                className="text-xs text-slate-400 underline"
                onClick={() => setFilters([])}
              >
                Clear all
              </button>
            )}
          </div>
        )}


        <main className="flex-1 overflow-hidden flex min-h-0">
          {showTicketList && (
            <>
              <div className="w-[380px] shrink-0 border-r overflow-y-auto p-3 space-y-2" style={{ borderColor: PRIME.border }}>
                {visibleTickets.length === 0 && (
                  <p className="text-sm px-2 py-6 text-center" style={{ color: PRIME.muted }}>
                    No tickets in this queue — catch-net is empty (good) or filters hide items.
                  </p>
                )}
                {visibleTickets.map((t) => {
                  const sla = slaCountdown(t);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelected(t);
                        setSelectedCo(null);
                      }}
                      className={`w-full text-left rounded-lg border p-3 hover:border-blue-500/40 ${
                        selected?.id === t.id ? "border-blue-500/60" : ""
                      }`}
                      style={{
                        background: PRIME.card,
                        borderColor: selected?.id === t.id ? undefined : PRIME.border,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${priorityBadge(t.priority)}`}
                        >
                          {t.priority ?? "P?"}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-600/60 text-slate-200">
                          {stateLabel(t)}
                        </span>
                        {t.escalation_flag && (
                          <AlertTriangle className="w-3 h-3 text-rose-400 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-2">
                        {t.ai_summary || t.raw_message}
                      </p>
                      <p className={`text-[11px] mt-1.5 font-medium ${slaToneClass(sla.tone)}`}>
                        {sla.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {!selected && (
                  <div className="h-full flex items-center justify-center text-sm" style={{ color: PRIME.muted }}>
                    Select a ticket — every escalated item lands here (Phase 1 catch-net).
                  </div>
                )}
                {selected && (
                  <div className="max-w-2xl space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${priorityBadge(selected.priority)}`}>
                            {selected.priority ?? "P?"}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-600/60">
                            {stateLabel(selected)}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold">
                          {selected.ai_summary || "Ticket detail"}
                        </h2>
                        <p className="text-xs mt-1" style={{ color: PRIME.muted }}>
                          {new Date(selected.created_at).toLocaleString()} · {selected.source_channel}
                          {selected.surface ? ` · ${selected.surface}` : ""}
                          {(selected.human_override as { bug_id?: string } | null)?.bug_id
                            ? ` · case log ${(selected.human_override as { bug_id: string }).bug_id}`
                            : ""}
                        </p>
                      </div>
                      <p className={`text-sm font-medium ${slaToneClass(slaCountdown(selected).tone)}`}>
                        {slaCountdown(selected).label}
                      </p>
                    </div>

                    <section>
                      <p className="text-[10px] font-semibold uppercase" style={{ color: PRIME.muted }}>
                        Request
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{selected.raw_message}</p>
                    </section>

                    {selected.diagnosis_summary ? (
                      <section className="rounded-lg border border-sky-800/50 bg-sky-950/30 p-3">
                        <p className="text-[10px] font-semibold uppercase text-sky-300/80">
                          Bricely diagnosis
                        </p>
                        <p className="mt-1 text-sm text-sky-50 whitespace-pre-wrap">
                          {selected.diagnosis_summary}
                        </p>
                      </section>
                    ) : (
                      <section className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Bricely diagnosis
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          No diagnosis on this item (manual / imported / never chatted). Triage and
                          Approve → dispatch still work from the request text.
                        </p>
                      </section>
                    )}

                    <section className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] font-semibold uppercase" style={{ color: PRIME.muted }}>
                          Classification (internal)
                        </p>
                        <p className="mt-1">
                          {selected.ai_lane ?? "—"} · {selected.ai_category ?? "—"} · conf{" "}
                          {selected.ai_confidence != null
                            ? Number(selected.ai_confidence).toFixed(2)
                            : "—"}
                        </p>
                        {selected.ai_contract_clause_ref && (
                          <p className="text-xs mt-1 text-violet-200">{selected.ai_contract_clause_ref}</p>
                        )}
                        {selected.ai_billable != null && (
                          <p className="text-xs mt-0.5" style={{ color: PRIME.muted }}>
                            Billable (internal): {selected.ai_billable ? "yes" : "no"}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase" style={{ color: PRIME.muted }}>
                          Suggested action
                        </p>
                        <p className="mt-1 whitespace-pre-wrap">{selected.ai_suggested_action ?? "—"}</p>
                      </div>
                    </section>

                    <section>
                      <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: PRIME.muted }}>
                        Priority
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(["P1", "P2", "P3", "P4"] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            disabled={busy}
                            onClick={() => void setPriority(p)}
                            className={`text-[10px] font-bold px-2 py-1 rounded ${
                              selected.priority === p ? priorityBadge(p) : "border border-slate-600 text-slate-300"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: PRIME.muted }}>
                        Assign
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {OPERATORS.map((op) => (
                          <button
                            key={op}
                            type="button"
                            disabled={busy}
                            onClick={() => void assignTo(op)}
                            className={`text-[10px] px-2 py-1 rounded border ${
                              (selected as Ticket & { assigned_to?: string }).assigned_to === op
                                ? "bg-blue-600 border-blue-500"
                                : "border-slate-600 text-slate-300"
                            }`}
                          >
                            {op.split("@")[0]}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: PRIME.muted }}>
                        Override lane
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {LANES.map((lane) => (
                          <button
                            key={lane}
                            type="button"
                            disabled={busy}
                            onClick={() => void overrideLane(lane)}
                            className="text-[10px] uppercase font-semibold px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
                          >
                            {lane}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: PRIME.muted }}>
                        Operator notes
                      </p>
                      <div className="space-y-2">
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          rows={2}
                          placeholder="Observation, decision, or instructed action…"
                          className="w-full rounded-lg border bg-slate-950/40 px-2 py-1.5 text-sm"
                          style={{ borderColor: PRIME.border }}
                        />
                        <button
                          type="button"
                          disabled={busy || !noteDraft.trim()}
                          onClick={() => void addOperatorNote()}
                          className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs disabled:opacity-40"
                        >
                          Add note (timestamped · {me.split("@")[0]})
                        </button>
                        <ul className="space-y-1.5 text-xs">
                          {localNotes
                            .filter((n) => n.ticketId === selected.id)
                            .map((n) => (
                              <li
                                key={n.id}
                                className="rounded border px-2 py-1.5"
                                style={{ borderColor: PRIME.border }}
                              >
                                <p className="text-slate-200 whitespace-pre-wrap">{n.body}</p>
                                <p className="mt-0.5" style={{ color: PRIME.muted }}>
                                  {n.author} · {new Date(n.at).toLocaleString()}
                                </p>
                              </li>
                            ))}
                          {events
                            .filter((ev) => ev.event_type === "operator_note")
                            .map((ev) => (
                              <li
                                key={ev.id}
                                className="rounded border px-2 py-1.5"
                                style={{ borderColor: PRIME.border }}
                              >
                                <p className="text-slate-200 whitespace-pre-wrap">
                                  {String((ev.payload as { body?: string })?.body ?? "")}
                                </p>
                                <p className="mt-0.5" style={{ color: PRIME.muted }}>
                                  {String((ev.payload as { author?: string })?.author ?? ev.actor)} ·{" "}
                                  {new Date(ev.created_at).toLocaleString()}
                                </p>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </section>

                    <section>
                      <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: PRIME.muted }}>
                        Audit / timestamps
                      </p>
                      <ul className="space-y-1 text-xs" style={{ color: PRIME.muted }}>
                        <li>Created {new Date(selected.created_at).toLocaleString()}</li>
                        <li>Updated {new Date(selected.updated_at).toLocaleString()}</li>
                        {events.map((ev) => (
                          <li key={ev.id}>
                            {ev.event_type} · {ev.actor} · {new Date(ev.created_at).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: PRIME.border }}>
                      <button
                        type="button"
                        disabled={busy || selected.status !== "awaiting_approval"}
                        onClick={() => void approveSelected()}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm disabled:opacity-40"
                      >
                        <Download className="w-4 h-4" /> Approve → Handoff B
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void markBillableCo()}
                        className="rounded-lg border border-violet-500/50 px-3 py-1.5 text-sm text-violet-200 disabled:opacity-40"
                      >
                        → Change order
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void markResolved()}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 px-3 py-1.5 text-sm text-emerald-200 disabled:opacity-40"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Resolve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {nav === "change-orders" && (
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-lg font-semibold mb-1">Change orders / quotes</h2>
              <p className="text-xs mb-4" style={{ color: PRIME.muted }}>
                Billable pipeline — Emit Handoff A (JSON+CSV). Internal $ = not the quote. Accepted →
                Handoff B.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {changeOrders.map((co) => {
                  const total = Number(co.estimated_hours ?? 12);
                  const snr = Math.round(total * 0.67);
                  const dataH = Math.max(0, total - snr);
                  return (
                    <div
                      key={co.id}
                      className="rounded-xl border p-4 space-y-2"
                      style={{ background: PRIME.card, borderColor: PRIME.border }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-200">
                          {co.status}
                        </span>
                        <span className="text-xs" style={{ color: PRIME.muted }}>
                          {new Date(co.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{co.description}</p>
                      <p className="text-xs" style={{ color: PRIME.muted }}>
                        {co.contract_clause_ref ?? "—"}
                      </p>
                      <div className="rounded-lg bg-black/20 p-2 text-xs space-y-1">
                        <p className="font-semibold text-slate-300">Lift assessment</p>
                        <p>
                          snr {snr}h · ai 0 · sec 0 · data {dataH}h · <strong>total {total}h</strong>
                        </p>
                        <p style={{ color: PRIME.muted }}>{co.estimated_scope ?? co.rationale}</p>
                        <p className="text-amber-200/90">
                          Internal est. ${total * 150}–${total * 250} — not the quote
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCo(co);
                            emitHandoffA(co);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs text-white"
                        >
                          <Download className="w-3.5 h-3.5" /> Emit handoff A
                        </button>
                        <button
                          type="button"
                          disabled={co.status !== "accepted" && !co.id.startsWith("demo-")}
                          onClick={() => approveCoForBuild(co)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                        >
                          Approve for build → B
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedCo && (
                <p className="text-xs mt-3 text-slate-400">
                  Last focused: {selectedCo.description}
                </p>
              )}
            </div>
          )}

          {(nav === "clients" ||
            nav === "kb" ||
            nav === "automations" ||
            nav === "dashboard" ||
            nav === "audit" ||
            nav === "compliance") && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md text-center space-y-2">
                {nav === "dashboard" && <LayoutDashboard className="w-8 h-8 mx-auto text-slate-500" />}
                {nav === "audit" && <ScrollText className="w-8 h-8 mx-auto text-slate-500" />}
                {nav === "clients" && <Users className="w-8 h-8 mx-auto text-slate-500" />}
                <h2 className="text-lg font-semibold capitalize">{nav.replace("-", " ")}</h2>
                <p className="text-sm" style={{ color: PRIME.muted }}>
                  Phase 2 stub — shell nav only. Phase 1 catch-net is Tickets + Change Orders.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="rounded-xl shadow-xl w-full max-w-lg p-4 space-y-3" style={{ background: PRIME.panel }}>
            <h3 className="font-semibold">Manual ticket (lands in catch-net)</h3>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-900 border-slate-600"
              placeholder="Requester name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-900 border-slate-600"
              placeholder="Requester email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px] bg-slate-900 border-slate-600"
              placeholder="Support request (untrusted data)"
              value={createMsg}
              onChange={(e) => setCreateMsg(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-1.5 text-sm text-slate-300" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
                onClick={() => void createManual()}
              >
                Create & classify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
