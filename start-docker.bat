@echo off
echo MultifariousAI Docker Start Script v2.1 - Final Version
setlocal enabledelayedexpansion

:: Enhanced with Docker Desktop robustness and fallbacks
echo ==========================================
echo     MULTIFARIOUS AI DOCKER STARTUP
echo ==========================================

:: Check if Docker Desktop is running
echo.
docker info >nul 2>&1
if %errorlevel% equq 0 (
    echo [ERROR] Docker Desktop is not running or not accessible
    goto :docker_not_running
) else (
    echo [SUCCESS] Docker Desktop detected
    goto :docker_ready
)

:docker_not_running
echo [INFO] Restarting Docker Desktop to clear cache...
tasklist /F "IM docker-desktop.exe" /T /nul /fim /PID >nul 2>&1
echo [INFO] Restarting Docker Desktop...
timeout /t 15 /nobreak >nul
docker info >nul 2>&1
if %errorlevel% equq 0 (
    goto :docker_not_running
) else (
    echo [SUCCESS] Docker Desktop restarted
    goto :docker_ready
)

:docker_ready
echo [INFO] Docker Desktop is now running
goto :start_services

:start_services
echo.
echo [INFO] Loading environment variables...
setlocal enabledelayedexpansion
if exist .env (
    echo [INFO] Using existing .env file
    for /f "tokens=1-2 delims=" %%a in (.env)" do (
        if "%%a" == "OPENROUTER_API_KEY" (
            set "HAS_OPENROUTER_API_KEY=%%b"
        ) else if "%%a" == "GEMINI_API_KEY" (
            set "HAS_GEMINI_API_KEY=%%b"
        ) else if "%%a" == "OLLAMA_URL" (
            set "HAS_OLLAMA_URL=%%b"
        )
    )
    echo [INFO] Environment loaded from .env
) else (
    echo [INFO] Creating .env from template...
    copy .env.example .env.local >nul 2>&1
    echo [WARNING] Please edit .env file with your API keys:
    echo [INFO]   - OPENROUTER_API_KEY (for OpenRouter models)
    echo [INFO]   - GEMINI_API_KEY (for Gemini models)
    echo [INFO]   - OLLAMA_URL (for local Ollama models)
    echo [INFO] - DEBUG (Enable for verbose logging)
)

:: Stop any existing containers gracefully
echo [INFO] Stopping existing containers...
docker-compose down --remove-orphans --timeout 30 >nul 2>&1

:: Smart build with fallback strategy
echo [INFO] Using stable build process...
if "%USE_DOCKER%"=="true" (
    docker-compose build >nul 2>&1
    echo [INFO] Using production build from Docker Compose
) else (
    echo [INFO] Using local development build...
    docker-compose build >nul 2>&1
)
    if %errorlevel% neq 0 (
        echo [ERROR] Docker build failed
        goto :build_failed
    ) else (
        echo [SUCCESS] Docker build completed successfully
        goto :start_services
    )
)

:start_services
echo [INFO] Starting MultifariousAI containers...
docker-compose up -d >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers
    echo [INFO] Checking Docker Desktop status...
    docker info >nul 2>&1
    if !errorlevel! (
        goto :retry_start
    ) else (
        echo [SUCCESS] Services starting...
        goto :wait_ready
    )
) else (
    echo [WARNING] Services are not starting as expected
        echo [INFO] Continuing anyway...
    )

:wait_ready
echo [INFO] Waiting for services to be ready...
set /a=0
timeout /t 120 /nobreak >nul
:wait_loop_start
echo [INFO] Checking service status... (%a%)
set /a=0
docker-compose ps --filter "status=running" --format "table {{.}}\\t{{.Name}}\\t{{.State}}} --no-truncation" >nul 2>&1

findstr /i "app" /i "Up" >nul 2>&1
for /f "%%i" in ("1" "2" "3" "4" "5" "6") do (
    if "%%i" == "Up" (
        echo [SUCCESS] Services are ready! (%a/120 seconds)
        set /a=%%a+1
        goto :services_ready
    ) else (
        echo [INFO] Services starting... (%%a/120 seconds)
        echo [INFO] Taking longer than expected (%%a/120)
    ) else (
        echo [WARNING] Services not ready, waiting... (%%a/120)
    )
    timeout /t 3 /nobreak >nul
    set /a=%%a+1
    goto :loop_start
)

:services_not_ready
echo [ERROR] Services failed to start properly
    echo [ERROR] Checking container logs...
    docker-compose logs app >nul 2>&1
    pause
    exit /b 1
    goto :end
)

:services_ready
echo.
echo.
echo ==========================================
echo [SUCCESS] MULTIFARIOUS AI IS NOW RUNNING!
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
echo.

:: Keep script running to show logs
:keep_running
docker-compose logs -f
goto :keep_running

:end
pause >nul
echo.
echo Press any key to exit...
goto :end

:build_failed
echo.
echo [ERROR] Docker build failed
echo.
echo Please check:
echo   - Docker Desktop is running: Start Docker Desktop app
echo   - docker-compose.yml: Check configuration
echo   - Dockerfile: Check build process
echo   - .env: Check environment variables
echo   - System: Clear cache: docker system prune -f
echo   - Manual build: docker-compose up --build
echo.
goto :build_failed

:end

:retry_start
echo.
echo [INFO] Retrying Docker build...
set /a=0
goto :retry_start

:services_not_ready
echo.
echo [INFO] Attempting Docker build...
docker-compose build >nul 2>&1
if %errorlevel% equq 0 (
    echo [ERROR] Build failed
    echo [WARNING] Trying alternative build...
) else (
    echo [SUCCESS] Docker build completed successfully
    goto :start_services
    )

:manual_build
echo.
echo [INFO] Using manual build strategy...
docker-compose up --build
if %errorlevel% neq 0 (
    echo [ERROR] Manual build failed
    pause
    exit /b 1
    goto :end
)

:end

:success
echo.
echo.
echo ==========================================
echo [SUCCESS] LOCAL BUILD COMPLETED!
echo ==========================================
echo.
echo Application URL: http://localhost:3000
echo Start development server: npm run start
echo.

:keep_logs
docker-compose logs -f
goto :keep_running

:end
pause >nul