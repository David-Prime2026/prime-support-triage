#!/usr/bin/env node
/**
 * A3 — Real-time CONTROL_PLANE + live-log.jsonl entries appear AS execution happens.
 */
import fs from "node:fs";
import {
  EXEC_LOG,
  CONTROL_PLANE,
  setKillswitch,
  runOneDispatch,
  liveLog,
  writeProof,
  controlPlaneAppend,
} from "./lib.mjs";

setKillswitch({
  halt: false,
  tier1_autonomy_enabled: true,
  reason: "A3 proof — temporary arm for live log",
});

const marker = `A3-LIVE-${Date.now()}`;
const cpBefore = fs.readFileSync(CONTROL_PLANE, "utf8");
const logBeforeLen = fs.existsSync(EXEC_LOG) ? fs.statSync(EXEC_LOG).size : 0;

liveLog({ type: "proof_a3_marker", marker, note: "written BEFORE dispatch completes" });

const during = [];
const dispatchPromise = runOneDispatch(
  {
    id: "PROOF-A3-LIVELOG",
    summary: "comment-only proof — control plane narrative",
    category: "F4",
    tier_hint: "1.1",
    class_hint: "bug",
    confidence: "high",
  },
  { proofMode: true, steps: 4, pollMs: 300 },
);

// Poll live log while dispatch runs
const poll = setInterval(() => {
  if (!fs.existsSync(EXEC_LOG)) return;
  const text = fs.readFileSync(EXEC_LOG, "utf8");
  if (text.includes("PROOF-A3-LIVELOG") && text.includes("dispatch_step")) {
    during.push({ at: new Date().toISOString(), saw: "dispatch_step_while_running" });
  }
}, 100);

const result = await dispatchPromise;
clearInterval(poll);

controlPlaneAppend(`PROOF A3 — live log ${marker}`, [
  "Execution logged in real time to executions/live-log.jsonl",
  `Marker ${marker} written before completion`,
]);

const cpAfter = fs.readFileSync(CONTROL_PLANE, "utf8");
const logAfter = fs.readFileSync(EXEC_LOG, "utf8");
const logGrew = fs.statSync(EXEC_LOG).size > logBeforeLen;
const sawMidFlight = during.length > 0;
const cpHasMarker = cpAfter.includes(marker) && cpAfter !== cpBefore;

setKillswitch({
  halt: true,
  tier1_autonomy_enabled: false,
  reason: "A3 proof complete — autonomy OFF",
});

const pass = result.ok && logGrew && sawMidFlight && cpHasMarker;
const proof = `# A3 — Real-time CONTROL_PLANE / live log

**Result:** ${pass ? "PASS" : "FAIL"}

## Checks
- Live log grew during/after run: ${logGrew}
- Observed \`dispatch_step\` while still running: ${sawMidFlight} (samples=${during.length})
- CONTROL_PLANE contains marker \`${marker}\`: ${cpHasMarker}

## Mid-run observations
\`\`\`json
${JSON.stringify(during, null, 2)}
\`\`\`

## Log excerpt (marker + dispatch)
\`\`\`
${logAfter
  .split("\n")
  .filter((l) => l.includes(marker) || l.includes("PROOF-A3"))
  .join("\n")}
\`\`\`
`;

writeProof("A3-live-log.md", proof);
console.log(pass ? "A3 PASS" : "A3 FAIL", { logGrew, sawMidFlight, cpHasMarker });
process.exit(pass ? 0 : 1);
