@echo off
TITLE DevOpsHub Launcher
echo ========================================================
echo               DevOpsHub One-Click Launcher              
echo ========================================================
echo.

echo Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js LTS from: https://nodejs.org
    echo After installing Node.js, re-run this file.
    pause
    exit /b 1
)

echo Node.js detected! Launching Backend and Frontend...
echo.

echo Starting Backend Service (Port 4000)...
start "DevOpsHub Backend" cmd /k "cd /d "%~dp0backend" && npm install && npx prisma generate && npm run dev"

echo Starting Frontend UI (Port 5173)...
start "DevOpsHub Frontend" cmd /k "cd /d "%~dp0frontend" && npm install && npm run dev"

echo.
echo ========================================================
echo  DevOpsHub is starting up!
echo  Backend:  http://localhost:4000
echo  Frontend: http://localhost:5173
echo ========================================================
echo.
echo You can close this window now.
pause
