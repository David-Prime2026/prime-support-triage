/**
 * Live WMG widget adapter for DR-CS-PLATFORM-008.
 *
 * Drop-in for production `wCe({ text, state, newAttachments })`.
 * Same input/output so wmg-backend can deploy this function to
 * rxhiydtqzmksaeegxyqo and the embed can swap one fetch for the checklist.
 *
 * Preserves product verbs (new chat, open ticket, welcome-name live fix,
 * accounting coming-soon). Replaces the canned ask → screenshot → clear-filters
 * → hard-8 script with comprehension-led policy.
 */
import {
  diagnose,
  type ChatMessage,
  type DiagState,
  type DiagnoseAction,
} from "./bricelyDiagnose.ts";

export type LivePhase =
  | "assess"
  | "ask_screen"
  | "ask_evidence"
  | "clarify"
  | "guide_safe"
  | "resolved"
  | "escalate"
  | "wrap_up";

export type LiveDiagState = {
  exchanges: number;
  phase: LivePhase;
  screen?: string;
  triedSafeStep: boolean;
  expectedAsked: boolean;
  softTipDone: boolean;
  introAcked: boolean;
  openTicketId: string | null;
  awaitingAnythingElse: boolean;
  attachments: unknown[];
  notes: string[];
};

export type LiveAttachment = {
  name?: string;
  kind?: string;
  type?: string;
  visionSummary?: string;
};

export type LiveDiagnoseInput = {
  text: string;
  state?: Partial<LiveDiagState>;
  newAttachments?: LiveAttachment[];
};

export type LiveTerminal =
  | "continue"
  | "escalate"
  | "resolved_live"
  | "reset_chat"
  | "close_chat"
  | "live_fix";

export type LiveDiagnoseResult = {
  reply: string;
  next: LiveDiagState;
  terminal: LiveTerminal;
  cardStatus?: string;
  liveFix?: { kind: "display_name"; desiredName: string };
  action: DiagnoseAction | "reset_chat" | "close_chat" | "live_fix" | "open_ticket";
  internal_reason: string;
  append_to_ticket_id?: string;
};

const NEW_CHAT =
  /\b(new (chat|conversation|thread)|start over|start (a )?new|reset (chat|conversation)|clear (chat|conversation)|different (issue|problem))\b/i;
const OPEN_TICKET =
  /\b(open ticket|open case|open a (ticket|case)|just open|escalate( now)?|talk to (a )?(human|agent|person)|agent please|need (a )?human)\b/i;
const WELCOME_NAME =
  /\b(change|update|rename|set|customise|customize|prefer|want).{0,50}\b(name|welcome|greeting|title|label|display|intro)\b|\bwelcome\s+[A-Za-z]/i;
const HOW_TO_EXISTING =
  /\b((reset\s+)?password|log\s*in|sign[\s-]?in|resend(\s+notification)?)\b/i;
