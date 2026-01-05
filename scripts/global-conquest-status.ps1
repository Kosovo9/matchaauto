# global-conquest-status.ps1
param([switch]$Live)

Write-Host "--- GLOBAL CONQUEST STATUS REPORT ---" -ForegroundColor Cyan
$markets = @(
    @{ Name = "MEXICO"; Status = "OPTIMIZED"; Conversion = "12.4%"; Rev = "$8,240" },
    @{ Name = "US-LA"; Status = "SCALING"; Conversion = "8.1%"; Rev = "$5,120" },
    @{ Name = "BR-SP"; Status = "WARMUP"; Conversion = "5.2%"; Rev = "$3,400" },
    @{ Name = "CO-BOG"; Status = "WARMUP"; Conversion = "4.8%"; Rev = "$2,150" }
)

foreach ($m in $markets) {
    Write-Host "Market: $($m.Name)" -ForegroundColor Yellow -NoNewline
    Write-Host " | Status: $($m.Status)" -ForegroundColor Green -NoNewline
    Write-Host " | CV: $($m.Conversion)" -NoNewline
    Write-Host " | Revenue: $($m.Rev)"
}

Write-Host "Total Global Revenue (Est. 24h): $18,910 USD" -ForegroundColor Cyan
