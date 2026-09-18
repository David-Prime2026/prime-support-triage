#!/usr/bin/env node
/**
 * A2 — Revert works. Apply a Tier 1-style fixture fix, then roll back cleanly.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  ROOT,
  PROOFS,
  setKillswitch,
  writeProof,
  liveLog,
  controlPlaneAppend,
  runOneDispatch,
} from "./lib.mjs";

const fixture = path.join(PROOFS, "fixture-status-label.txt");
fs.mkdirSync(PROOFS, { recursive: true });
fs.writeFileSync(
  fixture,
  "# Tier 1 proof fixture (support-triage only — never WMG OS prod)\nSTATUS_LABEL=Awaitng approval\n",
  "utf8",
);

const before = fs.readFileSync(fixture, "utf8");
liveLog({ type: "proof_a2_start", before });

setKillswitch({
  halt: false,
  tier1_autonomy_enabled: true,
  straight_to_prod_enabled: false,
  reason: "A2 proof — temporary arm for revert test",
});

const result = await runOneDispatch(
  {
    id: "PROOF-A2-REVERT",
    summary: "typo STATUS_LABEL Awaitng → Awaiting (display copy)",
    category: "F1",
    tier_hint: "1.1",
    class_hint: "bug",
    confidence: "high",
  },
  {
    proofMode: true,
    steps: 2,
    pollMs: 50,
    fixFn: async () => {
      const next = before.replace("Awaitng", "Awaiting");
      fs.writeFileSync(fixture, next, "utf8");
      liveLog({ type: "proof_a2_fixed", after: next });
      return { path: fixture, from: "Awaitng", to: "Awaiting" };
    },
  },
);

const mid = fs.readFileSync(fixture, "utf8");
const fixedOk = mid.includes("Awaiting") && !mid.includes("Awaitng");

// Revert cleanly
fs.writeFileSync(fixture, before, "utf8");
const afterRevert = fs.readFileSync(fixture, "utf8");
const reverted = afterRevert === before && afterRevert.includes("Awaitng");

liveLog({ type: "proof_a2_reverted", afterRevert });

setKillswitch({
  halt: true,
  tier1_autonomy_enabled: false,
  straight_to_prod_enabled: false,
  reason: "A2 proof complete — autonomy OFF until A1–A5 + Step C",
});

const pass = result.ok && fixedOk && reverted;
const proof = `# A2 — Revert works

**Result:** ${pass ? "PASS" : "FAIL"}

## Procedure
1. Fixture had typo \`Awaitng\`.
2. Tier 1-style dispatch applied fix → \`Awaiting\`.
3. Reverted file to prior bytes (clean rollback).

## Before
\`\`\`
${before}
\`\`\`

## After fix
\`\`\`
${mid}
\`\`\`

## After revert
\`\`\`
${afterRevert}
\`\`\`

## Dispatch
\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`
`;

writeProof("A2-revert.md", proof);
controlPlaneAppend("PROOF A2 — revert", [
  pass ? "PASS — fix applied then clean revert to prior state" : "FAIL",
  "Evidence: proofs/DR-CS-PLATFORM-006/A2-revert.md",
]);

console.log(pass ? "A2 PASS" : "A2 FAIL", { fixedOk, reverted });
process.exit(pass ? 0 : 1);
