# Test script for MultifariousAI chat API
$body = @{
    messages = @(@{role = "user"; content = "Hello! Say hi in exactly one word."})
    model = "google/gemma-2-9b-it:free"
    provider = "openrouter"
    apiKey = "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"
} | ConvertTo-Json -Depth 3

Write-Host "Testing chat API..." -ForegroundColor Cyan
Write-Host "Request body: $body" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/chat" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 60
    Write-Host "`nStatus: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Content:" -ForegroundColor Yellow
    Write-Host $response.Content
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "Exception details: $($_.Exception.Message)" -ForegroundColor Red
}
