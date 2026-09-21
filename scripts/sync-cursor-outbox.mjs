/**
 * Sync durable apx cursor_staging_outbox → repo dispatches/outbox/
 * Command plane: Cursor / operator runs this; console does not require downloads.
 *
 * Usage: node scripts/sync-cursor-outbox.mjs
 * Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env.production / .env.local
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "dispatches", "outbox");

function readEnv() {
  const out = {};
  for (const name of [".env", ".env.local", ".env.production", ".env.production.local"]) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 1) continue;
      const k = t.slice(0, eq).trim();
      const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (k.startsWith("VITE_")) out[k] = v;
    }
  }
  return out;
}

const env = readEnv();
const url = (env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.VITE_SUPABASE_ANON_KEY || "";
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}
if (url.includes("qcefkox")) {
  console.error("Refusing production WMG OS project");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const res = await fetch(
  `${url}/rest/v1/cursor_staging_outbox?select=*&order=created_at.desc&limit=100`,
  {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Accept-Profile": "support",
      "Content-Profile": "support",
    },
  },
);
if (!res.ok) {
  console.error("Fetch failed", res.status, await res.text());
  process.exit(1);
}
const rows = await res.json();
let wrote = 0;
for (const row of rows) {
  const name = `staging-${row.status}-${row.id.slice(0, 8)}-${row.ticket_id.slice(0, 8)}.json`;
  const file = path.join(outDir, name);
  const artifact = {
    schema: "prime.cs.cursor_staging_outbox_artifact.v1",
    synced_at: new Date().toISOString(),
    outbox_id: row.id,
    ticket_id: row.ticket_id,
    status: row.status,
    approved_by: row.approved_by,
    claimed_by: row.claimed_by,
    proposal: row.proposal,
    fence: { never_auto_prod: true, production_ref_forbidden: "qcefkoxqkfwnlqfmwzmi" },
  };
  fs.writeFileSync(file, JSON.stringify(artifact, null, 2));
  wrote += 1;
  console.log("wrote", name);
}
console.log(`Synced ${wrote} artifact(s) → dispatches/outbox/`);
