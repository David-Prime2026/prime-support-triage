/**
 * Playwright rerun for P0: Skip five-line diagnose path + live bundle F$ catch check.
 * Does not log into WMG (no session on this VM). Diagnose is the widget brain.
 *
 *   npm install --no-save @playwright/test
 *   npx playwright test proofs/DR-CS-PLATFORM-008/skip-replay.pw.ts --config=proofs/DR-CS-PLATFORM-008/playwright.config.ts
 */
import { test, expect } from "@playwright/test";

const ANON =
  process.env.TRIAGE_ANON ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGJ3ZHhzem1kZmZiZHVoamVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5NDAsImV4cCI6MjEwNTMyODk0MH0.pP72Bq4QbHNCRFvPPl0Lt3UdkCngh1RZG3-MFC94FiQ";

const LINES = [
  "Change the price period on the sales memo for GW Ind of Lane County",
  "How can I pull up the sales memo",
  "Change it so September price runs through 10/3",
  "Search for GW Eugene returns nothing",
  "There is no dropdown after typing a name",
];

test("live bundle still has F$ catch until Wmsosv2 copies wCe.remote", async ({ request }) => {
  const html = await request.get("https://wmgos.primetimesystems.ai/");
  expect(html.ok()).toBeTruthy();
  const text = await html.text();
  const asset = text.match(/assets\/[^"']+\.js/)?.[0];
  expect(asset).toBeTruthy();
  const js = await request.get(`https://wmgos.primetimesystems.ai/${asset}`);
  const body = await js.text();
  expect(body).toContain("bricely-diagnose");
  // Remaining P0: catch still assigns F$
  expect(body.includes("catch{_t=F$") || body.includes("catch { _t = F$") || /catch\{_t=F\$/.test(body)).toBeTruthy();
});

test("Skip five lines on live diagnose — last turn escalates, no invented UI", async ({ request }) => {
  let state: Record<string, unknown> = {};
  let last: { terminal?: string; reply?: string } = {};
  for (const text of LINES) {
    const res = await request.post(
      "https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-diagnose",
      {
        headers: {
          apikey: ANON,
          Authorization: `Bearer ${ANON}`,
          "Content-Type": "application/json",
        },
        data: { text, state },
      },
    );
    expect(res.ok(), await res.text()).toBeTruthy();
    last = (await res.json()) as { terminal?: string; reply?: string; next?: Record<string, unknown> };
    expect(last.reply ?? "").not.toMatch(
      /pencil|what.?s going on|tell me what you.?re trying to do|which screen (is this|you are) on/i,
    );
    state = (last as { next?: Record<string, unknown> }).next ?? state;
  }
  expect(last.terminal).toBe("escalate");
});
