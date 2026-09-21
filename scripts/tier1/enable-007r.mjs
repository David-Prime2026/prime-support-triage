#!/usr/bin/env node
/**
 * DR-007R — log enable + first-fire STOP (no autonomous WMG OS deploy).
 */
import {
  loadKillswitch,
  loadWmgosDisplayFence,
  loadWmgosSafeFeatures,
  liveLog,
  controlPlaneAppend,
  WMG_OS_PROD_REF,
  SUPPORT_TRIAGE_REF,
  ROGUE_MOBILE_REF,
  writeProof,
  ROOT,
} from "./lib.mjs";
import fs from "node:fs";
import path from "node:path";

const disp = loadWmgosDisplayFence();
const sf = loadWmgosSafeFeatures();
const ks = loadKillswitch();

if (disp.status !== "ratified" || !disp.enabled) {
  console.error("display fence not ratified/enabled");
  process.exit(1);
}
if (sf.status !== "ratified" || !sf.enabled) {
  console.error("safe-feature allowlist not ratified/enabled");
  process.exit(1);
}
if (!ks.wmgos_lane1_display_enabled || !ks.wmgos_lane2_safe_features_enabled) {
  console.error("killswitch lane flags not enabled");
  process.exit(1);
}

const w3 = disp.in_fence.find((x) => x.id === "W3");
const sf8 = (sf.allowlist || sf.proposed_allowlist).find((x) => x.id === "SF8");

liveLog({
  type: "dr007r_enabled",
  refs: {
    wmg_os_prod: WMG_OS_PROD_REF,
    support_triage: SUPPORT_TRIAGE_REF,
    rogue: ROGUE_MOBILE_REF,
  },
  w3_forbidden_count: w3.explicitly_forbidden_even_under_css?.length,
  sf8_send_path: sf8.send_path,
  first_fire: "STOPPED_for_PRIME_observation",
});

controlPlaneAppend("DR-CS-PLATFORM-007R — ratified + enabled (first fire STOP)", [
  `Canonical: prod=${WMG_OS_PROD_REF} (never auto-deploy) · triage=${SUPPORT_TRIAGE_REF} · rogue=${ROGUE_MOBILE_REF} unused`,
  "W3 CSS TIGHTENED to purely aesthetic (no reflow/hide/position/clickability)",
  "SF8 draft TIGHTENED to send_path=none (ai-draft only; never send/notify/EmailDrawer Send)",
  "Lane 1 + Lane 2 governors live; unsure→escalate; kill switch reachable (halt:true)",
  "FIRST LIVE FIRE: not executed — PRIME observes; see proofs/DR-CS-PLATFORM-007R/CONFIRM-AND-ENABLE.md",
]);

const proofDir = path.join(ROOT, "proofs", "DR-CS-PLATFORM-007R");
fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(
  path.join(proofDir, "FIRST-FIRE-STOP.md"),
  `# First fire STOP — DR-007R

Governors enabled. **No Lane 1 code change and no Lane 2 trigger was executed.**

PRIME: watch the first fire live with kill switch at \`config/autonomy-killswitch.json\` (\`halt: true\` stops all).

When ready, queue a single W1 typo (Lane 1 prepare-PR-only) or SF1/SF3 (Lane 2) and say go.
`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      w3_tightened: Boolean(w3.explicitly_forbidden_even_under_css?.length),
      sf8_send_path: sf8.send_path,
      lanes: {
        lane1: ks.wmgos_lane1_display_enabled,
        lane2: ks.wmgos_lane2_safe_features_enabled,
      },
      first_fire: "STOPPED",
    },
    null,
    2,
  ),
);
