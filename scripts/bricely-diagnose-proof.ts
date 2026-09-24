/**
 * DR-CS-PLATFORM-008 conversation proofs.
 * Run: node --experimental-strip-types scripts/bricely-diagnose-proof.ts
 */
import {
  diagnose,
  type ChatMessage,
  type DiagnoseAction,
} from "../supabase/functions/_shared/bricelyDiagnose.ts";
import { diagnoseLiveTurn } from "../supabase/functions/_shared/bricelyDiagnoseLive.ts";

type Proof = {
  id: string;
  title: string;
  messages: ChatMessage[];
  expectAction: DiagnoseAction | DiagnoseAction[];
  forbid?: RegExp[];
  require?: RegExp[];
};

const proofs: Proof[] = [
  {
    id: "T1",
    title: "Load board already cleared filters — do not re-ask screenshot or filters",
    messages: [
      {
        role: "user",
        text: "The load board still shows yesterday's loads even after I cleared the filters.",
      },
    ],
    expectAction: "escalate",
    forbid: [/screenshot/i, /clear (any )?active filters/i, /hard-refresh/i, /hard refresh/i],
    require: [/cleared the filters/i, /24 hours/i],
  },
  {
    id: "T2",
    title: "How-to export — answer, skip the gauntlet",
    messages: [{ role: "user", text: "How do I export the load board to CSV?" }],
    expectAction: "answer",
    forbid: [/screenshot/i, /clear (any )?active filters/i, /sign out/i],
    require: [/export/i],
  },
  {
    id: "T3",
    title: "Vague opener — one focused question, not a script",
    messages: [{ role: "user", text: "it's not working" }],
    expectAction: "clarify",
    forbid: [/screenshot/i, /clear (any )?active filters/i],
  },
  {
    id: "T4",
    title: "Visual missing button — screenshot once, justified",
    messages: [
      { role: "user", text: "The save button is missing on the rate confirm screen." },
    ],
    expectAction: "request_evidence",
    require: [/screenshot/i],
    forbid: [/clear (any )?active filters/i],
  },
  {
    id: "T5",
    title: "Visual + already attached — do not ask again",
    messages: [
      {
        role: "user",
        text: "The save button is missing on the rate confirm screen. I attached a screenshot.",
        attachments: [{ type: "image/png", name: "rate-confirm.png" }],
      },
    ],
    expectAction: ["escalate", "answer"],
    forbid: [/would help me see/i, /clear (any )?active filters/i],
  },
  {
    id: "T6",
    title: "Accounting — coming soon, no billable language",
    messages: [{ role: "user", text: "Why is my aging report and invoice totals wrong?" }],
    expectAction: "escalate",
    require: [/finalized|coming/i],
    forbid: [/billable/i, /\bSLA\b/, /out of scope/i, /your contract/i],
  },
  {
    id: "T7",
    title: "Turn-5 offramp — continue or ticket, not a hard wall",
    messages: [
      { role: "user", text: "something is off" },
      { role: "bricely", text: "Which screen is this on?" },
      { role: "user", text: "not sure" },
      { role: "bricely", text: "What should it be doing?" },
      { role: "user", text: "just broken" },
      { role: "bricely", text: "Can you say more?" },
      { role: "user", text: "same issue" },
      { role: "bricely", text: "Still with you." },
      { role: "user", text: "please help already" },
    ],
    expectAction: "offer_continue_or_ticket",
    require: [/keep digging|specialist/i],
    forbid: [/I cannot help more/i],
  },
  {
    id: "T8",
    title: "Never re-ask a known surface",
    messages: [
      { role: "user", text: "load board is acting weird" },
      { role: "bricely", text: "Which screen is this on — for example the load board?" },
      { role: "user", text: "still the same" },
    ],
    expectAction: ["escalate", "offer_continue_or_ticket", "safe_step", "clarify"],
    forbid: [/which screen is this on/i],
  },
];

function actionOk(got: DiagnoseAction, expect: DiagnoseAction | DiagnoseAction[]): boolean {
  return Array.isArray(expect) ? expect.includes(got) : got === expect;
}

let failed = 0;
for (const p of proofs) {
  const result = diagnose({ messages: p.messages });
  const errors: string[] = [];
  if (!actionOk(result.action, p.expectAction)) {
    errors.push(`action ${result.action} (expected ${JSON.stringify(p.expectAction)})`);
  }
  for (const re of p.forbid ?? []) {
    if (re.test(result.reply)) errors.push(`forbidden ${re} in reply: ${result.reply}`);
  }
  for (const re of p.require ?? []) {
    if (!re.test(result.reply)) errors.push(`missing ${re} in reply: ${result.reply}`);
  }
  if (errors.length) {
    failed += 1;
    console.error(`FAIL ${p.id} ${p.title}`);
    for (const e of errors) console.error(`  - ${e}`);
    console.error(`  reason=${result.internal_reason}`);
  } else {
    console.log(`PASS ${p.id} ${p.title} → ${result.action} (${result.internal_reason})`);
  }
}

