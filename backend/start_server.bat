@echo off
echo Starting trust. backend server...
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Installing dependencies if needed...
npm install
echo.
echo Starting server on port 3001...
node server.js
pause
