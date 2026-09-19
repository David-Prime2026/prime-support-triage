/**
 * DR-CS-PLATFORM-008 conversation proofs.
 * Run: node --experimental-strip-types scripts/bricely-diagnose-proof.ts
 */
import {
  diagnose,
  type ChatMessage,
  type DiagnoseAction,
} from "../supabase/functions/_shared/bricelyDiagnose.ts";

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

if (failed) {
  console.error(`\n${failed}/${proofs.length} proofs failed`);
  process.exit(1);
}
console.log(`\n${proofs.length}/${proofs.length} proofs passed`);
