@echo off
echo ===================================================
echo           trust. Platform Network Setup
echo ===================================================
echo.
echo This script will help you set up trust. to run on
echo different devices (computers, iPads, phones) in your shop.
echo.
echo Step 1: Getting your network IP address...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo Your computer's IP address: %%b
        set LOCAL_IP=%%b
    )
)
echo.
echo Step 2: Starting the servers...
echo.
echo Starting backend server...
start "trust. Backend" cmd /k "cd /d %~dp0 && npm start"
echo.
timeout /t 3 /nobreak > nul
echo.
echo Starting frontend server...
start "trust. Frontend" cmd /k "cd /d %~dp0.. && npm run dev"
echo.
echo Step 3: Access instructions for other devices...
echo.
echo ===================================================
echo           Device Access Information
echo ===================================================
echo.
echo Frontend (Main App):
echo   Local:    http://localhost:5173
echo   Network:  http://%LOCAL_IP%:5173
echo.
echo Backend API:
echo   Local:    http://localhost:3001
echo   Network:  http://%LOCAL_IP%:3001
echo.
echo ===================================================
echo              For Other Devices
echo ===================================================
echo.
echo 1. Make sure all devices are on the same WiFi network
echo.
echo 2. On iPads/Tablets/Phones, open a web browser and go to:
echo    http://%LOCAL_IP%:5173
echo.
echo 3. For shop employees, bookmark this URL for easy access
echo.
echo 4. The platform works best on tablets and larger screens
echo.
echo ===================================================
echo                 Firewall Setup
echo ===================================================
echo.
echo If devices can't connect, you may need to allow the ports
echo through Windows Firewall:
echo.
echo 1. Open Windows Defender Firewall
echo 2. Click "Allow an app or feature through Windows Defender Firewall"
echo 3. Click "Allow another app..."
echo 4. Browse to: node.exe (usually in C:\Program Files\nodejs\)
echo 5. Add for both Private and Public networks
echo.
echo Or run these commands as Administrator:
echo   netsh advfirewall firewall add rule name="trust Frontend" dir=in action=allow protocol=TCP localport=5173
echo   netsh advfirewall firewall add rule name="trust Backend" dir=in action=allow protocol=TCP localport=3001
echo.
echo ===================================================
echo                 Troubleshooting
echo ===================================================
echo.
echo - Ensure both computers and mobile devices are on same WiFi
echo - Disable "Public network" block in Windows Firewall
echo - Try accessing from browser's private/incognito mode first
echo - For iOS devices, make sure "Block Pop-ups" is disabled
echo - For Android, ensure "Desktop site" is not enabled
echo.
echo Press any key to exit...
pause > nul
