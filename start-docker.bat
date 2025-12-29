@echo off
setlocal enabledelayedexpansion
setlocal dp=%USERPROFILE%

:: MultifariousAI Docker Start Script
:: Version 1.0 - Production Ready

echo ==========================================
echo     MULTIFARIOUS AI DOCKER STARTUP
echo ==========================================
echo.

:: Check if Docker Desktop is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running or not accessible
    echo.
    echo Please start Docker Desktop and try again
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Docker Desktop detected
echo.

:: Navigate to project directory
cd /d "%dp%\Documents\GitHub\multifariousAI" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to navigate to project directory
    echo.
    pause
    exit /b 1
)

:: Set environment variables from .env or create from example
if exist .env (
    echo Using existing .env file
    set /p "OPENROUTER_API_KEY="
    set /p "GEMINI_API_KEY="
    set /p "OLLAMA_URL="
    for /f "tokens=1-2 delims=" %%a in (.env)" do (
        if "%%a" == "OPENROUTER_API_KEY" (
            set "OPENROUTER_API_KEY=%%b"
        ) else if "%%a" == "GEMINI_API_KEY" (
            set "GEMINI_API_KEY=%%b"
        ) else if "%%a" == "OLLAMA_URL" (
            set "OLLAMA_URL=%%b"
        )
    )
    echo Environment loaded from .env
) else (
    echo Creating .env from .env.example...
    copy .env.example .env >nul 2>&1
    echo.
    echo Please edit .env file with your API keys:
    echo   - OPENROUTER_API_KEY (for OpenRouter models)
    echo   - GEMINI_API_KEY (for Gemini models)
    echo   - OLLAMA_URL (for local Ollama models)
    echo.
    set "OPENROUTER_API_KEY="
    set "GEMINI_API_KEY="
    set "OLLAMA_URL=http://localhost:11434"
)

:: Stop any existing containers gracefully
echo Stopping existing containers...
docker-compose down --remove-orphans --timeout 30 >nul 2>&1

:: Build Docker image
echo Building MultifariousAI Docker image...
docker-compose build >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed
    echo.
    echo Check docker-compose.yml and Dockerfile
    pause
    exit /b 1
)

:: Start containers in detached mode
echo Starting MultifariousAI containers...
docker-compose up -d >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers
    echo.
    echo Check Docker Desktop is running
    pause
    exit /b 1
)

:: Wait for services to be ready
echo Waiting for services to start...
timeout /t 30 /nobreak >nul set /a=0
:loop_start
set /a=0
timeout /t 2 cmd /c docker-compose ps --filter "status=running" >nul 2>&1
docker-compose ps >nul 2>&1
echo %%a
findstr /i "app" /i "Up" >nul
if errorlevel 1 (
    if %%a leq 0 (
        echo Services not ready, waiting... (%%a/5)
        set /a=%%a+1
        timeout /t 2 cmd /c echo Checking services... %%a/5 >nul
        goto :loop_start
    ) else (
        echo Services are ready!
        goto :services_ready
    )
) else (
    echo Error checking services
    set /a=99
)
if %a leq 99 (
    timeout /t 1 cmd /c echo ERROR: Services failed to start >nul
    pause
    exit /b 1
)
timeout /t 2 >nul
goto :loop_start

:services_ready
echo.
echo ==========================================
echo MULTIFARIOUS AI IS NOW RUNNING!
echo ==========================================
echo.
echo Application URL: http://localhost:3000
echo.
echo Quick Commands:
echo   - View logs: docker-compose logs -f app
echo   - Stop services: docker-compose down
echo   - Check status: docker-compose ps
echo.
echo Press Ctrl+C to stop containers
echo.

:: Keep script running to show logs
:keep_running
docker-compose logs -f