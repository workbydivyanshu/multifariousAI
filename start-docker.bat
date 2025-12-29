@echo off
setlocal enabledelayedexpansion

:: MultifariousAI Docker Start Script
:: Version 1.1 - Enhanced with better directory handling

echo ==========================================
echo     MULTIFARIOUS AI DOCKER STARTUP
echo ==========================================
echo.

:: Save current directory
set "CURRENT_DIR=%CD%"

:: Check if Docker Desktop is running
echo.
echo [INFO] Checking Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker Desktop not found or not running
    echo.
    echo Please start Docker Desktop and try again
    echo.
    echo This script will continue attempting to start services...
    echo.
    timeout /t 30
    goto :continue
)

echo [SUCCESS] Docker Desktop is running!
echo.

:: Navigate to project directory - try multiple methods
echo [INFO] Current directory: %CURRENT_DIR%
echo [INFO] Target directory: C:\Users\shaolinOP\Documents\GitHub\multifariousAI

:: Method 1: Try direct path
cd /d "C:\Users\shaolinOP\Documents\GitHub\multifariousAI" >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Navigated to project directory
    goto :found_dir
) else (
    echo [INFO] Direct navigation failed, trying USERPROFILE method...
)

:: Method 2: Try USERPROFILE
cd /d "%USERPROFILE%\Documents\GitHub\multifariousAI" >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Navigated to project directory via USERPROFILE
    goto :found_dir
) else (
    echo [WARNING] Could not navigate to project directory
    echo [INFO] Current directory: %CD%
    echo [INFO] Please navigate manually to: C:\Users\shaolinOP\Documents\GitHub\multifariousAI
    echo.
    set "NAVIGATE_MANUALLY=true"
)

:found_dir

:: Check if .env file exists
if exist .env (
    echo [INFO] Using existing .env file
) else (
    echo [INFO] Creating .env from example...
    copy .env.example .env
    echo [INFO] Please edit .env file with your API keys if needed
    echo.
)

:: Stop any existing containers gracefully
echo.
echo [INFO] Stopping any existing containers...
docker-compose down --remove-orphans --timeout 10 >nul 2>&1

:: Build Docker image
echo.
echo [INFO] Building Docker image...
docker-compose build >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed
    echo [INFO] Please check docker-compose.yml and Dockerfile
    pause
    exit /b 1
    goto :end
)

:: Start containers in detached mode
echo.
echo [INFO] Starting Docker containers...
docker-compose up --build -d >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers
    echo [INFO] Checking Docker Desktop status...
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Docker Desktop is not responding
        echo [INFO] Please restart Docker Desktop
    )
    pause
    exit /b 1
    goto :end
)

:: Wait for services to be ready
echo.
echo [INFO] Waiting for services to be ready...
set /a=0
:wait_ready
timeout /t 60 /nobreak >nul 2>&1
echo Checking service status... /a
set /a
docker-compose ps --filter "status=running" --format "table {{.Name}}\t{{.Status}}" >nul 2>&1
for /f %%i in (%output) do (
    if "%%i" == "app" (
        if "%%j" == "Up" (
            echo [SUCCESS] Services are ready! (%%a/60 seconds)
            set /a=%%a
            goto :ready
        )
    )
)
echo /a seconds passed...
if %a% lss 60 (
    echo [WARNING] Services taking longer than expected
    echo [INFO] Continuing wait...
    goto :wait_ready
)

:ready
echo.
echo ==========================================
echo MULTIFARIOUS AI IS NOW RUNNING!
echo ==========================================
echo.
echo Application URL: http://localhost:3000
echo.
echo Commands:
echo   - View logs: docker-compose logs -f app
echo   - Stop: docker-compose down
echo   - Status: docker-compose ps
echo.
echo Press Ctrl+C to stop containers
echo.

:: Continuous logging
:keep_running
echo.
docker-compose logs -f app
goto :keep_running

:end
echo.
echo Press any key to exit...
pause >nul