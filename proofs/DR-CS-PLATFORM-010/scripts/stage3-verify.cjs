const apxAnon =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGJ3ZHhzem1kZmZiZHVoamVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5NDAsImV4cCI6MjEwNTMyODk0MH0.pP72Bq4QbHNCRFvPPl0Lt3UdkCngh1RZG3-MFC94FiQ";
const rxAnon =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aGl5ZHRxem1rc2FlZWd4eXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5ODksImV4cCI6MjEwNTMyODk4OX0.nItKmqCXdwE4hU0wiWjHXMf1VD5I4xFbcMB5jNQgHFI";

async function main() {
  const consoleHtml = await (await fetch("https://david-prime2026.github.io/prime-support-triage/")).text();
  const asset = (consoleHtml.match(/assets\/[^"'>]+\.js/) || [])[0];
  console.log("console asset", asset || "(none)");
  if (asset) {
    const js = await (await fetch("https://david-prime2026.github.io/prime-support-triage/" + asset)).text();
    console.log("console apx url", /https:\/\/apxbwdxszmdffbduhjen\.supabase\.co/.test(js));
    console.log("console rx url", /https:\/\/rxhiydtqzmksaeegxyqo\.supabase\.co/.test(js));
  }

  const wmgHtml = await (await fetch("https://wmgos.primetimesystems.ai")).text();
  const wmgAsset = (wmgHtml.match(/assets\/[^"'>]+\.js/) || [])[0];
  console.log("wmg asset", wmgAsset || "(none)");
  if (wmgAsset) {
    const js = await (await fetch("https://wmgos.primetimesystems.ai/" + wmgAsset)).text();
    console.log("wmg apx url", /https:\/\/apxbwdxszmdffbduhjen\.supabase\.co/.test(js));
    console.log("wmg rx url", /https:\/\/rxhiydtqzmksaeegxyqo\.supabase\.co/.test(js));
  }

  const threadBody = {
    client_id: "a1000001-0001-4001-8001-000000000001",
    surface: "internal",
    user_key: "david@primeai.systems",
    is_mock: true,
    diag_state: { phase: "stage3" },
    messages: [
      {
        id: "s3-1",
        role: "user",
        text: "stage3 thread smoke",
        at: Date.now(),
      },
    ],
  };
  const thr = await fetch(
    "https://apxbwdxszmdffbduhjen.supabase.co/functions/v1/bricely-thread",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apxAnon,
        apikey: apxAnon,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(threadBody),
    },
  );
  const thrText = await thr.text();
  console.log("thread", thr.status, thrText.slice(0, 200));

  async function count(url, anon) {
    const res = await fetch(url + "/rest/v1/support_tickets?select=id&limit=1", {
      headers: {
        apikey: anon,
        Authorization: "Bearer " + anon,
        "Accept-Profile": "support",
        Prefer: "count=exact",
      },
    });
    return res.headers.get("content-range");
  }
  console.log(
    "apx tickets",
    await count("https://apxbwdxszmdffbduhjen.supabase.co", apxAnon),
  );
  console.log(
    "rx tickets",
    await count("https://rxhiydtqzmksaeegxyqo.supabase.co", rxAnon),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
