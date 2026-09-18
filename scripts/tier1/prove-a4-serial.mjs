#!/usr/bin/env node
/**
 * A4 — One-at-a-time, observed (serial, never batched parallel).
 */
import {
  setKillswitch,
  runQueue,
  liveLog,
  writeProof,
  controlPlaneAppend,
  EXEC_LOG,
} from "./lib.mjs";
import fs from "node:fs";

setKillswitch({
  halt: false,
  tier1_autonomy_enabled: true,
  reason: "A4 proof — serial queue",
});

const items = [
  {
    id: "PROOF-A4-1",
    summary: "typo label one",
    category: "F1",
    tier_hint: "1.1",
    class_hint: "bug",
    confidence: "high",
  },
  {
    id: "PROOF-A4-2",
    summary: "typo label two",
    category: "F1",
    tier_hint: "1.1",
    class_hint: "bug",
    confidence: "high",
  },
];

liveLog({ type: "proof_a4_start", note: "two items — must be serial" });
const t0 = Date.now();
const results = await runQueue(items, { proofMode: true, steps: 3, pollMs: 200 });
const elapsed = Date.now() - t0;

// Parse log order: A4-1 complete before A4-2 start
const lines = fs
  .readFileSync(EXEC_LOG, "utf8")
  .split("\n")
  .filter((l) => l.includes("PROOF-A4"));
const idx = (pred) => lines.findIndex((l) => pred(l));
const start1 = idx((l) => l.includes("PROOF-A4-1") && l.includes("dispatch_start"));
const done1 = idx((l) => l.includes("PROOF-A4-1") && l.includes("dispatch_complete"));
const start2 = idx((l) => l.includes("PROOF-A4-2") && l.includes("dispatch_start"));
const serial = start1 >= 0 && done1 > start1 && start2 > done1;

setKillswitch({
  halt: true,
  tier1_autonomy_enabled: false,
  reason: "A4 proof complete — autonomy OFF",
});

const pass = results.length === 2 && results.every((r) => r.ok) && serial && elapsed >= 1000;
const proof = `# A4 — One-at-a-time (serial)

**Result:** ${pass ? "PASS" : "FAIL"}

## Procedure
Queued 2 dispatches. Runner uses \`for\` (serial) — never \`Promise.all\`.

## Timing
- elapsed_ms=${elapsed} (each item 3×200ms + overhead → expect ≥~1200ms serial)

## Log order check
- start1=${start1} done1=${done1} start2=${start2}
- serial (start2 after done1): ${serial}

## Results
\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`
`;

writeProof("A4-serial.md", proof);
controlPlaneAppend("PROOF A4 — one-at-a-time serial", [
  pass ? "PASS — two fixes executed serially, not batched" : "FAIL",
  "Evidence: proofs/DR-CS-PLATFORM-006/A4-serial.md",
]);

console.log(pass ? "A4 PASS" : "A4 FAIL", { serial, elapsed });
process.exit(pass ? 0 : 1);
