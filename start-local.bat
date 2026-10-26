@echo off
title Inymart LearningHub LMS - Local Server
echo ========================================================
echo   Inymart LearningHub LMS - Starting Local Servers
echo ========================================================
echo.

echo [1/2] Starting PHP Backend on http://127.0.0.1:8000 ...
start "Inymart Backend (PHP:8000)" cmd /k "cd /d %~dp0 && php -S 127.0.0.1:8000 -t backend/public backend/public/index.php"

timeout /t 2 /nobreak > nul

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "Inymart Frontend (Next.js:3000)" cmd /k "cd /d %~dp0\frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo Opening browser...
start http://localhost:3000/learninghub/login

echo.
echo ========================================================
echo   Local Servers are running!
echo   Frontend: http://localhost:3000/learninghub/login
echo   Backend:  http://127.0.0.1:8000
echo.
echo   Login Details:
echo     Admin:   superadmin / Admin@12345
echo     Student: ajith_developer / Student@12345
echo ========================================================
echo.
pause
