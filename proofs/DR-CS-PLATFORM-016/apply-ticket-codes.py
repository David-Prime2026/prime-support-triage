#!/usr/bin/env python3
"""Apply ticket codes + purge mocks on apxbwdx only.

Requires SUPABASE_ACCESS_TOKEN (personal or scoped). Never qcefkox.

  SUPABASE_ACCESS_TOKEN=sbp_… python3 proofs/DR-CS-PLATFORM-016/apply-ticket-codes.py
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
SQL_PATH = Path(__file__).resolve().parents[2] / "supabase/migrations/20260930155607_ticket_codes_purge_mocks.sql"


def main() -> None:
    token = os.environ.get("SUPABASE_ACCESS_TOKEN", "").strip()
    if not token:
        raise SystemExit("Set SUPABASE_ACCESS_TOKEN. Never point this at qcefkox.")
    sql = SQL_PATH.read_text()
    if FORBIDDEN in sql.lower():
        raise SystemExit("refusing: SQL mentions forbidden project")
    url = f"https://api.supabase.com/v1/projects/{REF}/database/query"
    body = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            print(resp.status, raw[:2000].decode() if raw else "ok")
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{e.code} {e.read().decode()}") from e


if __name__ == "__main__":
    sys.exit(main() or 0)
