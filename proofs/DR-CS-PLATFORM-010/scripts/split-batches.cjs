const fs = require("fs");
const path = require("path");
const restore = path.join(__dirname, "..", "restore");

function splitFile(name, size) {
  const full = path.join(restore, name);
  const stmts = fs
    .readFileSync(full, "utf8")
    .trim()
    .split(/;\r?\n/)
    .filter(Boolean)
    .map((s) => (s.endsWith(";") ? s : s + ";"));
  console.log(name, "stmts", stmts.length);
  const base = name.replace(/\.sql$/, "");
  for (let i = 0; i < stmts.length; i += size) {
    const batch = stmts.slice(i, i + size).join("\n") + "\n";
    const n = Math.floor(i / size) + 1;
    const out = path.join(restore, base + "_b" + n + ".sql");
    fs.writeFileSync(out, batch);
    console.log("wrote", path.basename(out), batch.length);
  }
}

splitFile("support_tickets.sql", 8);
splitFile("ticket_messages.sql", 10);
splitFile("ticket_events.sql", 11);
