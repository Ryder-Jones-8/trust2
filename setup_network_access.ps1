# trust. Platform Network Setup Script
# PowerShell version for better Windows compatibility

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          trust. Platform Network Setup" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you set up trust. to run on" -ForegroundColor Green
Write-Host "different devices (computers, iPads, phones) in your shop." -ForegroundColor Green
Write-Host ""

# Get network IP address
Write-Host "Step 1: Getting your network IP address..." -ForegroundColor Yellow
Write-Host ""

$networkIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*" } | Select-Object -First 1).IPAddress

if (-not $networkIP) {
    $networkIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*" } | Select-Object -First 1).IPAddress
}

if ($networkIP) {
    Write-Host "✅ Your computer's network IP address: $networkIP" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not auto-detect IP. Please run 'ipconfig' manually." -ForegroundColor Yellow
    $networkIP = "YOUR_IP_HERE"
}

Write-Host ""
Write-Host "Step 2: Network Configuration..." -ForegroundColor Yellow
Write-Host ""

# Check if .env.local exists, create if not
$envLocalPath = Join-Path $PSScriptRoot ".." ".env.local"
if (-not (Test-Path $envLocalPath)) {
    $envContent = @"
# trust. Platform Local Network Configuration
VITE_API_URL=http://$networkIP:3001
"@
    Set-Content -Path $envLocalPath -Value $envContent
    Write-Host "✅ Created .env.local with network IP configuration" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .env.local already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "Step 3: Firewall Configuration..." -ForegroundColor Yellow
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if ($isAdmin) {
    Write-Host "✅ Running as Administrator - configuring firewall..." -ForegroundColor Green
    
    try {
        netsh advfirewall firewall add rule name="trust Frontend" dir=in action=allow protocol=TCP localport=5173 2>$null
        netsh advfirewall firewall add rule name="trust Backend" dir=in action=allow protocol=TCP localport=3001 2>$null
        Write-Host "✅ Firewall rules added successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not add firewall rules automatically" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Firewall rules may need to be added manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "            Device Access Information" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Frontend (Main App):" -ForegroundColor Green
Write-Host "  Local:    http://localhost:5173" -ForegroundColor White
Write-Host "  Network:  http://$networkIP:5173" -ForegroundColor Yellow
Write-Host ""

Write-Host "Backend API:" -ForegroundColor Green  
Write-Host "  Local:    http://localhost:3001" -ForegroundColor White
Write-Host "  Network:  http://$networkIP:3001" -ForegroundColor Yellow
Write-Host ""

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "             For Other Devices" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Make sure all devices are on the same WiFi network" -ForegroundColor Green
Write-Host ""
Write-Host "2. On iPads/Tablets/Phones, open a web browser and go to:" -ForegroundColor Green
Write-Host "   http://$networkIP:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. For shop employees, bookmark this URL for easy access" -ForegroundColor Green
Write-Host ""
Write-Host "4. The platform works best on tablets and larger screens" -ForegroundColor Green
Write-Host ""

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "               Quick Start Commands" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To start the servers:" -ForegroundColor Green
Write-Host "  Backend:  cd backend; npm start" -ForegroundColor White
Write-Host "  Frontend: npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "                Troubleshooting" -ForegroundColor Yellow  
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "If devices can't connect:" -ForegroundColor Green
Write-Host "• Ensure all devices are on the same WiFi network" -ForegroundColor White
Write-Host "• Check Windows Firewall settings" -ForegroundColor White
Write-Host "• Try accessing from browser's private/incognito mode" -ForegroundColor White
Write-Host "• For iOS: disable 'Block Pop-ups' in Safari settings" -ForegroundColor White
Write-Host "• For Android: ensure 'Desktop site' is not enabled" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
