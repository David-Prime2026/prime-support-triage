#!/usr/bin/env node
/**
 * Scan outbox / optional queue file for first live Tier 1 candidate.
 * If none qualify, report expected empty fire — do not invent work.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  classifyItem,
  isHalted,
  liveLog,
  writeProof,
  controlPlaneAppend,
  runOneDispatch,
} from "./lib.mjs";

const queueFile = path.join(ROOT, "executions", "tier1-queue.json");
const outbox = path.join(ROOT, "dispatches", "outbox");

let items = [];
if (fs.existsSync(queueFile)) {
  items = JSON.parse(fs.readFileSync(queueFile, "utf8"));
}
const outboxFiles = fs.existsSync(outbox)
  ? fs.readdirSync(outbox).filter((f) => f.endsWith(".json") && f.startsWith("dispatch-"))
  : [];

for (const f of outboxFiles) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(outbox, f), "utf8"));
    items.push({
      id: raw.dispatch_id || f,
      summary: raw.summary || raw.message || raw.title || "",
      category: raw.fence_category,
      confidence: raw.confidence || "unsure",
      source: f,
    });
  } catch {
    /* skip */
  }
}

liveLog({ type: "first_live_scan", queued: items.length, outbox: outboxFiles.length });

const halt = isHalted();
const classified = items.map((i) => ({ item: i, out: classifyItem(i) }));
const executable = classified.filter((c) => c.out.action === "execute");

let execution = null;
if (!halt.halted && executable.length === 1) {
  execution = await runOneDispatch(executable[0].item, { steps: 2, pollMs: 100 });
} else if (executable.length > 1) {
  liveLog({
    type: "first_live_defer_multi",
    note: "one-at-a-time: more than one candidate — execute none until single observed fire",
    count: executable.length,
  });
}

const report = `# First live Tier 1 scan — DR-CS-PLATFORM-006

**Kill switch halted:** ${halt.halted} (${halt.reason || "armed"})
**Queue items:** ${items.length}
**Outbox dispatch files:** ${outboxFiles.length}
**Executable (fenced 1.1-1.5):** ${executable.length}

${
  executable.length === 0
    ? "**No inaugural prod fire.** Expected — method scored 0/12 on real log; Tier 1 fires rarely."
    : `Candidate(s):\n\`\`\`json\n${JSON.stringify(executable, null, 2)}\n\`\`\``
}

${
  execution
    ? `## Execution\n\`\`\`json\n${JSON.stringify(execution, null, 2)}\n\`\`\``
    : "## Execution\nNone this pass."
}
`;

writeProof("FIRST-LIVE-SCAN.md", report);
controlPlaneAppend("DR-CS-PLATFORM-006 — first live Tier 1 scan", [
  executable.length === 0
    ? "No fenced 1.1-1.5 candidate in queue/outbox — no fire (expected)"
    : `executable=${executable.length}`,
  "Evidence: proofs/DR-CS-PLATFORM-006/FIRST-LIVE-SCAN.md",
]);

console.log(report);
