Write-Host "Starting trust. backend server..." -ForegroundColor Green
Set-Location -Path $PSScriptRoot
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Installing dependencies if needed..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Starting server on port 3001..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node server.js
