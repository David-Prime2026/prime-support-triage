#!/usr/bin/env node
/**
 * Step C — Enable Tier 1 straight-to-prod AFTER A1–A5 proofs pass.
 * Does not execute fixes; only flips posture when proof files show PASS.
 */
import fs from "node:fs";
import path from "node:path";
import {
  PROOFS,
  setKillswitch,
  loadFence,
  loadClassifier,
  controlPlaneAppend,
  liveLog,
  writeProof,
} from "./lib.mjs";

const required = [
  "A1-killswitch.md",
  "A2-revert.md",
  "A3-live-log.md",
  "A4-serial.md",
  "A5-fence-blocks.md",
];

const missing = required.filter((f) => !fs.existsSync(path.join(PROOFS, f)));
const failed = required.filter((f) => {
  const t = fs.readFileSync(path.join(PROOFS, f), "utf8");
  return !/\*\*Result:\*\* PASS/.test(t);
});

if (missing.length || failed.length) {
  console.error("REFUSING enable — proofs incomplete", { missing, failed });
  process.exit(1);
}

const fence = loadFence();
const method = loadClassifier();
if (fence.status !== "ratified" || method.status !== "ratified") {
  console.error("REFUSING enable — fence/classifier not ratified");
  process.exit(1);
}
if (!method.conservatism?.default_down_on_uncertainty) {
  console.error("REFUSING enable — defaults-down not set");
  process.exit(1);
}

const ks = setKillswitch({
  halt: false,
  tier1_autonomy_enabled: true,
  straight_to_prod_enabled: true,
  reason: "DR-CS-PLATFORM-006 Step C — A1-A5 proven; Tier 1 fenced light bugs enabled straight-to-prod",
  set_by: "cursor",
  note: "Kill switch: set halt=true to stop immediately. CURSOR_DEV_AUTONOMY=off also halts.",
  fence_version: fence.version,
  classifier_version: method.version,
  enabled_at: new Date().toISOString(),
});

liveLog({ type: "tier1_enabled", killswitch: ks });
controlPlaneAppend("DR-CS-PLATFORM-006 — Tier 1 ENABLED (post A1-A5)", [
  "users-live + guardrails-proven + fence loaded",
  `fence=${fence.version} classifier=${method.version}`,
  "straight-to-prod ON for clear 1.1-1.5 within fence only",
  "kill switch reachable: config/autonomy-killswitch.json halt:true",
  "Tier 2/3, dev-loop, email-approval remain OFF",
]);

writeProof(
  "STEP-C-enabled.md",
  `# Step C — Tier 1 enabled\n\n\`\`\`json\n${JSON.stringify(ks, null, 2)}\n\`\`\`\n`,
);

console.log("Tier 1 ENABLED", ks);
