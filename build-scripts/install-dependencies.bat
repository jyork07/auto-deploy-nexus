
@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ========================================
echo ViraPilot v2.0 - Dependency Installer
echo ========================================
echo.

:: Ensure we have administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This script requires administrator privileges.
    echo Please run as administrator.
    pause
    exit /b 1
)

set "DOWNLOAD_DIR=%TEMP%\virapilot-setup"
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%"
pushd "%DOWNLOAD_DIR%" >nul

set "SCRIPT_ERROR=0"

call :ensure_node
if errorlevel 1 goto :abort

call :ensure_git
if errorlevel 1 goto :abort

call :ensure_python
if errorlevel 1 goto :abort

call :ensure_vs_build_tools
if errorlevel 1 goto :abort

call :refresh_environment

echo.
echo ========================================
echo All dependencies are installed and ready!
echo ========================================
echo.
echo You can continue with the ViraPilot installation without
echo restarting this window. All required tools are now on PATH.
goto :cleanup

:abort
set "SCRIPT_ERROR=1"
echo.
echo ========================================
echo Dependency installation failed
echo ========================================
echo Check the messages above, resolve the issue, and run this
echo installer again.

:cleanup
echo.
pause
popd >nul
if exist "%DOWNLOAD_DIR%" rd /s /q "%DOWNLOAD_DIR%" >nul 2>&1
endlocal
if %SCRIPT_ERROR% neq 0 (
    exit /b 1
) else (
    exit /b 0
)

:: -----------------------------------------------------------------
:: Helper routines
:: -----------------------------------------------------------------

:ensure_node
set "NODE_VERSION="
for /f "delims=" %%v in ('node --version 2^>nul') do set "NODE_VERSION=%%v"
if defined NODE_VERSION (
    echo Node.js detected: !NODE_VERSION!
    call :augment_path "%ProgramFiles%\nodejs" "node.exe"
    if defined ProgramFiles(x86) call :augment_path "%ProgramFiles(x86)%\nodejs" "node.exe"
    exit /b 0
)

echo Installing Node.js 20.10.0...
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile 'nodejs.msi'" >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to download Node.js installer.
    exit /b 1
)

msiexec /i nodejs.msi /quiet /norestart >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js.
    exit /b 1
)

for /f "delims=" %%v in ('"%ProgramFiles%\nodejs\node.exe" --version 2^>nul') do set "NODE_VERSION=%%v"
if not defined NODE_VERSION if defined ProgramFiles(x86) (
    for /f "delims=" %%v in ('"%ProgramFiles(x86)%\nodejs\node.exe" --version 2^>nul') do set "NODE_VERSION=%%v"
)
if defined NODE_VERSION (
    echo Node.js installed successfully: !NODE_VERSION!
) else (
    echo WARNING: Unable to verify Node.js installation immediately. Ensure it is accessible before continuing.
)
call :augment_path "%ProgramFiles%\nodejs" "node.exe"
if defined ProgramFiles(x86) call :augment_path "%ProgramFiles(x86)%\nodejs" "node.exe"
exit /b 0

:ensure_git
set "GIT_VERSION="
for /f "tokens=3" %%v in ('git --version 2^>nul') do set "GIT_VERSION=%%v"
if defined GIT_VERSION (
    echo Git detected: version !GIT_VERSION!
    call :augment_path "%ProgramFiles%\Git\cmd" "git.exe"
    if defined ProgramFiles(x86) call :augment_path "%ProgramFiles(x86)%\Git\cmd" "git.exe"
    exit /b 0
)

echo Installing Git for Windows 2.42.0...
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.1/Git-2.42.0-64-bit.exe' -OutFile 'git-installer.exe'" >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to download Git installer.
    exit /b 1
)

"%DOWNLOAD_DIR%\git-installer.exe" /VERYSILENT /NORESTART >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Git.
    exit /b 1
)

for /f "tokens=3" %%v in ('"%ProgramFiles%\Git\cmd\git.exe" --version 2^>nul') do set "GIT_VERSION=%%v"
if not defined GIT_VERSION if defined ProgramFiles(x86) (
    for /f "tokens=3" %%v in ('"%ProgramFiles(x86)%\Git\cmd\git.exe" --version 2^>nul') do set "GIT_VERSION=%%v"
)
if defined GIT_VERSION (
    echo Git installed successfully: version !GIT_VERSION!
) else (
    echo WARNING: Unable to verify Git installation immediately. Ensure it is accessible before continuing.
)
call :augment_path "%ProgramFiles%\Git\cmd" "git.exe"
if defined ProgramFiles(x86) call :augment_path "%ProgramFiles(x86)%\Git\cmd" "git.exe"
exit /b 0

