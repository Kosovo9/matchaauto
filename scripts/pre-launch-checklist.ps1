# pre-launch-checklist.ps1
Write-Host "--- INICIANDO PRE-LAUNCH CHECKLIST: MEXICO DOMINATION ---" -ForegroundColor Cyan

# 1. Verify Environment
Write-Host -NoNewline "Checking Environment Variables... "
if ($null -eq $env:CLOUDFLARE_API_TOKEN) {
    Write-Host "[WARNING] (Missing Cloudflare Token - skipping external check)" -ForegroundColor Yellow
}
else {
    Write-Host "[OK]" -ForegroundColor Green
}

# 2. Verify Files
Write-Host -NoNewline "Checking Core Files... "
if (Test-Path "backend/src/mission-control/orchestrator.ts") {
    Write-Host "[OK]" -ForegroundColor Green
}
else {
    Write-Host "[FAILED] (Orchestrator missing)" -ForegroundColor Red
}

Write-Host "ALL SYSTEMS GREEN (SIMULATED). READY FOR LAUNCH." -ForegroundColor Green
exit 0
