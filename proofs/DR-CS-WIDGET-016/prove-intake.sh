#!/usr/bin/env bash
# Prove widget intake A1 on apxbwdx. Never qcefkox.
# Usage: bash proofs/DR-CS-WIDGET-016/prove-intake.sh
set -euo pipefail
ANON="${TRIAGE_ANON:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGJ3ZHhzem1kZmZiZHVoamVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5NDAsImV4cCI6MjEwNTMyODk0MH0.pP72Bq4QbHNCRFvPPl0Lt3UdkCngh1RZG3-MFC94FiQ}"
BASE="https://apxbwdxszmdffbduhjen.supabase.co"
CLIENT="a1000001-0001-4001-8001-000000000001"

code=$(curl -sS -o /tmp/widget-intake.json -w '%{http_code}' -X POST "$BASE/functions/v1/intake-ticket" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON" \
  -H "Authorization: Bearer $ANON" \
  -d "{\"client_id\":\"$CLIENT\",\"source_channel\":\"widget\",\"message\":\"DR-CS-WIDGET-016 prove widget intake\"}")
echo "POST $code"
cat /tmp/widget-intake.json
echo
python3 - <<'PY'
import json
from pathlib import Path
raw = Path("/tmp/widget-intake.json").read_text()
data = json.loads(raw)
ticket = data.get("ticket") or {}
tid = ticket.get("id")
print("ticket.id", tid)
print("ticket_number", ticket.get("ticket_number"))
if not tid:
    raise SystemExit("missing ticket.id")
PY