const PROBLEMISH =
  /\b(broken|not working|wrong|weird|issue|problem|help|stuck|can'?t|doesn'?t work|something'?s off|doesn'?t|wont|won'?t)\b/i;
const YES =
  /\b(yes|yep|yeah|ok|okay|sure|works|sounds good|go ahead|that works|fine|alright|absolutely|keep (going|digging)|continue)\b/i;
const NO_MORE =
  /\b(no|nope|nothing|all good|that'?s all|thats all|i'?m good|im good|no thanks|all set|i'?m (all )?set|we'?re good|done|goodbye|bye)\b/i;
const STILL_BROKEN =
  /\b(still|didn'?t help|same|no change|already tried|tried that|didn'?t work|not fixed|nope|didn'?t change)\b/i;
const NO_SHOT =
  /\b(don'?t have|no screenshot|can'?t (attach|send|share)|no (pic|image|pdf)|nothing to attach|skip that)\b/i;
const ACCOUNTING =
  /\b(aging|statement|invoice|ar\b|accounts?\s*receivable|payment\s*match|remittance|accounting)\b/i;
const STOP_WORDS =
  /^(home|name|welcome|display|intro|greeting|title|label|screen|page|ticket|case|help|please|thanks|thank|here|there|this|that|change|update|rename|to|as|be|my|the)$/i;

const ACCOUNTING_REPLY =
  "That part of the system is still being finalized — I've noted what you need and routed it to the team. You'll hear back within 24 hours.";
const CLOSE_REPLY = "Sounds good — I'm closing this chat. Tap Support anytime if you need me again.";
const TIP =
  "If you'd rather open a ticket after a couple questions, say \"open ticket\" and I'll escalate.";

function emptyLive(): LiveDiagState {
  return {
    exchanges: 0,
    phase: "assess",
    triedSafeStep: false,
    expectedAsked: false,
    softTipDone: false,
    introAcked: false,
    openTicketId: null,
    awaitingAnythingElse: false,
    attachments: [],
    notes: [],
  };
}

function normalizeLive(raw?: Partial<LiveDiagState>): LiveDiagState {
  const t = emptyLive();
  if (!raw || typeof raw !== "object") return t;
  const phase = raw.phase;
  const ok =
    phase === "assess" ||
    phase === "ask_screen" ||
    phase === "ask_evidence" ||
    phase === "clarify" ||
    phase === "guide_safe" ||
    phase === "resolved" ||
    phase === "escalate" ||
    phase === "wrap_up";
  return {
    exchanges: typeof raw.exchanges === "number" && raw.exchanges >= 0 ? raw.exchanges : 0,
    phase: ok ? phase : "assess",
    screen: typeof raw.screen === "string" ? raw.screen : undefined,
    triedSafeStep: !!raw.triedSafeStep,
    expectedAsked: !!raw.expectedAsked,
    softTipDone: !!raw.softTipDone,
    introAcked: !!raw.introAcked,
    openTicketId: typeof raw.openTicketId === "string" ? raw.openTicketId : null,
    awaitingAnythingElse: !!raw.awaitingAnythingElse || phase === "wrap_up",
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    notes: Array.isArray(raw.notes) ? raw.notes.map(String) : [],
  };
}

function inferScreen(text: string): string | undefined {
  const m = text.match(
    /\b(load\s*management|load board|board|portal|settings|memo|aging|statement|login|filter|delivery|confirm|tonnage|home|requests?)\b/i,
  );
  return m ? m[1].toLowerCase() : undefined;
}

function extractWelcomeName(text: string): string | null {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return null;
  const pats = [
    /\bwelcome(?:\s+back)?\s+(?:to\s+say\s+)?["']?([A-Za-z][A-Za-z'-]{0,40})["']?/gi,
    /\b(?:say|read|show|display)\s+["']?([A-Za-z][A-Za-z'-]{0,40})["']?/gi,
    /\b(?:name\s+to|to|as|be)\s+["']?([A-Za-z][A-Za-z'-]{0,40})["']?/gi,
    /^([A-Za-z][A-Za-z'-]{0,40})$/i,
  ];
  for (const p of pats) {
    let m: RegExpExecArray | null;
    const re = new RegExp(p.source, p.flags.includes("g") ? p.flags : `${p.flags}g`);
    while ((m = re.exec(t))) {
      const o = m[1]?.trim();
      if (o && !STOP_WORDS.test(o)) return o.charAt(0).toUpperCase() + o.slice(1);
    }
  }
  return null;
}

function withTip(reply: string, exchanges: number): string {
  if (exchanges < 2 || /open ticket/i.test(reply)) return reply;
  return `${reply}\n\n${TIP}`;
}

function liveOut(
  next: LiveDiagState,
  reply: string,
  terminal: LiveTerminal,
  action: LiveDiagnoseResult["action"],
  internal_reason: string,
  extra: Partial<LiveDiagnoseResult> = {},
): LiveDiagnoseResult {
  return {
    reply: terminal === "continue" ? withTip(reply, next.exchanges) : reply,
    next,
    terminal,
    action,
    internal_reason,
    ...extra,
  };
}

function phaseFor(action: DiagnoseAction): LivePhase {
  switch (action) {
    case "request_evidence":
      return "ask_evidence";
    case "safe_step":
      return "guide_safe";
    case "escalate":
      return "escalate";
    case "resolve":
    case "answer":
      return "resolved";
    case "offer_continue_or_ticket":
      return "wrap_up";
    default:
      return "clarify";
  }
}

function terminalFor(action: DiagnoseAction): LiveTerminal {
  if (action === "escalate") return "escalate";
  if (action === "resolve") return "resolved_live";
  return "continue";
}

/**
 * Production widget entry — same contract as live `wCe`.
 */
export function diagnoseLiveTurn(input: LiveDiagnoseInput): LiveDiagnoseResult {
  const prior = normalizeLive(input.state);
  const text = String(input.text ?? "").trim();
  const incoming = input.newAttachments ?? [];
  const attachments = [...prior.attachments, ...incoming];
  const notes = [...prior.notes];
  if (text) notes.push(text);
  for (const a of incoming) {
    if (a.visionSummary) notes.push(a.visionSummary);
  }
  const screen = inferScreen(text) || prior.screen;
  const next: LiveDiagState = {
    ...prior,
    exchanges: prior.exchanges + 1,
    attachments,
    notes,
    screen,
    introAcked: prior.introAcked || YES.test(text) || text.length > 12 || incoming.length > 0,
  };

  if (NEW_CHAT.test(text)) {
    return {
      reply: "Sure — starting a fresh conversation. What can I help with?",
      next: emptyLive(),
      terminal: "reset_chat",
      action: "reset_chat",
      internal_reason: "new_chat",
    };
  }

  if (prior.awaitingAnythingElse || prior.phase === "wrap_up") {
    if (OPEN_TICKET.test(text)) {
      return liveOut(
        { ...next, phase: "escalate", awaitingAnythingElse: false },
        notes.length > 0
          ? "Opening a ticket with what we've covered — I've passed this to our specialist team. You'll hear back within 24 hours."
          : "Opening a ticket — I've passed this to our specialist team. You'll hear back within 24 hours. Reply here anytime with more detail.",
        "escalate",
        "open_ticket",
        "offramp_open_ticket",
        { cardStatus: "In progress" },
      );
    }
    if (NO_MORE.test(text) && text.length < 48) {
      return {
        reply: CLOSE_REPLY,
        next: emptyLive(),
        terminal: "close_chat",
        action: "close_chat",
        internal_reason: "wrap_up_close",
      };
    }
    if (YES.test(text) && text.length < 48) {
      return liveOut(
        { ...next, phase: "assess", awaitingAnythingElse: false, expectedAsked: false, softTipDone: false },
        "Okay — what's next?",
        "continue",
        "clarify",
        "wrap_up_continue",
      );
    }
    // Fall through — they added more diagnostic detail.
    next.awaitingAnythingElse = false;
  }

  if (OPEN_TICKET.test(text)) {
    if (prior.openTicketId) {
      return liveOut(
        { ...next, phase: "escalate" },
        "That ticket is already open. Tell me what else to add to it — I am still here. Tap New chat only for a different issue.",
        "continue",
        "open_ticket",
        "ticket_already_open",
        { append_to_ticket_id: prior.openTicketId },
      );
    }
    return liveOut(
      { ...next, phase: "escalate", introAcked: true },
      notes.length > 0 || attachments.length > 0
        ? "Opening a ticket with what we've covered — I've passed this to our specialist team. You'll hear back within 24 hours."
        : "Opening a ticket — I've passed this to our specialist team. You'll hear back within 24 hours. Reply here anytime with more detail.",
      "escalate",
      "open_ticket",
      "user_open_ticket",
      { cardStatus: "In progress" },
    );
  }

  if (prior.openTicketId) {
    if (NO_MORE.test(text) && text.length < 48) {
      return liveOut(
        { ...next, phase: "escalate" },
        "You're all set — we have the ticket. I'll stay on this chat if you think of more.",
        "continue",
        "escalate",
        "ticket_followup_thanks",
      );
    }
    return liveOut(
      { ...next, phase: "escalate" },
      "I've added that to your open ticket. Keep talking here if there's more — or tap New chat for a different issue.",
      "continue",
      "clarify",
      "ticket_followup_accepted",
      { append_to_ticket_id: prior.openTicketId },
    );
  }

  if (ACCOUNTING.test(text)) {
    return liveOut(
      { ...next, phase: "escalate", screen: next.screen ?? "accounting" },
      ACCOUNTING_REPLY,
      "escalate",
      "escalate",
      "accounting_coming_soon",
      { cardStatus: "In progress" },
    );
  }

  if (WELCOME_NAME.test(text) || (next.expectedAsked && WELCOME_NAME.test(notes.join(" ")))) {
    const name = extractWelcomeName(text) || [...notes].reverse().map(extractWelcomeName).find(Boolean) || null;
    if (name) {
      return {
        reply: `On it — updating your home welcome to ${name}.`,
        next: {
          ...next,
          phase: "wrap_up",
          expectedAsked: true,
          screen: next.screen ?? "home",
          awaitingAnythingElse: true,
        },
        terminal: "live_fix",
        cardStatus: "Resolved",
        liveFix: { kind: "display_name", desiredName: name },
        action: "live_fix",
        internal_reason: "welcome_name_live_fix",
      };
    }
    return liveOut(
      { ...next, phase: "clarify", expectedAsked: true, screen: next.screen ?? "home" },
      "I can update your home welcome name right now. What should it say — for example, Dave?",
      "continue",
      "clarify",
      "welcome_name_ask",
    );
  }

  // Existing-capability how-to (login/reset/navigate) — resolve live, no gauntlet.
  if (HOW_TO_EXISTING.test(text) && !PROBLEMISH.test(text) && !/\brefresh\b/i.test(text)) {
    return liveOut(
      { ...next, phase: "resolved" },
      "I've got this handled. Try that path again — if anything still looks off, reply here and I'll dig in.",
      "resolved_live",
      "resolve",
      "existing_capability_how_to",
      { cardStatus: "Resolved" },
    );
  }

  if (prior.softTipDone && STILL_BROKEN.test(text)) {
    return liveOut(
      { ...next, phase: "escalate", triedSafeStep: true },
      "Got it — thanks for trying that. I've passed this to our specialist team with what we've already checked. You'll hear back within 24 hours.",
      "escalate",
      "escalate",
      "safe_step_failed",
      { cardStatus: "In progress" },
    );
  }

  const messages: ChatMessage[] = notes.map((n) => ({ role: "user" as const, text: n }));
  if (incoming.length) {
    const last = messages[messages.length - 1];
    if (last) last.attachments = incoming.map((a) => ({ kind: a.kind, type: a.type, name: a.name }));
  }

  const priorPolicy: Partial<DiagState> = {
    known_facts: {
      surface: screen,
      has_screenshot: attachments.length > 0,
      screenshot_requested: prior.phase === "ask_evidence" || prior.expectedAsked,
      already_cleared_filters: prior.softTipDone && STILL_BROKEN.test(text) ? true : undefined,
    },
    asked_keys: [
      ...(prior.expectedAsked ? ["problem"] : []),
      ...(prior.screen ? ["surface"] : []),
      ...(prior.phase === "ask_evidence" ? ["screenshot"] : []),
    ],
    safe_steps_offered: prior.softTipDone || prior.triedSafeStep ? ["clear_filters"] : [],
    user_turns: next.exchanges,
    evidence_requested_count: prior.phase === "ask_evidence" ? 1 : 0,
  };

  if (NO_SHOT.test(text)) {
    priorPolicy.asked_keys = [...(priorPolicy.asked_keys ?? []), "screenshot"];
    priorPolicy.evidence_requested_count = 1;
  }

  const result = diagnose({
    messages,
    diag_state: priorPolicy,
  });

  next.phase = phaseFor(result.action);
  next.expectedAsked = next.expectedAsked || result.action === "clarify" || result.action === "request_evidence";
  if (result.action === "safe_step") {
    next.softTipDone = true;
    next.triedSafeStep = true;
  }
  if (result.action === "offer_continue_or_ticket") {
    next.awaitingAnythingElse = true;
    next.phase = "wrap_up";
  }
  if (result.action === "escalate") {
    next.phase = "escalate";
  }

  const terminal = terminalFor(result.action);
  return liveOut(next, result.reply, terminal, result.action, result.internal_reason, {
    cardStatus: result.action === "escalate" ? "In progress" : result.action === "resolve" ? "Resolved" : undefined,
  });
}
