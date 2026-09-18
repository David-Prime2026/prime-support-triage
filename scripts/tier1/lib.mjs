/**
 * Tier 1 autonomy governor — kill switch, fence, classifier, serial execute, live log.
 * Isolation: never targets WMG OS prod ref qcefkoxqkfwnlqfmwzmi.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const CONFIG = path.join(ROOT, "config");
export const PROOFS = path.join(ROOT, "proofs", "DR-CS-PLATFORM-006");
export const EXEC_LOG = path.join(ROOT, "executions", "live-log.jsonl");
export const CONTROL_PLANE = path.join(ROOT, "CONTROL_PLANE.md");
export const WMG_OS_PROD_REF = "qcefkoxqkfwnlqfmwzmi";

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

export function ensureDirs() {
  fs.mkdirSync(PROOFS, { recursive: true });
  fs.mkdirSync(path.dirname(EXEC_LOG), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "dispatches", "outbox"), { recursive: true });
}

export function killswitchPath() {
  return path.join(CONFIG, "autonomy-killswitch.json");
}

export function loadKillswitch() {
  return readJson(killswitchPath());
}

export function setKillswitch(patch) {
  const cur = loadKillswitch();
  const next = {
    ...cur,
    ...patch,
    set_at: new Date().toISOString(),
    set_by: patch.set_by || "cursor",
  };
  writeJson(killswitchPath(), next);
  return next;
}

export function isHalted(ks = loadKillswitch()) {
  if (ks.halt === true) return { halted: true, reason: "file_halt" };
  if (String(process.env.CURSOR_DEV_AUTONOMY || "").toLowerCase() === "off") {
    return { halted: true, reason: "env_CURSOR_DEV_AUTONOMY=off" };
  }
  if (!ks.tier1_autonomy_enabled) return { halted: true, reason: "tier1_autonomy_enabled=false" };
  return { halted: false, reason: null };
}

export function loadFence() {
  const ratified = path.join(CONFIG, "risk-fence.json");
  if (!fs.existsSync(ratified)) {
    throw new Error("risk-fence.json missing — load ratified fence before Tier 1");
  }
  return readJson(ratified);
}

export function loadClassifier() {
  const ratified = path.join(CONFIG, "bug-change-classification.json");
  if (!fs.existsSync(ratified)) {
    throw new Error("bug-change-classification.json missing — load ratified classifier before Tier 1");
  }
  return readJson(ratified);
}

/** Append one JSONL line immediately (real-time log). */
export function liveLog(entry) {
  ensureDirs();
  const row = { at: new Date().toISOString(), ...entry };
  fs.appendFileSync(EXEC_LOG, JSON.stringify(row) + "\n", "utf8");
  return row;
}

/** Prepend a short banner block to CONTROL_PLANE (real-time visible). */
export function controlPlaneAppend(title, bodyLines) {
  const stamp = new Date().toISOString();
  const block =
    `\n## ${title} — ${stamp}\n\n` +
    bodyLines.map((l) => `- ${l}`).join("\n") +
    "\n";
  const existing = fs.readFileSync(CONTROL_PLANE, "utf8");
  // Insert after the Gate section header block (top) — prepend after line 22 separator
  const marker = "\n---\n\n";
  const idx = existing.indexOf(marker);
  if (idx === -1) {
    fs.writeFileSync(CONTROL_PLANE, block + existing, "utf8");
  } else {
    const insertAt = idx + marker.length;
    fs.writeFileSync(
      CONTROL_PLANE,
      existing.slice(0, insertAt) + block + existing.slice(insertAt),
      "utf8",
    );
  }
  liveLog({ type: "control_plane_append", title });
  return stamp;
}

export function writeProof(name, content) {
  ensureDirs();
  const file = path.join(PROOFS, name);
  fs.writeFileSync(file, content, "utf8");
  return file;
}

/**
 * Conservative classifier. Defaults DOWN on uncertainty.
 * item: { id, summary, category?, touches?, hard_flags?, confidence?, class_hint? }
 */
