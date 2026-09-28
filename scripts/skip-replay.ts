/**
 * Skip Wilson 2026-09-25 15:36–15:44 replay (PRIME 2026-09-28 approved).
 * Local policy + live apx diagnose. Do not email Skip.
 *
 *   node --experimental-strip-types scripts/skip-replay.ts
 *   SKIP_REPLAY_LIVE=1 node --experimental-strip-types scripts/skip-replay.ts
 */
import { diagnoseLiveTurn } from "../supabase/functions/_shared/bricelyDiagnoseLive.ts";

const LINES = [
  "Change the price period on the sales memo for GW Ind of Lane County",
  "How can I pull up the sales memo",
  "Change it so September price runs through 10/3",
  "Search for GW Eugene returns nothing",
  "There is no dropdown after typing a name",
];

const FORBID = [
  /what.?s going on/i,
  /Hi — I’m Bricely/i,
  /tell me what you.?re trying to do/i,
  /pencil/i,
  /clear (any )?active filters/i,
  /which screen (is this|you are) on/i,
];

type Turn = { n: number; text: string; terminal: string; action?: string; reason?: string; reply: string };

function check(turns: Turn[]): string[] {
  const err: string[] = [];
  for (const t of turns) {
    for (const re of FORBID) {
      if (re.test(t.reply)) err.push(`T${t.n} forbidden ${re} in: ${t.reply.slice(0, 160)}`);
    }
  }
  const last = turns[turns.length - 1];
  if (last && last.terminal !== "escalate") {
    err.push(`T${last.n} terminal ${last.terminal} (expected escalate after search fail)`);
  }
  return err;
}

function localReplay(): Turn[] {
  let state: Record<string, unknown> = {};
  const turns: Turn[] = [];
  for (let i = 0; i < LINES.length; i++) {
    const r = diagnoseLiveTurn({ text: LINES[i], state });
    turns.push({
      n: i + 1,
      text: LINES[i],
      terminal: r.terminal,
      action: r.action,
      reason: r.internal_reason,
      reply: r.reply,
    });
    state = r.next as Record<string, unknown>;
  }
  return turns;
}

async function liveReplay(): Promise<Turn[]> {
  const anon =
    process.env.TRIAGE_ANON ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGJ3ZHhzem1kZmZiZHVoamVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5NDAsImV4cCI6MjEwNTMyODk0MH0.pP72Bq4QbHNCRFvPPl0Lt3UdkCngh1RZG3-MFC94FiQ";
  const url = "https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose";
  let state: Record<string, unknown> = {};
  const turns: Turn[] = [];
  for (let i = 0; i < LINES.length; i++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: LINES[i], state }),
    });
    const d = (await res.json()) as {
      terminal?: string;
      action?: string;
      internal_reason?: string;
      reply?: string;
      next?: Record<string, unknown>;
    };
    turns.push({
      n: i + 1,
      text: LINES[i],
      terminal: String(d.terminal ?? `HTTP ${res.status}`),
      action: d.action,
      reason: d.internal_reason,
      reply: String(d.reply ?? JSON.stringify(d).slice(0, 200)),
    });
    state = d.next ?? state;
  }
  return turns;
}

function print(label: string, turns: Turn[], err: string[]) {
  console.log(`\n=== ${label} ===`);
  for (const t of turns) {
    console.log(`T${t.n} ${t.terminal} ${t.action ?? ""} ${t.reason ?? ""}`);
    console.log(`   ${t.reply.replace(/\n/g, " / ").slice(0, 220)}`);
  }
  if (err.length) {
    console.error(`${label} FAIL`);
    for (const e of err) console.error(`  - ${e}`);
  } else {
    console.log(`${label} PASS`);
  }
}

async function liveWidgetP0(): Promise<string[]> {
  const err: string[] = [];
  const htmlRes = await fetch("https://wmgos.primetimesystems.ai/");
  if (!htmlRes.ok) {
    err.push(`WMG HTML HTTP ${htmlRes.status}`);
    return err;
  }
  const html = await htmlRes.text();
  const asset = html.match(/assets\/[^"' ]+\.js/)?.[0];
  if (!asset) {
    err.push("no JS asset in WMG HTML");
    return err;
  }
  const jsRes = await fetch(`https://wmgos.primetimesystems.ai/${asset}`);
  const body = await jsRes.text();
  console.log(`\n=== LIVE widget ${asset} ===`);
  console.log(`  bricely-diagnose: ${body.includes("bricely-diagnose")}`);
  const cannedCatch = body.includes("catch{_t=F$") || /catch\{\s*_t\s*=\s*F\$/.test(body);
  console.log(`  F$ catch: ${cannedCatch}`);
  if (!body.includes("bricely-diagnose")) err.push("live bundle does not call bricely-diagnose");
  if (cannedCatch) err.push("F$ catch still in live widget — copy wCe.remote.ts and delete the catch");
  return err;
}

const local = localReplay();
const localErr = check(local);
print("LOCAL (this branch)", local, localErr);

let liveErr: string[] = [];
let widgetErr: string[] = [];
if (process.env.SKIP_REPLAY_LIVE !== "0") {
  const live = await liveReplay();
  liveErr = check(live);
  print("LIVE apx diagnose", live, liveErr);
  widgetErr = await liveWidgetP0();
  if (widgetErr.length) {
    console.error("LIVE widget FAIL");
    for (const e of widgetErr) console.error(`  - ${e}`);
  } else {
    console.log("LIVE widget PASS");
  }
}

if (localErr.length) process.exit(1);
if (liveErr.length || widgetErr.length) {
  console.error("\nLive diagnose and/or widget is behind this branch. Deploy bricely-diagnose to apxbwdx; copy wCe.remote; delete F$ catch; then rerun.");
  process.exit(2);
}
