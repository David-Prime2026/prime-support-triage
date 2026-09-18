#!/usr/bin/env node
/**
 * A5 — Fence loads and holds; disqualified items BLOCK.
 */
import {
  setKillswitch,
  classifyItem,
  loadFence,
  loadClassifier,
  runOneDispatch,
  writeProof,
  controlPlaneAppend,
  liveLog,
} from "./lib.mjs";

const fence = loadFence();
const method = loadClassifier();

const cases = [
  {
    id: "BLOCK-H1-MONEY",
    summary: "Fix invoice aging total and AR credit threshold",
    category: "F1",
    expect: "block",
  },
  {
    id: "BLOCK-H2-AUTH",
    summary: "Reset portal password JWT invite bind",
    category: "F1",
    expect: "block",
  },
  {
    id: "BLOCK-H3-SCHEMA",
    summary: "Add migration and RLS grant for new table",
    category: "F1",
    expect: "block",
  },
  {
    id: "BLOCK-H4-EXTERNAL",
    summary: "Change SendGrid webhook contract",
    category: "F1",
    expect: "block",
  },
  {
    id: "BLOCK-H5-DISPATCH",
    summary: "Bypass approve-handoff dispatch gate",
    category: "F1",
    expect: "block",
  },
  {
    id: "BLOCK-H6-PRODREF",
    summary: "Patch project qcefkoxqkfwnlqfmwzmi directly",
    touches: ["qcefkoxqkfwnlqfmwzmi"],
    category: "F1",
    expect: "block",
  },
  {
    id: "BLOCK-H7-UNSURE",
    summary: "Maybe fix something in the board",
    confidence: "unsure",
    category: "F1",
    expect: "block",
  },
  {
    id: "ALLOW-F1-TYPO",
    summary: "typo wrong string on support console label",
    category: "F1",
    tier_hint: "1.1",
    class_hint: "bug",
    confidence: "high",
    expect: "execute",
  },
];

liveLog({ type: "proof_a5_start", fence_version: fence.version, method_version: method.version });

const classified = cases.map((c) => ({ input: c, out: classifyItem(c, fence, method) }));

setKillswitch({
  halt: false,
  tier1_autonomy_enabled: true,
  reason: "A5 proof — exercise block path",
});

const moneyRun = await runOneDispatch(
  {
    id: "PROOF-A5-MONEY-BLOCK",
    summary: "Fix invoice AR pricing commission dollars",
    category: "F1",
    confidence: "high",
  },
  { proofMode: true, steps: 2, pollMs: 50 },
);

setKillswitch({
  halt: true,
  tier1_autonomy_enabled: false,
  reason: "A5 proof complete — autonomy OFF",
});

const blocksOk = classified
  .filter((c) => c.input.expect === "block")
  .every((c) => c.out.action === "block");
const allowOk = classified.find((c) => c.input.id === "ALLOW-F1-TYPO").out.action === "execute";
const moneyBlocked = moneyRun.blocked === true;

const pass =
  fence.status === "ratified" &&
  method.status === "ratified" &&
  method.conservatism?.default_down_on_uncertainty === true &&
  blocksOk &&
  allowOk &&
  moneyBlocked;

const proof = `# A5 — Fence loads and blocks disqualified items

**Result:** ${pass ? "PASS" : "FAIL"}

## Fence
- status=${fence.status} version=${fence.version}
- explicitly_excluded includes project_qcefkoxqkfwnlqfmwzmi: ${fence.explicitly_excluded.includes("project_qcefkoxqkfwnlqfmwzmi")}

## Classifier
- status=${method.status} default_down=${method.conservatism?.default_down_on_uncertainty}

## Classification matrix
| ID | expect | action | reason |
|----|--------|--------|--------|
${classified
  .map(
    (c) =>
      `| ${c.input.id} | ${c.input.expect} | ${c.out.action} | ${c.out.reason} |`,
  )
  .join("\n")}

## Runtime block (money dispatch)
\`\`\`json
${JSON.stringify(moneyRun, null, 2)}
\`\`\`
`;

writeProof("A5-fence-blocks.md", proof);
controlPlaneAppend("PROOF A5 — fence blocks disqualified", [
  pass ? "PASS — H1–H7 + money runtime block; F1 typo allowed" : "FAIL",
  "Evidence: proofs/DR-CS-PLATFORM-006/A5-fence-blocks.md",
]);

console.log(pass ? "A5 PASS" : "A5 FAIL", { blocksOk, allowOk, moneyBlocked });
process.exit(pass ? 0 : 1);
