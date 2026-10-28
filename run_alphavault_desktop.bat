@echo off
title AlphaVault Terminal - Native Windows Desktop Shell
cd /d "%~dp0"

echo ===============================================================================
echo ALPHAVAULT TERMINAL: High-Tech Institutional Windows Desktop App
echo Operator: Sri Subhendu Barua (Angel One Client ID: S52773407)
echo Mode: Dedicated Frameless Desktop Application (Zero Browser Clutter)
echo ===============================================================================

set TARGET_URL=https://eofficesubhendubarua-hue.github.io/AlphaVault-terminal-Sharemarket-indepth-Analysis/

rem Check if local dev server should be run
if "%1"=="--local" (
    echo Launching local server on http://localhost:3000...
    start /b npm.cmd run dev
    timeout /t 2 >nul
    set TARGET_URL=http://localhost:3000
)

echo Starting AlphaVault Terminal Desktop Window...

rem Try Microsoft Edge App Mode first
where msedge >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start msedge --app="%TARGET_URL%" --window-size=1440,920 --enable-features=OverlayScrollbar
    exit /b
)

rem Fallback to Google Chrome App Mode
where chrome >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start chrome --app="%TARGET_URL%" --window-size=1440,920
    exit /b
)

rem Fallback to default browser
start "" "%TARGET_URL%"
exit /b
