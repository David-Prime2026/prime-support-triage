#!/usr/bin/env python3
"""Retire smoke / duplicate / superseded support tickets on apxbwdx.

PRIME 2026-09-28: work already done is approved. No customer thread notify.
Never touches qcefkox.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone

ANON = os.environ.get(
    "TRIAGE_ANON",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGJ3ZHhzem1kZmZiZHVoamVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5NDAsImV4cCI6MjEwNTMyODk0MH0.pP72Bq4QbHNCRFvPPl0Lt3UdkCngh1RZG3-MFC94FiQ",
)
BASE = "https://apxbwdxszmdffbduhjen.supabase.co"
NOW = datetime.now(timezone.utc).isoformat()
CLOSED_BY = "PRIME 2026-09-28 backlog retire. Work already done is approved. No customer notify."

KEEP_PREFIX = {
    "5dc41a1a": (
        "in_progress",
        "Code path live 2026-09-28. Prove one real split (Alisa example) then close. See WMG-CURRENT-STATE.md.",
    ),
    "9f2ca521": (
        "sent_to_engineering",
        "Diagnose v4 live. Remaining is Wmsosv2 embed: delete F$ catch. See WMG-CURRENT-STATE.md.",
    ),
    "3297801d": (
        "sent_to_engineering",
        "Skip: Lane County September price through 10/3 + memo search/alias. Pricing — Skip only. See WMG-CURRENT-STATE.md.",
    ),
    "7b807646": (
        "sent_to_engineering",
        "Release numbers 8/31–10/3 stay 09 (pricing month). Same family as 3297801d. See WMG-CURRENT-STATE.md.",
    ),
    "af441aa2": (
        "sent_to_engineering",
        "Delete wrong Middle TN / Foundry location rows. Alisa lacks permission. See WMG-CURRENT-STATE.md.",
    ),
    "08a999c0": (
        "sent_to_engineering",
        "Change buyer on memo returned Edge Function error. See WMG-CURRENT-STATE.md.",
    ),
    "87b47aae": None,  # already resolved
    "a282b3e2": None,
}

RETIRE_NOTE = {
    "duplicate_omaha": "Duplicate of resolved Omaha Portals ticket 87b47aae. Retired.",
    "duplicate_wichita": "Duplicate execute note of resolved Wichita prefill ticket a282b3e2. Retired.",
    "smoke": "Smoke / DR proof / OPEN-TEST. Retired; not a live customer bug.",
    "gmail_proof": "Bricely Gmail intake / signature send-test. Pipe proved; ticket is not a live customer case. Retired.",
    "portals_exists": "Multi-employee login is Portals invite-portal-user (principal vs seller). Same capability used on Omaha 87b47aae. Retired.",
    "global_role_mock": "MOCK thread asking for a new global role. Existing principal/seller cover multi-user. Retired unless reopened as a change order.",
    "incomplete": "Incomplete catch-net (no exact issue). Retired. Reopen if they name the record.",
    "welcome_name": "Welcome-name liveFix is the embed verb (WMG-CURRENT-STATE item 1). Retired as a standalone ticket.",
}


def req(method: str, path: str, body: dict | None = None, prefer: str | None = None):
    data = None if body is None else json.dumps(body).encode()
    headers = {
        "apikey": ANON,
        "Authorization": f"Bearer {ANON}",
        "Accept-Profile": "support",
        "Content-Type": "application/json",
    }
    if method in ("POST", "PATCH", "PUT"):
        headers["Content-Profile"] = "support"
    if prefer:
        headers["Prefer"] = prefer
    r = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise SystemExit(f"{method} {path} -> {e.code} {err}") from e


def classify(t: dict) -> tuple[str, str] | None:
    """Return (status, note) to apply, or None to skip."""
    prefix = t["id"][:8]
    if prefix in KEEP_PREFIX:
        keep = KEEP_PREFIX[prefix]
        if keep is None:
            return None
        if t["status"] == keep[0] and (t.get("resolution_notes") or "").find(keep[1][:40]) >= 0:
            return None
        return keep

    raw = (t.get("raw_message") or "").lower()
    email = (t.get("requester_email") or "").lower()
    mock = bool(t.get("is_mock"))

    if prefix == "c283c80a":
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['duplicate_wichita']}"
    if prefix in ("f206e13f", "d700e5a9"):
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['duplicate_omaha']}"
    if prefix == "6b27e0c2":
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['portals_exists']}"
    if prefix == "93e12382":
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['global_role_mock']}"
    if prefix == "6ba47962":
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['welcome_name']}"
    if prefix in ("bb841682", "fbd5e684", "64d2b883"):
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['incomplete']}"

    if t["status"] in ("resolved", "closed"):
        return None

    if mock or raw.startswith("open-test") or raw.startswith("dr-005") or raw.startswith("dr-006") or raw.startswith("dr-010"):
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['smoke']}"
    if "smoke-" in email or email.startswith("ops-smoke@"):
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['smoke']}"
    if "bricely send test" in raw or "dr-008 intake proof" in raw:
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['gmail_proof']}"
    if email.endswith("@primeai.systems") and t.get("source_channel") == "widget":
        return "resolved", f"{CLOSED_BY} {RETIRE_NOTE['smoke']}"
    return None


def main() -> None:
    _, tickets = req(
        "GET",
        "/rest/v1/support_tickets?select=id,status,requester_email,raw_message,is_mock,client_id,resolution_notes&limit=200",
    )
    assert isinstance(tickets, list)
    applied = []
    skipped = []
    for t in tickets:
        plan = classify(t)
        if not plan:
            skipped.append((t["id"][:8], t["status"], (t.get("raw_message") or "")[:60]))
            continue
        status, notes = plan
        patch = {
            "status": status,
            "resolution_notes": notes,
            "updated_at": NOW,
        }
        if status in ("resolved", "closed"):
            patch["resolved_at"] = NOW
            patch["cursor_execution_status"] = "done"
        _, rows = req(
            "PATCH",
            f"/rest/v1/support_tickets?id=eq.{t['id']}",
            patch,
            prefer="return=representation",
        )
        msg = {
            "ticket_id": t["id"],
            "client_id": t["client_id"],
            "author_role": "cursor",
            "channel": "admin",
            "body": f"[Backlog retire] {status}: {notes}",
        }
        req("POST", "/rest/v1/ticket_messages", msg, prefer="return=minimal")
        applied.append((t["id"][:8], t["status"], status, notes[:80]))

    print(f"applied {len(applied)}")
    for row in applied:
        print(" ", row)
    print(f"skipped {len(skipped)}")
    for row in skipped:
        print(" ", row)


if __name__ == "__main__":
    main()
