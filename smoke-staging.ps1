param(
    [Parameter(Mandatory = $true)][string]$ApiBase,
    [string]$UserJwt = "",
    [string]$AdminJwt = "",
    [string]$ListingId = ""
)

function Hit($method, $path, $jwt, $bodyObj) {
    $uri = "$ApiBase$path"
    $headers = @{}
    if ($jwt -ne "") { $headers["Authorization"] = "Bearer $jwt" }
    if ($bodyObj -ne $null) {
        $json = ($bodyObj | ConvertTo-Json -Depth 10)
        return Invoke-RestMethod -Method $method -Uri $uri -Headers $headers -ContentType "application/json" -Body $json
    }
    else {
        return Invoke-RestMethod -Method $method -Uri $uri -Headers $headers
    }
}

Write-Host "=== SMOKE STAGING ===" -ForegroundColor Cyan
Write-Host "API: $ApiBase"

# 1) Health (no auth)
try {
    $health = Hit "GET" "/api/health" "" $null
    Write-Host "Health:" ($health | ConvertTo-Json -Depth 5) -ForegroundColor Green
}
catch {
    Write-Host "Health check failed: $_" -ForegroundColor Red
}

if ($UserJwt -eq "") {
    Write-Host "NOTE: No UserJwt provided. Auth flows skipped." -ForegroundColor Yellow
    exit 0
}

# 2) Status
try {
    $status1 = Hit "GET" "/api/verifications/me" $UserJwt $null
    Write-Host "Status (before):" ($status1 | ConvertTo-Json -Depth 5) -ForegroundColor Green
}
catch {
    Write-Host "Status check failed: $_" -ForegroundColor Red
}

# 3) Request verification
try {
    $req = Hit "POST" "/api/verifications/request" $UserJwt @{
        docType = "passport"
        fileUrl = "https://example.com/demo.mp4"
    }
    Write-Host "Request:" ($req | ConvertTo-Json -Depth 8) -ForegroundColor Green

    # Try to extract verification id if your API returns it
    $verificationId = $null
    if ($req.verificationId) { $verificationId = $req.verificationId }
    elseif ($req.id) { $verificationId = $req.id }
}
catch {
    Write-Host "Verification request failed: $_" -ForegroundColor Red
}

# 4) Approve (admin)
if ($AdminJwt -ne "" -and $verificationId -ne $null) {
    try {
        $dec = Hit "POST" "/api/verifications/decide" $AdminJwt @{
            verificationId = $verificationId
            decision       = "approved"
        }
        Write-Host "Decide:" ($dec | ConvertTo-Json -Depth 8) -ForegroundColor Green
    }
    catch {
        Write-Host "Admin decide failed: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "NOTE: AdminJwt or verificationId missing. Skipping decide." -ForegroundColor Yellow
}

# 5) Status after
try {
    $status2 = Hit "GET" "/api/verifications/me" $UserJwt $null
    Write-Host "Status (after):" ($status2 | ConvertTo-Json -Depth 5) -ForegroundColor Green
}
catch {
    Write-Host "Status check after approval failed: $_" -ForegroundColor Red
}

# 6) Boost checkout (optional)
if ($ListingId -ne "") {
    try {
        $checkout = Hit "POST" "/api/boosts/checkout" $UserJwt @{
            listingId = $ListingId
            planId    = "basic"
            provider  = "mercadopago"
            domain    = "auto"
            city      = "CDMX"
        }
        Write-Host "Checkout:" ($checkout | ConvertTo-Json -Depth 10) -ForegroundColor Green
    }
    catch {
        Write-Host "Boost checkout failed: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "NOTE: ListingId not provided. Skipping boosts checkout." -ForegroundColor Yellow
}

Write-Host "=== DONE ===" -ForegroundColor Cyan
