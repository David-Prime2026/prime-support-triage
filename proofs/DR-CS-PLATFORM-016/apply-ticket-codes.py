#!/usr/bin/env python3
"""Refuses to apply. Numbering is already live on apxbwdx.

PRIME 2026-09-30: do not re-apply from this VM. That duplicates work.
Keep this machine git-only. Do not drop SUPABASE_ACCESS_TOKEN here unless it
is scoped to apxbwdx only. Never a qcefkox token.

Desk shows ticket_number. SQL stays in prime-support-triage as a kernel copy.
"""
from __future__ import annotations

import sys

MESSAGE = """refusing: ticket_number is already live on apxbwdx.

Do not re-apply supabase/migrations/20260930155607_ticket_codes_purge_mocks.sql
from this VM. That duplicates work.

CS job: show ticket_number on the desk; keep the SQL in git.
Token: git-only unless later apx-only CLI for OTHER schema. Never qcefkox.
See proofs/DR-CS-PLATFORM-016/TICKET-NUMBERS.md and
handoffs/DR-CS-PLATFORM-016/PORT-SHAPE.md.
"""


def main() -> int:
    sys.stderr.write(MESSAGE)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
