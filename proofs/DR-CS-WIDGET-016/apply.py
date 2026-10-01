#!/usr/bin/env python3
"""Apply DR-CS-WIDGET-016 SQL on apxbwdxszmdffbduhjen only.

Refuses a token that can see qcefkoxqkfwnlqfmwzmi.
Does not print the token.

  SUPABASE_ACCESS_TOKEN=sbp_… python3 proofs/DR-CS-WIDGET-016/apply.py
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

REF = "apxbwdxszmdffbduhjen"
FORBIDDEN = "qcefkoxqkfwnlqfmwzmi"
SQL_PATH = (
    Path(__file__).resolve().parents[2]
    / "supabase/migrations/20261001185942_dr_cs_widget_016_ticket_seq_definer_and_terminal_lock.sql"
)


def request(token: str, url: str, method: str = "GET", payload: dict | None = None) -> tuple[int, bytes]:
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "prime-support-triage-widget-016",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def main() -> int:
    token = os.environ.get("SUPABASE_ACCESS_TOKEN", "").strip()
    if not token:
        print("SUPABASE_ACCESS_TOKEN unset. Refusing to apply.")
        return 2
    if FORBIDDEN in token:
        print("refusing: token material names the WMG project")
        return 2
    sql = SQL_PATH.read_text()
    if FORBIDDEN in sql.lower():
        print("refusing: SQL mentions the WMG project")
        return 2

    status, raw = request(token, "https://api.supabase.com/v1/projects")
    if status != 200:
        print(f"project list failed HTTP {status}")
        print(raw[:500].decode(errors="replace"))
        return 1
    projects = json.loads(raw.decode())
    refs = {p.get("id") or p.get("ref") for p in projects}
    if FORBIDDEN in refs:
        print("refusing: token can see qcefkox. Use an apxbwdx-only token.")
        return 2
    if REF not in refs:
        print("refusing: token cannot see apxbwdxszmdffbduhjen")
        return 2

    status, raw = request(
        token,
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        "POST",
        {"query": sql},
    )
    text = raw.decode(errors="replace")
    print(f"database/query HTTP {status}")
    print(text[:2000])
    return 0 if status < 300 else 1


if __name__ == "__main__":
    sys.exit(main())
