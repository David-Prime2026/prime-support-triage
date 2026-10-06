#!/usr/bin/env python3
"""Live smoke for bricely-diagnose v6 on apxbwdx (CS main 4e17f46).

Widget-shaped POSTs only. Does not create tickets. Does not touch qcefkox.

  python3 scripts/bricely-diagnose-v6-smoke.py

Pass = terminal lock. Diagnose 200 is the function, not a Wmsosv2 ship.
How-to / Portals card print as OBSERVED so a green lock is not a live widget.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

REF = "apxbwdxszmdffbduhjen"
BASE = os.environ.get("TRIAGE_URL", f"https://{REF}.supabase.co").rstrip("/")
ANON = os.environ.get(
    "TRIAGE_ANON",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGJ3ZHhzem1kZmZiZHVoamVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5NDAsImV4cCI6MjEwNTMyODk0MH0.pP72Bq4QbHNCRFvPPl0Lt3UdkCngh1RZG3-MFC94FiQ",
)
RESOLVED_NUM = os.environ.get("BRICELY_SMOKE_RESOLVED", "WMG-2026-10-002")
OPEN_NUM = os.environ.get("BRICELY_SMOKE_OPEN", "WMG-2026-10-016")
GHOST = "00000000-0000-4000-8000-000000000099"

if "qcefkox" in BASE:
    print("REFUSE: TRIAGE_URL points at qcefkox", file=sys.stderr)
    sys.exit(3)
if REF not in BASE:
    print(f"REFUSE: TRIAGE_URL is not {REF}", file=sys.stderr)
    sys.exit(3)


def req(url: str, method: str = "GET", data: dict | None = None, extra: dict | None = None):
    headers = {
        "apikey": ANON,
        "Authorization": f"Bearer {ANON}",
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    body = None if data is None else json.dumps(data).encode()
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            raw = resp.read().decode()
            return resp.status, raw, dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(), dict(e.headers)


def rest(path: str, extra: dict | None = None):
    headers = {"Accept-Profile": "support"}
    if extra:
        headers.update(extra)
    st, raw, h = req(f"{BASE}{path}", extra=headers)
    try:
        return st, json.loads(raw), h
    except json.JSONDecodeError:
        return st, raw, h


def diagnose(text: str, state: dict):
    st, raw, h = req(
        f"{BASE}/functions/v1/bricely-diagnose",
        "POST",
        {"text": text, "state": state},
    )
    try:
        body = json.loads(raw)
    except json.JSONDecodeError:
        body = {"_raw": raw}
    ref = h.get("sb-project-ref") or h.get("Sb-Project-Ref")
    return st, body, ref


def ticket(number: str):
    st, rows, _ = rest(
        f"/rest/v1/support_tickets?ticket_number=eq.{number}&select=id,ticket_number,status"
    )
    if st != 200 or not isinstance(rows, list) or not rows:
        return None
    return rows[0]


def msg_count(ticket_id: str) -> str | None:
    st, _, h = rest(
        f"/rest/v1/ticket_messages?ticket_id=eq.{ticket_id}&select=id",
        extra={"Prefer": "count=exact", "Range": "0-0"},
    )
    if st not in (200, 206):
        return None
    return h.get("content-range") or h.get("Content-Range")


def line(ok: bool, name: str, detail: str):
    print(f"{'PASS' if ok else 'FAIL'}  {name}  {detail}")
    return ok


fails = 0
print(f"smoke  {BASE}")
print(f"expect diagnose v6 lock from 4e17f46  (function, not Wmsosv2)")

resolved = ticket(RESOLVED_NUM)
open_row = ticket(OPEN_NUM)
if not resolved or resolved.get("status") != "resolved":
    print(f"FAIL  lookup {RESOLVED_NUM} resolved  {resolved}", file=sys.stderr)
    sys.exit(1)
if not open_row or open_row.get("status") in ("resolved", "closed", "auto_resolved"):
    print(f"FAIL  lookup {OPEN_NUM} still-open  {open_row}", file=sys.stderr)
    sys.exit(1)

rid = resolved["id"]
oid = open_row["id"]
before = msg_count(rid)

st, body, ref = diagnose(
    "lock prove missing id",
    {"openTicketId": GHOST, "exchanges": 2, "phase": "escalate"},
)
ok = (
    st == 200
    and ref == REF
    and not body.get("append_to_ticket_id")
    and (body.get("next") or {}).get("openTicketId") in (None, "")
)
fails += not line(ok, "missing id clears lock", f"http={st} ref={ref} append={body.get('append_to_ticket_id')} next={ (body.get('next') or {}).get('openTicketId') } reason={body.get('internal_reason')}")

st, body, ref = diagnose(
    "lock prove after resolved",
    {"openTicketId": rid, "exchanges": 2, "phase": "escalate"},
)
ok = (
    st == 200
    and body.get("internal_reason") == "terminal_ticket_new"
    and not body.get("append_to_ticket_id")
    and (body.get("next") or {}).get("openTicketId") in (None, "")
)
fails += not line(ok, f"{RESOLVED_NUM} creates not appends", f"http={st} reason={body.get('internal_reason')} append={body.get('append_to_ticket_id')} next={(body.get('next') or {}).get('openTicketId')}")

after = msg_count(rid)
ok = before is not None and before == after
fails += not line(ok, f"{RESOLVED_NUM} message count unchanged", f"{before} -> {after}")

st, body, ref = diagnose(
    "lock prove open control",
    {"openTicketId": oid, "exchanges": 2, "phase": "escalate"},
)
ok = (
    st == 200
    and body.get("internal_reason") == "ticket_followup_accepted"
    and body.get("append_to_ticket_id") == oid
    and (body.get("next") or {}).get("openTicketId") == oid
)
fails += not line(ok, f"{OPEN_NUM} still appends", f"http={st} reason={body.get('internal_reason')} append={body.get('append_to_ticket_id')}")

print("\nOBSERVED  (not this smoke — function 200 ≠ live widget)")
st, body, _ = diagnose("what is my tonu", {"screen": "Seller Home"})
print(f"  tonu+Seller Home  {body.get('internal_reason')}  {body.get('terminal')}  (live today: default_escalate_no_reask)")

try:
    st, html, _ = req("https://wmgos.primetimesystems.ai/")
    asset = None
    if isinstance(html, str):
        import re

        m = re.search(r"assets/[^\"']+\.js", html)
        asset = m.group(0) if m else None
    js = ""
    if asset:
        _, js, _ = req(f"https://wmgos.primetimesystems.ai/{asset}")
    print(f"  Portals asset  {asset}")
    print(f"  ticket_number in bundle  {js.count('ticket_number') if isinstance(js, str) else '?'}")
    print(f"  already with our specialist  {js.count('already with our specialist') if isinstance(js, str) else '?'}")
except Exception as e:
    print(f"  Portals bundle skip  {e}")

if fails:
    print(f"\nLOCK SMOKE FAIL  {fails} check(s)")
    sys.exit(1)
print("\nLOCK SMOKE PASS  diagnose v6 on apx")
