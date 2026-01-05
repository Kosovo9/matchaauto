# reallocate-resources.ps1
param (
    [string]$From = "MX",
    [string]$To = "US-LA",
    [int]$Amount = 5000,
    [string]$Resource = "marketing_budget"
)

Write-Host "--- REALLOCATING RESOURCES ---" -ForegroundColor Cyan
Write-Host "Moving $Amount of $Resource from $From to $To..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
Write-Host "[SUCCESS] Funds transferred. US-LA budget increased by $Amount." -ForegroundColor Green
