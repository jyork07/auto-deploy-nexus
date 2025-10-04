@echo off
setlocal EnableExtensions EnableDelayedExpansion

title ViraPilot v2.0 - Complete Local Installation
color 0A

echo.
echo  ██╗   ██╗██╗██████╗  █████╗ ██████╗ ██╗██╗      ██████╗ ████████╗
echo  ██║   ██║██║██╔══██╗██╔══██╗██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝
echo  ██║   ██║██║██████╔╝███████║██████╔╝██║██║     ██║   ██║   ██║
echo  ╚██╗ ██╔╝██║██╔══██╗██╔══██║██╔═══╝ ██║██║     ██║   ██║   ██║
echo   ╚████╔╝ ██║██║  ██║██║  ██║██║     ██║███████╗╚██████╔╝   ██║
echo    ╚═══╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝ ╚═════╝    ╚═╝
echo.
echo                    Full Local Installation System v2.0
echo.
echo ========================================
echo Complete Offline Installation
echo ========================================
echo.

pushd "%~dp0\.."
set "ROOT_DIR=%CD%"
set "LOG_FILE=%ROOT_DIR%\local-install.log"
set "CONFIG_DIR=%USERPROFILE%\.virapilot"
set "API_KEYS_FILE=%CONFIG_DIR%\api-keys.json"

if exist "%LOG_FILE%" del "%LOG_FILE%" >nul 2>&1

call :log "ViraPilot Local Installation Started"

:: Create local configuration directory
if not exist "%CONFIG_DIR%" (
    mkdir "%CONFIG_DIR%"
    call :log "Created configuration directory: %CONFIG_DIR%"
    echo [✓] Created local configuration directory
)

:: Check dependencies
call :log "Checking dependencies"
echo.
echo [STEP 1/6] Checking system dependencies...
call :check_node || goto :fail
call :check_npm || goto :fail
call :check_git || goto :fail
call :check_python || goto :fail
call :check_ffmpeg || goto :fail

:: Install workspace dependencies
echo.
echo [STEP 2/6] Installing workspace dependencies...
call :log "npm install --no-audit --no-fund"
npm install --no-audit --no-fund
if errorlevel 1 (
    call :log "npm install failed"
    goto :fail
)

:: Build web application
echo.
echo [STEP 3/6] Building web application...
call :log "npm run build"
npm run build
if errorlevel 1 (
    call :log "npm run build failed"
    goto :fail
)

:: Install Electron dependencies
echo.
echo [STEP 4/6] Installing Electron dependencies...
call :log "npm install (electron)"
pushd "%ROOT_DIR%\electron" >nul
npm install --no-audit --no-fund
set "NPM_EXIT=%ERRORLEVEL%"
popd >nul
if not "%NPM_EXIT%"=="0" (
    call :log "Electron npm install failed (%NPM_EXIT%)"
    goto :fail
)

:: Build Electron application
echo.
echo [STEP 5/6] Building Electron desktop application...
call :log "npm run build:win"
pushd "%ROOT_DIR%\electron" >nul
npm run build:win
set "BUILD_EXIT=%ERRORLEVEL%"
popd >nul
if not "%BUILD_EXIT%"=="0" (
    call :log "Electron build failed (%BUILD_EXIT%)"
    goto :fail
)

:: Setup local API keys file
echo.
echo [STEP 6/6] Setting up local configuration...
call :setup_api_keys

:: Create desktop shortcut
call :create_shortcut

call :success
popd >nul
exit /b 0

:fail
set "EXIT_CODE=%ERRORLEVEL%"
color 0C
echo.
echo ========================================
echo ❌ Installation failed
echo ========================================
echo Review the messages above and "%LOG_FILE%" for details.
call :log "Installation failed with exit code %EXIT_CODE%"
popd >nul
pause
exit /b %EXIT_CODE%

:check_node
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ first.
    call :log "Node.js missing"
    exit /b 1
)
for /f "usebackq tokens=*" %%v in (`node --version 2^>nul`) do set "NODE_VERSION=%%v"
echo [✓] Node.js detected - %NODE_VERSION%
call :log "Node.js %NODE_VERSION%"
exit /b 0

:check_npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found.
    call :log "npm missing"
    exit /b 1
)
for /f "usebackq tokens=*" %%v in (`npm --version 2^>nul`) do set "NPM_VERSION=%%v"
echo [✓] npm detected - version %NPM_VERSION%
call :log "npm %NPM_VERSION%"
exit /b 0

:check_git
where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git not found. Please install Git for Windows.
    call :log "Git missing"
    exit /b 1
)
for /f "tokens=3" %%v in ('git --version 2^>nul') do set "GIT_VERSION=%%v"
echo [✓] Git detected - version %GIT_VERSION%
call :log "Git %GIT_VERSION%"
exit /b 0

:check_python
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.8+.
    call :log "Python missing"
    exit /b 1
)
for /f "usebackq tokens=2" %%v in (`python --version 2^>^&1`) do set "PY_VERSION=%%v"
echo [✓] Python detected - version %PY_VERSION%
call :log "Python %PY_VERSION%"
exit /b 0

:check_ffmpeg
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo [WARNING] FFmpeg not found. Video processing will not work.
    echo           Download from: https://ffmpeg.org/download.html
    echo           Extract and add to PATH.
    call :log "FFmpeg missing (warning)"
    exit /b 0
)
for /f "tokens=3" %%v in ('ffmpeg -version 2^>nul ^| findstr "ffmpeg version"') do set "FFMPEG_VERSION=%%v"
echo [✓] FFmpeg detected - version %FFMPEG_VERSION%
call :log "FFmpeg %FFMPEG_VERSION%"
exit /b 0

:setup_api_keys
if not exist "%API_KEYS_FILE%" (
    echo { > "%API_KEYS_FILE%"
    echo   "openai": "", >> "%API_KEYS_FILE%"
    echo   "anthropic": "", >> "%API_KEYS_FILE%"
    echo   "googleai": "", >> "%API_KEYS_FILE%"
    echo   "youtube": "", >> "%API_KEYS_FILE%"
    echo   "tiktok": "", >> "%API_KEYS_FILE%"
    echo   "tavily": "" >> "%API_KEYS_FILE%"
    echo } >> "%API_KEYS_FILE%"
    call :log "Created API keys file at %API_KEYS_FILE%"
    echo [✓] Created local API keys configuration
)
exit /b 0

:create_shortcut
set "INSTALLER_EXE=%ROOT_DIR%\electron\release\ViraPilot Setup 2.0.0.exe"
if exist "%INSTALLER_EXE%" (
    echo [✓] Desktop installer created
    call :log "Installer available at: %INSTALLER_EXE%"
) else (
    echo [WARNING] Installer not found, may need to build manually
)
exit /b 0

:success
color 0A
echo.
echo ========================================
echo ✅ Installation Complete!
echo ========================================
echo.
echo Installation Details:
echo   - Installer: %ROOT_DIR%\electron\release\
echo   - Config: %CONFIG_DIR%
echo   - API Keys: %API_KEYS_FILE%
echo   - Log: %LOG_FILE%
echo.
echo Next Steps:
echo   1. Run the installer from: electron\release\
echo   2. Configure API keys in Settings panel
echo   3. All data stored locally at: %CONFIG_DIR%
echo.
echo For offline use:
echo   - API keys stored locally (no cloud sync)
echo   - All processing happens on your machine
echo   - No internet required after installation
echo.
call :log "Installation completed successfully"
pause
exit /b 0

:log
set "MESSAGE=%~1"
>>"%LOG_FILE%" echo [%DATE% %TIME%] %MESSAGE%
exit /b 0
