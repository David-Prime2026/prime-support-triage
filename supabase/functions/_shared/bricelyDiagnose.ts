/**
 * Comprehension-led diagnostic policy for Bricely (DR-CS-PLATFORM-008).
 *
 * The conversation is driven by what the user already said — not a fixed
 * ask → screenshot → clear-filters → cap script. Screenshot, clarify, and
 * safe steps are optional tools, used only when justified.
 *
 * Customer-facing replies must never mention SLA, billable, coverage,
 * severity, contract language, or this file.
 */

export type ChatRole = "user" | "bricely" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  text: string;
  attachments?: Array<{ kind?: string; type?: string; name?: string }>;
};

export type KnownFacts = {
  problem?: string;
  surface?: string;
  already_cleared_filters?: boolean;
  already_refreshed?: boolean;
  already_relogged?: boolean;
  has_screenshot?: boolean;
  screenshot_requested?: boolean;
  accounting?: boolean;
  how_to?: boolean;
  login?: boolean;
  visual?: boolean;
  stale_or_filter?: boolean;
  complete_report?: boolean;
};

export type DiagState = {
  known_facts: KnownFacts;
  asked_keys: string[];
  safe_steps_offered: string[];
  user_turns: number;
  evidence_requested_count: number;
  last_action?: string;
};

export type DiagnoseAction =
  | "answer"
  | "clarify"
  | "request_evidence"
  | "safe_step"
  | "resolve"
  | "escalate"
  | "offer_continue_or_ticket";

export type DiagnoseInput = {
  messages: ChatMessage[];
  diag_state?: Partial<DiagState>;
  diagnostic_turn_cap?: number;
  diagnostic_soft_backstop?: number;
};

export type DiagnoseResult = {
  action: DiagnoseAction;
  reply: string;
  safe_step?: { id: string; label: string; instructions: string };
  diag_state: DiagState;
  escalate: boolean;
  internal_reason: string;
};

export const DEFAULT_TURN_TARGET = 5;
export const DEFAULT_SOFT_BACKSTOP = 12;

const FILTER_CLEARED =
  /\b(already\s+)?(cleared|reset|removed|turned\s+off)\b.{0,40}\bfilters?\b|\bfilters?\b.{0,40}\b(already\s+)?(cleared|reset|removed|off|none)\b/i;
const REFRESHED =
  /\b(already\s+)?(hard\s+)?refresh(ed)?\b|\bctrl\s*\+?\s*shift\s*\+?\s*r\b|\breloaded\b/i;
const RELOGGED =
  /\b(logged\s+(out|back|in)|signed\s+(out|back|in)|re-?logg?ed|re-?login)\b/i;
const SCREENSHOT_TALK =
  /\b(screenshot|screen\s*shot|i\s+attached|attached\s+(a\s+)?(photo|image|pic)|here'?s\s+(a\s+)?(pic|photo|image))\b/i;
const ACCOUNTING =
  /\b(account(ing|s)|invoice|invoic(e|ing)|aging|statement|a\/?r\b|a\/?p\b|receivable|payable)\b/i;
const HOW_TO =
  /\b(how\s+do\s+i|how\s+to|where\s+(is|do|can)|can\s+i|show\s+me\s+how|help\s+me\s+(find|export|download|create))\b/i;
const LOGIN =
  /\b(log\s*in|login|sign\s*in|password|locked\s+out|can'?t\s+access(\s+my\s+account)?)\b/i;
const VISUAL =
  /\b(missing|blank|overlap|layout|button|icon|css|display|doesn'?t\s+show|not\s+showing|cut\s+off|garbled)\b/i;
const STALE_OR_FILTER =
  /\b(load\s*board|loads?|filter|stale|yesterday|old\s+data|not\s+updat|still\s+show|wrong\s+list)\b/i;
const GREETING_ONLY = /^(hi|hey|hello|yo|sup|good\s+(morning|afternoon|evening)|help|help\s+me)[\s!.]*$/i;

function norm(text: string): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function isUser(role: string): boolean {
  return role === "user";
}

function isBricely(role: string): boolean {
  return role === "bricely" || role === "assistant";
}

function hasImageAttachment(msg: ChatMessage): boolean {
  return (msg.attachments ?? []).some((a) => {
    const t = `${a.kind ?? ""} ${a.type ?? ""} ${a.name ?? ""}`.toLowerCase();
    return /image|png|jpe?g|gif|webp|screenshot|pic/.test(t);
  });
}

function lastUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isUser(messages[i].role)) return norm(messages[i].text);
  }
  return "";
}

function inferSurface(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/load\s*board/.test(t)) return "load_board";
  if (LOGIN.test(t)) return "login";
  if (ACCOUNTING.test(t)) return "accounting";
  if (/\bfilter/.test(t)) return "filters";
  if (/\brate\s*confirm/.test(t)) return "rate_confirm";
  if (/\bsettings?\b/.test(t)) return "settings";
  return undefined;
}

