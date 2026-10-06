# Live diagnose v6 lock smoke — apxbwdx only. No new tickets. Not Wmsosv2.
# Paste in PowerShell from any folder, or:
#   powershell -File scripts\bricely-diagnose-v6-smoke.ps1

$ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGJ3ZHhzem1kZmZiZHVoamVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTI5NDAsImV4cCI6MjEwNTMyODk0MH0.pP72Bq4QbHNCRFvPPl0Lt3UdkCngh1RZG3-MFC94FiQ'
$BASE = 'https://apxbwdxszmdffbduhjen.supabase.co'
$H = @{
  apikey          = $ANON
  Authorization   = "Bearer $ANON"
  'Content-Type'  = 'application/json'
}

function Invoke-DiagnoseSmoke([string]$Name, [hashtable]$Payload) {
  $json = $Payload | ConvertTo-Json -Depth 8 -Compress
  $r = Invoke-RestMethod -Method Post -Uri "$BASE/functions/v1/bricely-diagnose" -Headers $H -Body $json
  [pscustomobject]@{
    Case     = $Name
    reason   = $r.internal_reason
    append   = $r.append_to_ticket_id
    nextOpen = $r.next.openTicketId
    terminal = $r.terminal
  }
}

Write-Host 'diagnose v6 lock smoke  (function, not Portals)'
Invoke-DiagnoseSmoke '1 missing id — want append empty, nextOpen empty' @{
  text  = 'lock prove missing id'
  state = @{ openTicketId = '00000000-0000-4000-8000-000000000099'; exchanges = 2; phase = 'escalate' }
}
Invoke-DiagnoseSmoke '2 resolved 002 — want terminal_ticket_new' @{
  text  = 'lock prove after resolved'
  state = @{ openTicketId = 'e69a5604-49bd-4939-be6d-ad7a934b58e1'; exchanges = 2; phase = 'escalate' }
}
Invoke-DiagnoseSmoke '3 open 016 — want ticket_followup_accepted and same id' @{
  text  = 'lock prove open control'
  state = @{ openTicketId = 'ae78c976-e65b-40ce-b97a-1094af706a72'; exchanges = 2; phase = 'escalate' }
}
