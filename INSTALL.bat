@echo off
title ViraPilot v2.0 - Simple Installation
color 0A

echo.
echo ========================================
echo ViraPilot v2.0 - Installation
echo ========================================
echo.

echo [1/3] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Node.js not found!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

node --version
echo Node.js found!
echo.

echo [2/3] Installing dependencies...
call npm install
if errorlevel 1 (
    color 0C
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/3] Building application...
call npm run build
if errorlevel 1 (
    color 0C
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
color 0A
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the application:
echo   npm run dev
echo.
echo For production build:
echo   npm run preview
echo.
echo See SETUP.md for API key configuration
echo.
pause