export function classifyItem(item, fence = loadFence(), method = loadClassifier()) {
  const summary = String(item.summary || "");
  const touches = (item.touches || []).map(String);
  const hard = new Set([...(item.hard_flags || [])]);

  // Prod ref touch → always block
  if (
    touches.some((t) => t.includes(WMG_OS_PROD_REF)) ||
    /qcefkoxqkfwnlqfmwzmi/i.test(summary) ||
    hard.has("H6")
  ) {
    return blocked(item, "H6", "prod_ref_qcefkox blocked", method);
  }

  const money = /invoice|aging|ar\b|pricing|commission|payment|qbo|memo\s*amount|dollar/i;
  const auth = /auth|jwt|password|invite|portal.?bind|rls|login/i;
  const schema = /migration|schema|grant|rls|rpc\b|edge.?function/i;
  const external = /sendgrid|webhook|stripe|external.?contract/i;
  const dispatch = /approve.?handoff|dispatch.?gate|authorization/i;

  if (money.test(summary) || hard.has("H1")) return blocked(item, "H1", "money/AR/pricing", method);
  if (auth.test(summary) || hard.has("H2")) return blocked(item, "H2", "auth/portal", method);
  if (schema.test(summary) || hard.has("H3")) return blocked(item, "H3", "schema/RLS", method);
  if (external.test(summary) || hard.has("H4")) return blocked(item, "H4", "external contracts", method);
  if (dispatch.test(summary) || hard.has("H5")) return blocked(item, "H5", "dispatch/approve gates", method);
  if (item.confidence === "unsure" || hard.has("H7") || /unsure|not sure|maybe/i.test(summary)) {
    return blocked(item, "H7", "cursor unsure — default DOWN", method);
  }

  // Fence category
  const cat = item.category || inferCategory(summary);
  const fenceRow = (fence.in_fence || []).find((f) => f.id === cat || f.category === cat);
  if (!fenceRow) {
    return {
      id: item.id,
      class: "ambiguous",
      tier: "stage_or_notify",
      straight_to_prod: false,
      action: "block",
      reason: "outside_ratified_fence",
      default_down: true,
    };
  }
  if (fence.explicitly_excluded?.includes(cat)) {
    return blocked(item, "fence_excluded", cat, method);
  }

  // Change / ambiguous signals (word-boundary — do not match "support console")
  if (
    /\b(add|support|allow|also)\b.+\b(feature|capability|workflow)\b/i.test(summary) ||
    /^(add|support|allow|also)\b/i.test(summary.trim()) ||
    /\b(new feature|redesign|would be better)\b/i.test(summary)
  ) {
    return {
      id: item.id,
      class: "change",
      tier: "n/a_product",
      straight_to_prod: false,
      action: "block",
      reason: "D1_change_not_bug",
      default_down: true,
    };
  }

  const looksTypo =
    /typo|wrong string|label|copy|misspell|display text|css spacing|unused import|comment only/i.test(
      summary,
    ) || cat === "F1" || cat === "F2" || cat === "F3" || cat === "F4";

  if (!looksTypo && item.class_hint !== "bug") {
    return {
      id: item.id,
      class: "ambiguous",
      tier: "stage_or_notify",
      straight_to_prod: false,
      action: "block",
      reason: "D5_no_clear_anchor_default_down",
      default_down: true,
    };
  }

  const prodAllowed = fenceRow.prod_allowed === true && method.prod_eligible_tier_enabled === true;
  const tier = item.tier_hint || "1.1";
  const bandA = ["1.1", "1.2", "1.3", "1.4", "1.5"].includes(tier);

  if (!bandA) {
    return {
      id: item.id,
      class: "bug",
      tier,
      fence: fenceRow.id,
      straight_to_prod: false,
      action: "stage",
      reason: "staging_band_1.6_1.10",
    };
  }

  if (!prodAllowed) {
    return {
      id: item.id,
      class: "bug",
      tier,
      fence: fenceRow.id,
      straight_to_prod: false,
      action: "stage",
      reason: "fence_prod_allowed_false_or_method_off",
    };
  }

  return {
    id: item.id,
    class: "bug",
    tier,
    fence: fenceRow.id,
    straight_to_prod: true,
    action: "execute",
    reason: "fenced_light_bug_1.1_1.5",
  };
}

