#!/usr/bin/env python3
"""Apply DR-CS-WIDGET-016 SQL on apxbwdx only.

Requires SUPABASE_ACCESS_TOKEN scoped to apxbwdx. Never qcefkox.
Does not re-run numbering backfill.

  SUPABASE_ACCESS_TOKEN=sbp_… python3 proofs/DR-CS-WIDGET-016/apply-sql.py
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
    / "supabase/migrations/20261001185400_widget_intake_number_and_lock.sql"
)


def main() -> int:
    token = os.environ.get("SUPABASE_ACCESS_TOKEN", "").strip()
    if not token:
        sys.stderr.write(
            "Set SUPABASE_ACCESS_TOKEN scoped to apxbwdx only. Never qcefkox.\n"
        )
        return 3
    sql = SQL_PATH.read_text()
    if FORBIDDEN in sql.lower():
        sys.stderr.write("refusing: SQL mentions forbidden project\n")
        return 2
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
        sys.stderr.write(f"{e.code} {e.read().decode()}\n")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
