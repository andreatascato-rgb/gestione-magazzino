@echo off
REM Script batch per liberare le porte 3000 e 3001

echo 🔍 Cercando processi sulle porte 3000 e 3001...

REM Funzione per trovare e terminare processi su una porta
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    if not "%%a"=="0" (
        echo   ⚠️  Terminando processo %%a sulla porta 3000
        taskkill /PID %%a /F >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
    if not "%%a"=="0" (
        echo   ⚠️  Terminando processo %%a sulla porta 3001
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo ✅ Porte liberate!
timeout /t 1 /nobreak >nul