function blocked(item, code, detail, method) {
  return {
    id: item.id,
    class: "disqualified",
    tier: "blocked",
    straight_to_prod: false,
    action: "block",
    reason: `${code}:${detail}`,
    default_down: true,
    method_version: method.version,
  };
}

function inferCategory(summary) {
  if (/css|spacing|layout|color/i.test(summary)) return "F2";
  if (/unused import|dead code/i.test(summary)) return "F3";
  if (/comment|jsdoc|control.?plane/i.test(summary)) return "F4";
  if (/typo|label|copy|string|display/i.test(summary)) return "F1";
  return "unknown";
}

/**
 * Execute one dispatch serially. Polls kill switch between steps.
 * fixFn optional async (ctx) => result for real file edits; otherwise dry-run.
 */
export async function runOneDispatch(dispatch, { fixFn, steps = 4, pollMs = 200, proofMode = false } = {}) {
  const id = dispatch.id || `DISP-${Date.now()}`;
  liveLog({ type: "dispatch_start", id, summary: dispatch.summary });

  const halt0 = isHalted();
  if (halt0.halted && !proofMode) {
    liveLog({ type: "dispatch_halted_before_start", id, reason: halt0.reason });
    return { ok: false, halted: true, phase: "before_start", reason: halt0.reason, id };
  }

  const classification = classifyItem(dispatch);
  liveLog({ type: "classified", id, classification });
  if (classification.action === "block") {
    liveLog({ type: "dispatch_blocked", id, classification });
    return { ok: false, blocked: true, classification, id };
  }
  if (classification.action === "stage" && !proofMode) {
    liveLog({ type: "dispatch_staged", id, classification });
    return { ok: false, staged: true, classification, id };
  }

  for (let step = 1; step <= steps; step++) {
    // Always re-check kill switch between steps (A1 mid-flight)
    const ks = loadKillswitch();
    const envOff = String(process.env.CURSOR_DEV_AUTONOMY || "").toLowerCase() === "off";
    if (ks.halt === true || envOff) {
      const reason = ks.halt === true ? "file_halt" : "env_CURSOR_DEV_AUTONOMY=off";
      liveLog({ type: "dispatch_halted_mid_flight", id, step, reason });
      return { ok: false, halted: true, phase: "mid_flight", step, reason, id };
    }
    if (!proofMode && !ks.tier1_autonomy_enabled) {
      liveLog({ type: "dispatch_halted_mid_flight", id, step, reason: "tier1_autonomy_enabled=false" });
      return {
        ok: false,
        halted: true,
        phase: "mid_flight",
        step,
        reason: "tier1_autonomy_enabled=false",
        id,
      };
    }
    liveLog({ type: "dispatch_step", id, step, of: steps });
    await sleep(pollMs);
  }

  let fixResult = null;
  if (typeof fixFn === "function") {
    fixResult = await fixFn(dispatch);
    liveLog({ type: "fix_applied", id, fixResult });
  } else {
    liveLog({ type: "fix_dry_run", id, summary: dispatch.summary });
    fixResult = { dryRun: true };
  }

  liveLog({ type: "dispatch_complete", id, classification, fixResult });
  return { ok: true, id, classification, fixResult };
}

/** Serial queue — never parallel. */
export async function runQueue(items, opts = {}) {
  const results = [];
  liveLog({ type: "queue_start", count: items.length, mode: "serial" });
  for (const item of items) {
    // Re-check halt between items
    const halt = isHalted();
    if (halt.halted && !opts.proofMode) {
      liveLog({ type: "queue_halted", at_item: item.id, reason: halt.reason });
      results.push({ ok: false, halted: true, id: item.id, reason: halt.reason });
      break;
    }
    const r = await runOneDispatch(item, opts);
    results.push(r);
  }
  liveLog({ type: "queue_done", count: results.length });
  return results;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
