# trust. Platform Network Setup - Simplified
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          trust. Platform Network Setup" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Get network IP address
Write-Host "Getting your network IP address..." -ForegroundColor Yellow
$ip = (Get-NetIPConfiguration | Where-Object {$_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -ne "Disconnected"}).IPv4Address.IPAddress
if ($ip) {
    Write-Host "Your network IP: $ip" -ForegroundColor Green
} else {
    Write-Host "Could not detect IP automatically. Please run 'ipconfig' to find your IP." -ForegroundColor Yellow
    $ip = "YOUR_IP_HERE"
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "            Access Information" -ForegroundColor Yellow  
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For your iPad/other devices, use this URL:" -ForegroundColor Green
Write-Host "http://$ip:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Make sure:" -ForegroundColor Green
Write-Host "1. All devices are on the same WiFi network" -ForegroundColor White
Write-Host "2. Start both servers (see commands below)" -ForegroundColor White
Write-Host "3. Open the URL above in your iPad's browser" -ForegroundColor White
Write-Host ""
Write-Host "Commands to start servers:" -ForegroundColor Green
Write-Host "Backend:  cd backend; npm start" -ForegroundColor White
Write-Host "Frontend: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to continue..."
Read-Host
