@echo off
setlocal

if "%1"=="" goto help
if "%1"=="dev" goto dev
if "%1"=="be" goto be
if "%1"=="fe" goto fe
if "%1"=="stop" goto stop
goto help

:dev
echo ══════════════════════════════════════════
echo   Starting Backend + Frontend
echo ══════════════════════════════════════════
start "Backend" cmd /k "cd /d %~dp0BACKEND\src && uvicorn hubserver.main:app --reload --host 0.0.0.0 --port 8000 --timeout-graceful-shutdown 3"
start "Frontend" cmd /k "cd /d %~dp0FRONEND && npm run dev"
echo.
echo   Backend  : http://localhost:8000
echo   Frontend : http://localhost:3000
echo.
goto end

:be
cd /d %~dp0BACKEND\src
uvicorn hubserver.main:app --reload --host 0.0.0.0 --port 8000 --timeout-graceful-shutdown 3
goto end

:fe
cd /d %~dp0FRONEND
npm run dev
goto end

:stop
echo Stopping all servers...
taskkill /F /IM uvicorn.exe 2>nul
taskkill /F /IM node.exe 2>nul
echo Done.
goto end

:help
echo.
echo   Usage: run [command]
echo.
echo   Commands:
echo     dev    Start Backend + Frontend (2 windows)
echo     be     Start Backend only
echo     fe     Start Frontend only
echo     stop   Kill all servers
echo.

:end
endlocal
