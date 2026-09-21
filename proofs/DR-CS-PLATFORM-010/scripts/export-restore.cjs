const fs = require("fs");
const path = require("path");

const RX = "https://rxhiydtqzmksaeegxyqo.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aGl5ZHRxem1rc2FlZWd4eXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5ODksImV4cCI6MjEwNTMyODk4OX0.nItKmqCXdwE4hU0wiWjHXMf1VD5I4xFbcMB5jNQgHFI";
const root = path.join(__dirname, "..");
const exportDir = path.join(root, "data-export");
const restoreDir = path.join(root, "restore");

const tables = [
  "clients",
  "client_contracts",
  "auto_resolve_allowlist",
  "support_tickets",
  "ticket_messages",
  "ticket_events",
  "ticket_attachments",
  "engineering_handoffs",
  "bricely_threads",
  "bricely_thread_messages",
];

function quote(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function sqlLiteral(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "object") return quote(JSON.stringify(v)) + "::jsonb";
  return quote(String(v));
}

async function fetchTable(t) {
  const res = await fetch(RX + "/rest/v1/" + t + "?select=*", {
    headers: {
      apikey: ANON,
      Authorization: "Bearer " + ANON,
      "Accept-Profile": "support",
    },
  });
  if (!res.ok) throw new Error(t + " " + res.status + " " + (await res.text()));
  return await res.json();
}

function insertSQL(table, rows, castMap = {}) {
  if (!rows.length) return "-- empty " + table + "\n";
  const cols = Object.keys(rows[0]);
  return (
    rows
      .map((row) => {
        const vals = cols.map((c) => {
          const v = row[c];
          const cast = castMap[c];
          if (cast === "uuid[]") {
            if (v == null) return "NULL";
            if (Array.isArray(v) && v.length === 0) return "'{}'::uuid[]";
            if (Array.isArray(v)) return quote("{" + v.join(",") + "}") + "::uuid[]";
            return quote(String(v)) + "::uuid[]";
          }
          if (cast === "uuid") return v == null ? "NULL" : quote(String(v)) + "::uuid";
          if (cast === "timestamptz")
            return v == null ? "NULL" : quote(String(v)) + "::timestamptz";
          if (cast === "jsonb")
            return v == null ? "NULL" : quote(JSON.stringify(v)) + "::jsonb";
          if (cast === "numeric") return v == null ? "NULL" : String(v);
          if (cast === "date") return v == null ? "NULL" : quote(String(v)) + "::date";
          return sqlLiteral(v);
        });
        return (
          "INSERT INTO support." +
          table +
          " (" +
          cols.join(",") +
          ") VALUES (" +
          vals.join(",") +
          ") ON CONFLICT (id) DO NOTHING;"
        );
      })
      .join("\n") + "\n"
  );
}

const casts = {
  clients: { id: "uuid", created_at: "timestamptz" },
  client_contracts: {
    id: "uuid",
    client_id: "uuid",
    covered_scope: "jsonb",
    excluded_scope: "jsonb",
    sla_terms: "jsonb",
    effective_date: "date",
    created_at: "timestamptz",
  },
  auto_resolve_allowlist: { id: "uuid", client_id: "uuid", created_at: "timestamptz" },
  support_tickets: {
    id: "uuid",
    client_id: "uuid",
    attachments: "jsonb",
    human_override: "jsonb",
    created_at: "timestamptz",
    updated_at: "timestamptz",
    resolved_at: "timestamptz",
    ai_confidence: "numeric",
  },
  ticket_messages: {
    id: "uuid",
    ticket_id: "uuid",
    client_id: "uuid",
    attachment_ids: "uuid[]",
    created_at: "timestamptz",
  },
  ticket_events: {
    id: "uuid",
    ticket_id: "uuid",
    payload: "jsonb",
    created_at: "timestamptz",
  },
  ticket_attachments: {
    id: "uuid",
    ticket_id: "uuid",
    client_id: "uuid",
    created_at: "timestamptz",
  },
  engineering_handoffs: {
    id: "uuid",
    ticket_id: "uuid",
    structured_issue: "jsonb",
    approved_at: "timestamptz",
    created_at: "timestamptz",
  },
  bricely_threads: {
    id: "uuid",
    client_id: "uuid",
    diag_state: "jsonb",
    open_ticket_id: "uuid",
    created_at: "timestamptz",
    updated_at: "timestamptz",
  },
  bricely_thread_messages: {
    id: "uuid",
    thread_id: "uuid",
    client_id: "uuid",
    card: "jsonb",
    attachments: "jsonb",
    created_at: "timestamptz",
  },
};

(async () => {
  fs.mkdirSync(exportDir, { recursive: true });
  fs.mkdirSync(restoreDir, { recursive: true });

  const all = {};
  for (const t of tables) {
    const rows = await fetchTable(t);
    all[t] = rows;
    fs.writeFileSync(path.join(exportDir, t + ".json"), JSON.stringify(rows, null, 2));
    console.log("exported", t, rows.length);
  }

  let sql = "-- DR-010 Stage 2 restore rxhiyd -> apx\nBEGIN;\n\n";
  for (const t of tables) {
    sql += "-- === " + t + " (" + all[t].length + ") ===\n";
    sql += insertSQL(t, all[t], casts[t] || {});
    sql += "\n";
  }
  sql += "COMMIT;\n";
  fs.writeFileSync(path.join(restoreDir, "restore_all.sql"), sql);
  console.log("wrote restore_all.sql", sql.length, "bytes");

  for (const t of tables) {
    fs.writeFileSync(path.join(restoreDir, t + ".sql"), insertSQL(t, all[t], casts[t] || {}));
  }
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
