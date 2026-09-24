#!/usr/bin/env bash
# Deploy Bricely intake/classify/thread to the isolated triage project.
# Default: parent apxbwdxszmdffbduhjen (live WMG embed already calls this).
# NEVER qcefkoxqkfwnlqfmwzmi.
set -euo pipefail
PROJECT_REF="${1:-apxbwdxszmdffbduhjen}"
if [[ "$PROJECT_REF" == "qcefkoxqkfwnlqfmwzmi" ]]; then
  echo "Refusing to deploy to WMG OS production." >&2
  exit 2
fi
if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN unset — cannot deploy from this VM. Set it and re-run." >&2
  echo "  npx supabase functions deploy email-intake intake-ticket process-ticket-ai bricely-thread bricely-diagnose --project-ref $PROJECT_REF --no-verify-jwt" >&2
  exit 3
fi
cd "$(dirname "$0")/.."
for fn in email-intake intake-ticket process-ticket-ai bricely-thread bricely-diagnose; do
  echo "Deploying $fn → $PROJECT_REF"
  npx --yes supabase functions deploy "$fn" --project-ref "$PROJECT_REF" --no-verify-jwt
done
echo "Deployed to https://${PROJECT_REF}.supabase.co/functions/v1/"
