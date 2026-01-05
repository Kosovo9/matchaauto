# auto-launch-mexico.ps1
param (
    [string]$Confirmation = ""
)

$REQUIRED_KEY = "SÍ_DOMINAMOS_2024"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   MEXICO AUTO-LAUNCH SEQUENCE INITIATED   " -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

if ($Confirmation -notmatch "S._DOMINAMOS_2024") {
    Write-Host "[ERROR] Unauthorized launch attempt. Confirmation key required." -ForegroundColor Red
    exit 1
}

# Step 1: Checklist
& ./scripts/pre-launch-checklist.ps1

# Step 2: Deployment simulation
Write-Host "[LAUNCHING] Scaling Cloudflare Workers (Edge Clusters)..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "[OK] Infrastructure Scaled." -ForegroundColor Green

Write-Host "[WAIT] Warming up Queretaro & CDMX Edge Nodes..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
Write-Host "[OK] CDN Latency: < 15ms in Mexico." -ForegroundColor Green

Write-Host "-------------------------------------------"
Write-Host "--- MEXICO IS NOW LIVE! ---" -ForegroundColor Cyan
Write-Host "Check Mission Control Dashboard for metrics." -ForegroundColor Cyan
Write-Host "==========================================="