function looksCompleteReport(text: string, facts: KnownFacts): boolean {
  if (text.length < 36) return false;
  if (GREETING_ONLY.test(text)) return false;
  const hasWhat = /\b(shows?|showing|missing|can'?t|cannot|won'?t|still|broken|wrong|error|fail)\b/i.test(
    text,
  );
  const hasWhere = Boolean(facts.surface) || /\b(on|in|page|screen|board|modal|view)\b/i.test(text);
  return hasWhat && hasWhere;
}

export function extractFacts(messages: ChatMessage[], prior: KnownFacts = {}): KnownFacts {
  const facts: KnownFacts = { ...prior };
  const userBits: string[] = [];

  for (const msg of messages) {
    const text = norm(msg.text);
    if (isBricely(msg.role) && /screenshot|photo of (the )?screen/i.test(text)) {
      facts.screenshot_requested = true;
    }
    if (!isUser(msg.role)) continue;
    userBits.push(text);
    if (hasImageAttachment(msg) || SCREENSHOT_TALK.test(text)) facts.has_screenshot = true;
    if (FILTER_CLEARED.test(text)) facts.already_cleared_filters = true;
    if (REFRESHED.test(text)) facts.already_refreshed = true;
    if (RELOGGED.test(text)) facts.already_relogged = true;
    if (ACCOUNTING.test(text)) facts.accounting = true;
    if (HOW_TO.test(text)) facts.how_to = true;
    if (LOGIN.test(text)) facts.login = true;
    if (VISUAL.test(text)) facts.visual = true;
    if (STALE_OR_FILTER.test(text)) facts.stale_or_filter = true;
    const surface = inferSurface(text);
    if (surface) facts.surface = facts.surface ?? surface;
  }

  const latest = userBits[userBits.length - 1] ?? "";
  if (latest && !GREETING_ONLY.test(latest)) {
    facts.problem = facts.problem && facts.problem.length > latest.length ? facts.problem : latest;
  }
  facts.complete_report = looksCompleteReport(latest, facts) || Boolean(facts.complete_report);
  return facts;
}

function emptyState(): DiagState {
  return {
    known_facts: {},
    asked_keys: [],
    safe_steps_offered: [],
    user_turns: 0,
    evidence_requested_count: 0,
  };
}

function mergeState(prior: Partial<DiagState> | undefined, messages: ChatMessage[]): DiagState {
  const base = emptyState();
  const userTurns = messages.filter((m) => isUser(m.role) && norm(m.text)).length;
  const facts = extractFacts(messages, prior?.known_facts ?? {});
  return {
    known_facts: facts,
    asked_keys: [...(prior?.asked_keys ?? [])],
    safe_steps_offered: [...(prior?.safe_steps_offered ?? [])],
    user_turns: Math.max(userTurns, prior?.user_turns ?? 0),
    evidence_requested_count: prior?.evidence_requested_count ?? 0,
    last_action: prior?.last_action,
  };
}

function markAsked(state: DiagState, key: string) {
  if (!state.asked_keys.includes(key)) state.asked_keys.push(key);
}

function alreadyAsked(state: DiagState, key: string): boolean {
  return state.asked_keys.includes(key);
}

function offerStep(
  state: DiagState,
  id: string,
  label: string,
  instructions: string,
): DiagnoseResult["safe_step"] {
  if (!state.safe_steps_offered.includes(id)) state.safe_steps_offered.push(id);
  return { id, label, instructions };
}

function finish(
  state: DiagState,
  action: DiagnoseAction,
  reply: string,
  internal_reason: string,
  extra: Partial<DiagnoseResult> = {},
): DiagnoseResult {
  state.last_action = action;
  return {
    action,
    reply,
    diag_state: state,
    escalate: action === "escalate",
    internal_reason,
    ...extra,
  };
}

function howToAnswer(text: string, facts: KnownFacts): string {
  const surface = (facts.surface ?? "").toLowerCase().replace(/\s+/g, "_");
  const isLoadBoard = surface === "load_board" || surface === "board" || /load\s*board/.test(text);
  if (isLoadBoard && /export|csv|download/i.test(text)) {
    return "On the load board, look for the export / download control on that view, pick CSV, and save the file. If you do not see export on your screen, tell me which surface you are on (internal, buyer, or seller) and I will take it from there.";
  }
  if (facts.login) {
    return "Use the sign-in screen with the email on the account, then reset the password from that same screen if it does not accept the current one. If you are still blocked after that, I will pass it to the team with what you already tried.";
  }
  return "I can walk that through with the product as it exists today. Tell me which screen you are on if this is not the one I think you mean — otherwise I will keep going from what you already described.";
}

/**
 * Decide the next Bricely turn from the conversation so far.
 */
