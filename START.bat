@echo off
title MultifariousAI - Starting...
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                    MultifariousAI                            ║
echo  ║          Free Multi-AI Chat Platform                         ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  ❌ Node.js is not installed!
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org/
    echo.
    echo  After installing, restart this script.
    echo.
    pause
    start https://nodejs.org/
    exit /b 1
)

:: Show Node.js version
echo  ✓ Node.js found: 
node --version
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo  📦 First time setup - Installing dependencies...
    echo  This may take 2-3 minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo  ❌ Installation failed. Trying with legacy peer deps...
        call npm install --legacy-peer-deps
    )
    echo.
    echo  ✓ Dependencies installed!
    echo.
)

:: Start the development server
echo  🚀 Starting MultifariousAI...
echo.
echo  ════════════════════════════════════════════════════════════════
echo   The app will open in your browser automatically.
echo   If not, go to: http://localhost:3000
echo.
echo   Press Ctrl+C to stop the server.
echo  ════════════════════════════════════════════════════════════════
echo.

:: Wait a moment then open browser
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Run the dev server
call npm run dev
