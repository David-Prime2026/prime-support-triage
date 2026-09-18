import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Prefer support-triage/.env.local over inherited shell env (remote keys poison Accept-Profile: support). */
function readLocalViteEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of [".env.local", ".env"]) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (key.startsWith("VITE_") && !(key in out)) out[key] = val;
    }
  }
  return out;
}

const localEnv = readLocalViteEnv();
const supabaseUrl = localEnv.VITE_SUPABASE_URL ?? "http://127.0.0.1:54341";
const supabaseAnon = localEnv.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl.includes("127.0.0.1") && !supabaseUrl.includes("localhost")) {
  console.warn(
    `[support-triage] Refusing non-local VITE_SUPABASE_URL from file (${supabaseUrl}). Isolated stack only.`,
  );
}

export default defineConfig({
  plugins: [react()],
  // Force file-based local keys — parent Cursor/shell env often points at a remote project
  // without the `support` schema → PostgREST "Invalid schema: support".
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnon),
  },
  server: {
    host: "127.0.0.1",
    port: 5179,
    strictPort: true,
  },
});
