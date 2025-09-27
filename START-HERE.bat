@echo off
setlocal EnableExtensions EnableDelayedExpansion

pushd "%~dp0" >nul
set "ROOT_DIR=%CD%"
set "LOG_FILE=%ROOT_DIR%\setup.log"

if exist "%LOG_FILE%" del "%LOG_FILE%" >nul 2>&1

call :log "==== ViraPilot automated setup started ===="
call :print_header

call :log "Checking required tooling"
call :check_node || goto :fail
call :check_npm || goto :fail
call :check_git || goto :fail
call :check_python || goto :fail

call :log "Installing workspace dependencies"
call :install_workspace_dependencies || goto :fail

call :log "Building web application"
call :build_frontend || goto :fail

call :log "Installing Electron dependencies"
call :install_electron_dependencies || goto :fail

call :log "Packaging Electron application"
call :build_electron || goto :fail

call :success
popd >nul
exit /b 0

:fail
set "EXIT_CODE=%ERRORLEVEL%"
color 0C
echo.
echo ========================================
echo ❌ Setup failed
echo ========================================
echo Review the messages above and "%LOG_FILE%" for details.
echo Once resolved, run START-HERE.bat again.
call :log "Setup failed with exit code %EXIT_CODE%"
popd >nul
exit /b %EXIT_CODE%

:print_header
title ViraPilot v2.0 - Automated Setup
color 0A
echo.
echo  ██╗   ██╗██╗██████╗  █████╗ ██████╗ ██╗██╗      ██████╗ ████████╗
echo  ██║   ██║██║██╔══██╗██╔══██╗██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝
echo  ██║   ██║██║██████╔╝███████║██████╔╝██║██║     ██║   ██║   ██║
echo  ╚██╗ ██╔╝██║██╔══██╗██╔══██║██╔═══╝ ██║██║     ██║   ██║   ██║
echo   ╚████╔╝ ██║██║  ██║██║  ██║██║     ██║███████╗╚██████╔╝   ██║
echo    ╚═══╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝ ╚═════╝    ╚═╝
echo.
echo                    Advanced AI Pipeline Management v2.0
echo.
echo ========================================
echo One-click local build and packaging
echo ========================================
echo.
exit /b 0

:check_node
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js was not found on PATH.
    echo         Install Node.js 18+ and re-run this setup.
    call :log "Node.js missing"
    exit /b 1
)
set "NODE_VERSION="
for /f "usebackq tokens=*" %%v in (`node --version 2^>nul`) do if not defined NODE_VERSION set "NODE_VERSION=%%v"
if not defined NODE_VERSION set "NODE_VERSION=detected"
echo [OK] Node.js detected - %NODE_VERSION%
call :log "Node.js %NODE_VERSION%"
exit /b 0

:check_npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm was not found on PATH.
    echo         npm is installed with Node.js; reinstall Node.js if needed.
    call :log "npm missing"
    exit /b 1
)
set "NPM_VERSION="
for /f "usebackq tokens=*" %%v in (`npm --version 2^>nul`) do if not defined NPM_VERSION set "NPM_VERSION=%%v"
if not defined NPM_VERSION set "NPM_VERSION=detected"
echo [OK] npm detected - version %NPM_VERSION%
call :log "npm %NPM_VERSION%"
exit /b 0

:check_git
where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git was not found on PATH.
    echo         Install Git for Windows from https://git-scm.com/download/win
    call :log "Git missing"
    exit /b 1
)
set "GIT_VERSION="
for /f "tokens=3" %%v in ('git --version 2^>nul') do if not defined GIT_VERSION set "GIT_VERSION=%%v"
if not defined GIT_VERSION set "GIT_VERSION=detected"
echo [OK] Git detected - version %GIT_VERSION%
call :log "Git %GIT_VERSION%"
exit /b 0

:check_python
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python 3 was not found on PATH.
    echo         Install Python 3.11+ and include it in PATH during setup.
    call :log "Python missing"
    exit /b 1
)
set "PY_VERSION="
for /f "usebackq tokens=2" %%v in (`python --version 2^>^&1`) do if not defined PY_VERSION set "PY_VERSION=%%v"
if not defined PY_VERSION set "PY_VERSION=detected"
echo [OK] Python detected - version %PY_VERSION%
call :log "Python %PY_VERSION%"
exit /b 0

:install_workspace_dependencies
echo.
echo [STEP 1/4] Installing workspace dependencies...
call :log "npm install --no-audit --no-fund"
npm install --no-audit --no-fund
if errorlevel 1 (
    call :log "npm install failed"
    exit /b 1
)
exit /b 0

:build_frontend
echo.
echo [STEP 2/4] Building web application...
call :log "npm run build"
npm run build
if errorlevel 1 (
    call :log "npm run build failed"
    exit /b 1
)
exit /b 0

:install_electron_dependencies
echo.
echo [STEP 3/4] Installing Electron dependencies...
call :log "npm install (electron)"
pushd "%ROOT_DIR%\electron" >nul
npm install --no-audit --no-fund
set "NPM_EXIT=%ERRORLEVEL%"
popd >nul
if not "%NPM_EXIT%"=="0" (
    call :log "Electron npm install failed (%NPM_EXIT%)"
    exit /b %NPM_EXIT%
)
exit /b 0

:build_electron
echo.
echo [STEP 4/4] Packaging Electron desktop application...
call :log "npm run build:win"
pushd "%ROOT_DIR%\electron" >nul
npm run build:win
set "BUILD_EXIT=%ERRORLEVEL%"
popd >nul
if not "%BUILD_EXIT%"=="0" (
    call :log "Electron build failed (%BUILD_EXIT%)"
    exit /b %BUILD_EXIT%
)
exit /b 0

:success
color 0A
echo.
echo ========================================
echo ✅ Setup complete
echo ========================================
echo Desktop installers can be found inside:
echo     %ROOT_DIR%\electron\release
echo A detailed log is available at:
echo     %LOG_FILE%
call :log "Setup completed successfully"
exit /b 0

:log
set "MESSAGE=%~1"
if not defined MESSAGE set "MESSAGE="
>>"%LOG_FILE%" echo [%DATE% %TIME%] %MESSAGE%
exit /b 0

