@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

if "%~1"=="" goto help

set "CMD=%~1"

:: == Phat trien (khong Docker) ================================
if "%CMD%"=="dev" (
    cd /d "%~dp0src"
    uvicorn hubserver.main:app --reload --host 0.0.0.0 --port 8000
    goto end
)

if "%CMD%"=="worker" (
    cd /d "%~dp0src"
    arq hubserver.core.worker.settings.WorkerSettings
    goto end
)

:: == Chat luong code ==========================================
if "%CMD%"=="lint" (
    cd /d "%~dp0"
    ruff check src/ && ruff format --check src/
    goto end
)

if "%CMD%"=="format" (
    cd /d "%~dp0"
    ruff format src/ && ruff check --fix src/
    goto end
)

if "%CMD%"=="typecheck" (
    cd /d "%~dp0"
    mypy src/
    goto end
)

:: == Co so du lieu ============================================
if "%CMD%"=="migrate" (
    cd /d "%~dp0src"
    alembic revision --autogenerate -m "%~2"
    goto end
)

if "%CMD%"=="upgrade" (
    cd /d "%~dp0src"
    alembic upgrade head
    goto end
)

if "%CMD%"=="downgrade" (
    cd /d "%~dp0src"
    alembic downgrade -1
    goto end
)

:: == Script khoi tao ==========================================
if "%CMD%"=="superuser" (
    cd /d "%~dp0src"
    python -m hubserver.scripts.create_first_superuser
    goto end
)

if "%CMD%"=="tier" (
    cd /d "%~dp0src"
    python -m hubserver.scripts.create_first_tier
    goto end
)

:: == Docker ===================================================
if "%CMD%"=="up" (
    cd /d "%~dp0"
    docker compose up -d
    goto end
)

if "%CMD%"=="down" (
    cd /d "%~dp0"
    docker compose down
    goto end
)

if "%CMD%"=="logs" (
    cd /d "%~dp0"
    docker compose logs -f web
    goto end
)

if "%CMD%"=="build" (
    cd /d "%~dp0"
    docker compose build
    goto end
)

:: == Kiem thu ==================================================
if "%CMD%"=="test" (
    cd /d "%~dp0"
    pytest tests/
    goto end
)

:: == Thiet lap moi truong =====================================
if "%CMD%"=="setup-local" (
    cd /d "%~dp0"
    python setup.py local
    goto end
)

if "%CMD%"=="setup-staging" (
    cd /d "%~dp0"
    python setup.py staging
    goto end
)

if "%CMD%"=="setup-production" (
    cd /d "%~dp0"
    python setup.py production
    goto end
)

echo   Lenh khong hop le: %CMD%
echo.

:help
echo.
echo   +==========================================+
echo   ^|     HubServer -- Cac lenh thuong dung    ^|
echo   +==========================================+
echo.
echo   Phat trien:
echo     run dev              Chay server dev (uvicorn --reload)
echo     run worker           Chay ARQ worker xu ly nen
echo.
echo   Chat luong code:
echo     run lint             Kiem tra code voi ruff
echo     run format           Dinh dang code voi ruff
echo     run typecheck        Kiem tra kieu voi mypy
echo.
echo   Co so du lieu:
echo     run migrate "msg"    Tao migration moi
echo     run upgrade          Chay tat ca migrations
echo     run downgrade        Hoan tac migration gan nhat
echo.
echo   Script khoi tao:
echo     run superuser        Tao tai khoan quan tri vien
echo     run tier             Tao goi dich vu dau tien
echo.
echo   Docker:
echo     run up               Khoi dong containers
echo     run down             Dung containers
echo     run logs             Xem log web (realtime)
echo     run build            Build lai containers
echo.
echo   Kiem thu:
echo     run test             Chay pytest
echo.
echo   Thiet lap moi truong:
echo     run setup-local        Thiet lap phat trien cuc bo
echo     run setup-staging      Thiet lap moi truong staging
echo     run setup-production   Thiet lap trien khai chinh thuc
echo.

:end
endlocal