export function diagnose(input: DiagnoseInput): DiagnoseResult {
  const messages = input.messages ?? [];
  const state = mergeState(input.diag_state, messages);
  const facts = state.known_facts;
  const latest = lastUserText(messages);
  const target = input.diagnostic_turn_cap ?? DEFAULT_TURN_TARGET;
  const backstop = input.diagnostic_soft_backstop ?? DEFAULT_SOFT_BACKSTOP;

  if (!latest) {
    return finish(
      state,
      "clarify",
      "I’m here — what is getting in your way?",
      "empty_user_turn",
    );
  }

  if (facts.accounting) {
    return finish(
      state,
      "escalate",
      "Accounting, statements, and invoicing are still being finalized — I do not want to pretend that area is finished. I am passing this to the specialist team, and you will hear back within 24 hours.",
      "accounting_coming_soon",
      { escalate: true },
    );
  }

  if (state.user_turns >= backstop) {
    return finish(
      state,
      "escalate",
      "I have enough to get a specialist on this instead of keeping you in a loop. I am passing it along — you will hear back within 24 hours.",
      "soft_backstop",
      { escalate: true },
    );
  }

  const canCloseNow =
    Boolean(facts.how_to && (facts.complete_report || facts.surface || facts.login)) ||
    Boolean(facts.complete_report && !facts.visual && !facts.stale_or_filter && !facts.login);

  if (state.user_turns >= target && !canCloseNow && state.last_action !== "offer_continue_or_ticket") {
    return finish(
      state,
      "offer_continue_or_ticket",
      "We can keep digging together, or I can pass this to the specialist team now with everything you have already told me so you hear back within 24 hours. Which would you like?",
      "turn_target_offramp",
    );
  }

  if (GREETING_ONLY.test(latest) && !facts.complete_report) {
    markAsked(state, "problem");
    return finish(
      state,
      "clarify",
      "Hi — I can help. What is going wrong, and which screen are you on?",
      "greeting",
    );
  }

  if (facts.how_to && (facts.complete_report || facts.surface || /export|csv|download|find|where/i.test(latest))) {
    return finish(state, "answer", howToAnswer(latest, facts), "how_to_direct_answer");
  }

  if (facts.login) {
    if (!facts.already_relogged && !state.safe_steps_offered.includes("relogin")) {
      return finish(
        state,
        "safe_step",
        "Let’s try signing out and back in on that same account first — that often clears a stuck session. Tell me what you see after you do.",
        "justified_relogin",
        {
          safe_step: offerStep(
            state,
            "relogin",
            "Sign out and back in",
            "Sign out, then sign back in with the same account before we go further.",
          ),
        },
      );
    }
    return finish(
      state,
      "escalate",
      "You already tried the sign-in reset I would have suggested, so I am passing this to the specialist team. You will hear back within 24 hours.",
      "login_exhausted",
      { escalate: true },
    );
  }

  // Visual / layout — screenshot only if we have no evidence and have not asked.
  if (
    facts.visual &&
    !facts.has_screenshot &&
    !facts.screenshot_requested &&
    state.evidence_requested_count === 0 &&
    !facts.already_cleared_filters
  ) {
    state.evidence_requested_count += 1;
    facts.screenshot_requested = true;
    markAsked(state, "screenshot");
    return finish(
      state,
      "request_evidence",
      "A screenshot of that screen would help me see what is missing. If you cannot attach one, describe exactly what you expected to see.",
      "justified_screenshot",
    );
  }

  // Stale / filter issues — clear-filters only if they have not already done it.
  // Never lead with hard-refresh. Never re-ask after they said they cleared filters.
  if (facts.stale_or_filter && !facts.already_cleared_filters && !state.safe_steps_offered.includes("clear_filters")) {
    return finish(
      state,
      "safe_step",
      "Please clear any active filters on that view and see if the list catches up. No need to hard-refresh first — tell me what it shows after the filters are clear.",
      "justified_clear_filters",
      {
        safe_step: offerStep(
          state,
          "clear_filters",
          "Clear filters",
          "Clear active filters on the current view, then check whether the list updates.",
        ),
      },
    );
  }

  if (facts.stale_or_filter && facts.already_cleared_filters) {
    return finish(
      state,
      "escalate",
      "You already cleared the filters and it is still wrong, so I will not run you through the same steps again. I am passing this to the specialist team with that context — you will hear back within 24 hours.",
      "stale_after_filters_cleared",
      { escalate: true },
    );
  }

  if (facts.complete_report && (facts.has_screenshot || facts.visual)) {
    return finish(
      state,
      "escalate",
      "I have a clear picture of what is going wrong. I am passing this to the specialist team — you will hear back within 24 hours.",
      "clear_visual_report",
      { escalate: true },
    );
  }

  if (facts.complete_report) {
    return finish(
      state,
      "escalate",
      "That is enough for me to get this to the specialist team without extra back-and-forth. You will hear back within 24 hours.",
      "clear_report_skip_gauntlet",
      { escalate: true },
    );
  }

  // One missing fact only — never re-ask a known key.
  if (!facts.surface && !alreadyAsked(state, "surface")) {
    markAsked(state, "surface");
    return finish(
      state,
      "clarify",
      "Which screen is this on — for example the load board, settings, or sign-in?",
      "ask_surface_once",
    );
  }

  if (!facts.problem && !alreadyAsked(state, "problem")) {
    markAsked(state, "problem");
    return finish(
      state,
      "clarify",
      "What should it be doing instead of what you are seeing?",
      "ask_problem_once",
    );
  }

  return finish(
    state,
    "escalate",
    "I have what I need to pass this to the specialist team — you will hear back within 24 hours.",
    "default_escalate_no_reask",
    { escalate: true },
  );
}