:ensure_python
set "PYTHON_VERSION="
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set "PYTHON_VERSION=%%v"
if defined PYTHON_VERSION (
    echo Python detected: version !PYTHON_VERSION!
    call :augment_path "%ProgramFiles%\Python311" "python.exe"
    call :augment_path "%ProgramFiles%\Python311\Scripts" "pip.exe"
    if defined ProgramFiles(x86) call :augment_path "%ProgramFiles(x86)%\Python311" "python.exe"
    if defined ProgramFiles(x86) call :augment_path "%ProgramFiles(x86)%\Python311\Scripts" "pip.exe"
    exit /b 0
)

echo Installing Python 3.11.6...
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.6/python-3.11.6-amd64.exe' -OutFile 'python-installer.exe'" >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to download Python installer.
    exit /b 1
)

"%DOWNLOAD_DIR%\python-installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_pip=1 >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python.
    exit /b 1
)

for /f "tokens=2" %%v in ('"%ProgramFiles%\Python311\python.exe" --version 2^>^&1') do set "PYTHON_VERSION=%%v"
if not defined PYTHON_VERSION if defined ProgramFiles(x86) (
    for /f "tokens=2" %%v in ('"%ProgramFiles(x86)%\Python311\python.exe" --version 2^>^&1') do set "PYTHON_VERSION=%%v"
)
if defined PYTHON_VERSION (
    echo Python installed successfully: version !PYTHON_VERSION!
) else (
    echo WARNING: Unable to verify Python installation immediately. Ensure it is accessible before continuing.
)
call :augment_path "%ProgramFiles%\Python311" "python.exe"
call :augment_path "%ProgramFiles%\Python311\Scripts" "pip.exe"
if defined ProgramFiles(x86) call :augment_path "%ProgramFiles(x86)%\Python311" "python.exe"
if defined ProgramFiles(x86) call :augment_path "%ProgramFiles(x86)%\Python311\Scripts" "pip.exe"
exit /b 0

:vs_build_tools
:ensure_vs_build_tools
if defined ProgramFiles(x86) (
    set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
) else (
    set "VSWHERE=%ProgramFiles%\Microsoft Visual Studio\Installer\vswhere.exe"
)
set "VS_BUILD_TOOLS_PATH="
if exist "%VSWHERE%" (
    for /f "usebackq delims=" %%v in (`"%VSWHERE%" -products Microsoft.VisualStudio.Product.BuildTools -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set "VS_BUILD_TOOLS_PATH=%%v"
)

if defined VS_BUILD_TOOLS_PATH (
    echo Visual Studio Build Tools already installed at: !VS_BUILD_TOOLS_PATH!
    exit /b 0
)

echo Installing Visual Studio Build Tools (C++ workload)...
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://aka.ms/vs/17/release/vs_BuildTools.exe' -OutFile 'vs_buildtools.exe'" >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to download Visual Studio Build Tools installer.
    exit /b 1
)

"%DOWNLOAD_DIR%\vs_buildtools.exe" --quiet --wait --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --nocache >nul
if %errorlevel% neq 0 (
    echo WARNING: Visual Studio Build Tools installation reported an error. Please review the Visual Studio Installer log if native module builds fail.
) else (
    echo Visual Studio Build Tools installed successfully.
)
exit /b 0

:refresh_environment
where refreshenv >nul 2>&1
if %errorlevel% equ 0 (
    call refreshenv >nul 2>&1
    echo Environment variables refreshed using refreshenv.
) else (
    echo refreshenv.cmd not found - PATH has been updated for this session only.
)
exit /b 0

:augment_path
set "TARGET_DIR=%~1"
set "CHECK_FILE=%~2"
if not defined TARGET_DIR exit /b 0
for %%p in ("%TARGET_DIR%") do set "TARGET_DIR=%%~fp"
if defined CHECK_FILE (
    if not exist "%TARGET_DIR%\%CHECK_FILE%" exit /b 0
) else (
    if not exist "%TARGET_DIR%" exit /b 0
)
for /f "delims=" %%p in ("%TARGET_DIR%") do set "TARGET_DIR=%%~fp"
echo Adding %TARGET_DIR% to PATH for this session.
set "PATH=%TARGET_DIR%;%PATH%"
exit /b 0