type LiveProof = {
  id: string;
  title: string;
  text: string;
  state?: Parameters<typeof diagnoseLiveTurn>[0]["state"];
  newAttachments?: Parameters<typeof diagnoseLiveTurn>[0]["newAttachments"];
  expectTerminal: string | string[];
  forbid?: RegExp[];
  require?: RegExp[];
};

const liveProofs: LiveProof[] = [
  {
    id: "L1",
    title: "Live wCe: load board + already cleared filters — skip canned gauntlet",
    text: "The load board still shows yesterday's loads even after I cleared the filters.",
    expectTerminal: "escalate",
    forbid: [/screenshot/i, /clear any active filters/i, /Which screen are you on/i, /hard refresh/i],
    require: [/cleared the filters/i, /24 hours/i],
  },
  {
    id: "L2",
    title: "Live wCe: export how-to — answer, not screenshot",
    text: "How do I export the load board to CSV?",
    expectTerminal: "continue",
    forbid: [/screenshot/i, /clear any active filters/i],
    require: [/export/i],
  },
  {
    id: "L3",
    title: "Live wCe: new chat reset",
    text: "start over",
    expectTerminal: "reset_chat",
    require: [/fresh conversation/i],
  },
  {
    id: "L4",
    title: "Live wCe: open ticket",
    text: "open ticket",
    expectTerminal: "escalate",
    require: [/specialist/i],
  },
  {
    id: "L5",
    title: "Live wCe: welcome-name live fix preserved",
    text: "Change my welcome name to Dave",
    expectTerminal: "live_fix",
    require: [/Dave/],
  },
  {
    id: "L6",
    title: "Live wCe: accounting coming soon",
    text: "Why is my aging report wrong?",
    expectTerminal: "escalate",
    require: [/finalized/i],
    forbid: [/billable/i, /\bSLA\b/, /your contract/i],
  },
  {
    id: "L7",
    title: "Live wCe: after filter tip failed — escalate, do not re-tip",
    text: "still the same, didn't help",
    state: {
      exchanges: 2,
      phase: "guide_safe",
      screen: "load board",
      softTipDone: true,
      triedSafeStep: true,
      expectedAsked: true,
      introAcked: true,
      notes: ["load board is wrong"],
    },
    expectTerminal: "escalate",
    forbid: [/clear any active filters/i, /Which screen/i],
  },
  {
    id: "L8",
    title: "Live wCe: turn-5 is offramp not hard wall",
    text: "please help already",
    state: {
      exchanges: 4,
      phase: "clarify",
      expectedAsked: true,
      introAcked: true,
      notes: ["something is off", "not sure", "just broken", "same issue"],
    },
    expectTerminal: "continue",
    require: [/keep digging|specialist/i],
  },
  {
    id: "L9",
    title: "Live wCe: after ticket — keep talking, do not wall",
    text: "Also the pickup street is 412 Maple not 410",
    state: {
      exchanges: 3,
      phase: "escalate",
      introAcked: true,
      openTicketId: "5dc41a1a-6810-4f03-a040-2972852345f2",
      notes: ["change pickup address", "open ticket"],
    },
    expectTerminal: "continue",
    require: [/added that to your open ticket|Keep talking/i],
    forbid: [/already with our specialist team under your open ticket/i],
  },
];

for (const p of liveProofs) {
  const result = diagnoseLiveTurn({
    text: p.text,
    state: p.state,
    newAttachments: p.newAttachments,
  });
  const errors: string[] = [];
  const expect = Array.isArray(p.expectTerminal) ? p.expectTerminal : [p.expectTerminal];
  if (!expect.includes(result.terminal)) {
    errors.push(`terminal ${result.terminal} (expected ${JSON.stringify(p.expectTerminal)})`);
  }
  for (const re of p.forbid ?? []) {
    if (re.test(result.reply)) errors.push(`forbidden ${re} in reply: ${result.reply}`);
  }
  for (const re of p.require ?? []) {
    if (!re.test(result.reply)) errors.push(`missing ${re} in reply: ${result.reply}`);
  }
  if (errors.length) {
    failed += 1;
    console.error(`FAIL ${p.id} ${p.title}`);
    for (const e of errors) console.error(`  - ${e}`);
    console.error(`  reason=${result.internal_reason} action=${result.action}`);
  } else {
    console.log(`PASS ${p.id} ${p.title} → ${result.terminal} (${result.internal_reason})`);
  }
}

const total = proofs.length + liveProofs.length;
if (failed) {
  console.error(`\n${failed}/${total} proofs failed`);
  process.exit(1);
}
console.log(`\n${total}/${total} proofs passed`);
