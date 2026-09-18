#!/usr/bin/env node
/**
 * A1 — Kill switch halts mid-flight.
 * Start a dispatch with halt=false (proof), flip halt=true after step 1, confirm STOP.
 */
import {
  setKillswitch,
  loadKillswitch,
  runOneDispatch,
  writeProof,
  liveLog,
  controlPlaneAppend,
  EXEC_LOG,
} from "./lib.mjs";
import fs from "node:fs";

const before = loadKillswitch();
setKillswitch({
  halt: false,
  tier1_autonomy_enabled: true,
  straight_to_prod_enabled: false,
  reason: "A1 proof — temporary arm for mid-flight halt test",
});

liveLog({ type: "proof_a1_start" });
const logStart = fs.existsSync(EXEC_LOG) ? fs.readFileSync(EXEC_LOG, "utf8").split("\n").length : 0;

const dispatchPromise = runOneDispatch(
  {
    id: "PROOF-A1-KILL",
    summary: "typo proof dispatch — display label",
    category: "F1",
    tier_hint: "1.1",
    class_hint: "bug",
    confidence: "high",
  },
  { proofMode: true, steps: 6, pollMs: 400 },
);

// Flip kill switch mid-flight
await new Promise((r) => setTimeout(r, 700));
const flipped = setKillswitch({
  halt: true,
  tier1_autonomy_enabled: true,
  straight_to_prod_enabled: false,
  reason: "A1 proof — halt flipped mid-flight",
});
liveLog({ type: "proof_a1_flip", killswitch: flipped });

const result = await dispatchPromise;

// Restore pre-proof posture (halted until Step C)
setKillswitch({
  halt: true,
  tier1_autonomy_enabled: false,
  straight_to_prod_enabled: false,
  reason: "A1 proof complete — autonomy remains OFF until A1–A5 all pass + Step C",
  set_by: "cursor",
});

const pass = result.halted === true && result.phase === "mid_flight";
const proof = `# A1 — Kill switch mid-flight halt

**Result:** ${pass ? "PASS" : "FAIL"}

## Procedure
1. Armed kill switch \`halt:false\` temporarily for proof.
2. Started dispatch \`PROOF-A1-KILL\` (6 steps, 400ms each).
3. Flipped \`halt:true\` after ~700ms (mid-flight).
4. Runner re-checked kill switch between steps and STOPPED.

## Evidence
\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`

## Kill switch after flip
\`\`\`json
${JSON.stringify(flipped, null, 2)}
\`\`\`

## Live log slice
See \`executions/live-log.jsonl\` entries \`proof_a1_*\` and \`dispatch_halted_mid_flight\`.

Restored posture: halt=true, tier1_autonomy_enabled=false (pre-Step-C).
Prior snapshot reason was: ${before.reason}
`;

writeProof("A1-killswitch.md", proof);
controlPlaneAppend("PROOF A1 — kill switch mid-flight", [
  pass ? "PASS — dispatch halted mid-flight on file halt" : "FAIL",
  `dispatch=${result.id} phase=${result.phase} step=${result.step}`,
  "Evidence: proofs/DR-CS-PLATFORM-006/A1-killswitch.md",
]);

console.log(pass ? "A1 PASS" : "A1 FAIL", result);
process.exit(pass ? 0 : 1);
