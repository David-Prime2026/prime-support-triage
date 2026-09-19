#!/usr/bin/env bash
# Deploy bricely-diagnose to the staging project the live WMG widget already uses.
# NEVER point this at WMG OS prod qcefkoxqkfwnlqfmwzmi.
set -euo pipefail
PROJECT_REF="${1:-rxhiydtqzmksaeegxyqo}"
if [[ "$PROJECT_REF" == "qcefkoxqkfwnlqfmwzmi" ]]; then
  echo "Refusing to deploy to WMG OS production." >&2
  exit 2
fi
npx --yes supabase functions deploy bricely-diagnose --project-ref "$PROJECT_REF" --no-verify-jwt
echo "Deployed. Prove with:"
echo "  curl -s -X POST https://${PROJECT_REF}.supabase.co/functions/v1/bricely-diagnose -H 'Content-Type: application/json' -d '{\"text\":\"The load board still shows yesterday loads even after I cleared the filters.\"}'"
