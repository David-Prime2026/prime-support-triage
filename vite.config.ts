import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const WMG_OS_PROD = "qcefkoxqkfwnlqfmwzmi";
const TRIAGE_OK = ["rxhiydtqzmksaeegxyqo", "apxbwdxszmdffbduhjen"];

function readViteEnvFiles(): Record<string, string> {
  const out: Record<string, string> = {};
  // Later files win for production overlays
  for (const name of [".env", ".env.local", ".env.production", ".env.production.local"]) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (key.startsWith("VITE_")) out[key] = val;
    }
  }
  return out;
}

function isAllowedUrl(u: string) {
  if (!u) return false;
  if (u.includes(WMG_OS_PROD)) return false;
  if (u.includes("127.0.0.1") || u.includes("localhost")) return true;
  return TRIAGE_OK.some((ref) => u.includes(ref));
}

const fileEnv = readViteEnvFiles();
const isBuild = process.argv.includes("build");
const supabaseUrl =
  fileEnv.VITE_SUPABASE_URL ||
  (isBuild ? "https://rxhiydtqzmksaeegxyqo.supabase.co" : "http://127.0.0.1:54341");
const supabaseAnon = fileEnv.VITE_SUPABASE_ANON_KEY || "";

if (!isAllowedUrl(supabaseUrl)) {
  throw new Error(
    `[support-triage] Refusing VITE_SUPABASE_URL=${supabaseUrl}. Use local or isolated staging only.`,
  );
}

const base = process.env.VITE_BASE || (isBuild ? "/prime-support-triage/" : "/");

export default defineConfig({
  plugins: [react()],
  base,
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
