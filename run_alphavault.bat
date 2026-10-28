@echo off
title AlphaVault Terminal - Full Institutional Trading & Quant Engine
cd /d "d:\alphavault"
echo ===============================================================================
echo ALPHAVAULT TERMINAL: Full Institutional AI Studio Suite
echo Operator: Sri Subhendu Barua (Angel One Client ID: S52773407)
echo ===============================================================================
if exist "d:\alphavault\engine\aladdin_risk_engine.py" (
    echo [1/2] Syncing Aladdin Risk & Quant Dip Radar...
    if exist "C:\Users\suben\AppData\Local\Python\bin\python.exe" (
        "C:\Users\suben\AppData\Local\Python\bin\python.exe" "d:\alphavault\engine\aladdin_risk_engine.py"
    )
)
echo.
echo [2/2] Launching AlphaVault Terminal (Vite + Express Server) on http://localhost:3000...
start "" "http://localhost:3000"
call npm.cmd run dev
pause
