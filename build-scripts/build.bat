@echo off
echo ========================================
echo ViraPilot v2.0 - Build Script
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js and npm are installed.
echo.

:: Install main dependencies
echo Installing main application dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install main dependencies
    pause
    exit /b 1
)

:: Build the React application
echo.
echo Building React application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build React application
    pause
    exit /b 1
)

:: Navigate to electron directory and install dependencies
echo.
echo Installing Electron dependencies...
cd electron
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Electron dependencies
    cd ..
    pause
    exit /b 1
)

:: Build Electron application
echo.
echo Building Electron application...
call npm run build:win
if %errorlevel% neq 0 (
    echo ERROR: Failed to build Electron application
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo The installer can be found in: electron\release\
echo.
pause