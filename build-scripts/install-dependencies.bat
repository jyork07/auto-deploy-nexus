@echo off
echo ========================================
echo ViraPilot v2.0 - Dependency Installer
echo ========================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This script requires administrator privileges.
    echo Please run as administrator.
    pause
    exit /b 1
)

:: Create temp directory for downloads
if not exist "%TEMP%\virapilot-setup" mkdir "%TEMP%\virapilot-setup"
cd /d "%TEMP%\virapilot-setup"

:: Check if Node.js is already installed
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js is already installed.
    goto :git_check
)

echo Installing Node.js...
:: Download Node.js installer
powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile 'nodejs.msi'"
if %errorlevel% neq 0 (
    echo ERROR: Failed to download Node.js
    pause
    exit /b 1
)

:: Install Node.js silently
msiexec /i nodejs.msi /quiet /norestart
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js
    pause
    exit /b 1
)

echo Node.js installed successfully.

:git_check
:: Check if Git is already installed
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Git is already installed.
    goto :python_check
)

echo Installing Git...
:: Download Git installer
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/latest/download/Git-2.42.0-64-bit.exe' -OutFile 'git-installer.exe'"
if %errorlevel% neq 0 (
    echo ERROR: Failed to download Git
    pause
    exit /b 1
)

:: Install Git silently
git-installer.exe /VERYSILENT /NORESTART
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Git
    pause
    exit /b 1
)

echo Git installed successfully.

:python_check
:: Check if Python is already installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python is already installed.
    goto vs_build_tools
)

echo Installing Python...
:: Download Python installer
powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.6/python-3.11.6-amd64.exe' -OutFile 'python-installer.exe'"
if %errorlevel% neq 0 (
    echo ERROR: Failed to download Python
    pause
    exit /b 1
)

:: Install Python silently
python-installer.exe /quiet InstallAllUsers=1 PrependPath=1
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python
    pause
    exit /b 1
)

echo Python installed successfully.

:vs_build_tools
:: Install Visual Studio Build Tools (required for native modules)
echo Installing Visual Studio Build Tools...
powershell -Command "Invoke-WebRequest -Uri 'https://aka.ms/vs/17/release/vs_buildtools.exe' -OutFile 'vs_buildtools.exe'"
if %errorlevel% neq 0 (
    echo ERROR: Failed to download Visual Studio Build Tools
    pause
    exit /b 1
)

:: Install VS Build Tools with C++ workload
vs_buildtools.exe --quiet --wait --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended
if %errorlevel% neq 0 (
    echo WARNING: Visual Studio Build Tools installation may have failed
    echo This might affect native module compilation
)

echo Visual Studio Build Tools installed.

:: Refresh environment variables
call refreshenv.cmd >nul 2>&1

echo.
echo ========================================
echo All dependencies installed successfully!
echo ========================================
echo.
echo Please restart your command prompt or computer
echo for all environment variables to take effect.
echo.
pause

:: Cleanup
cd /d "%USERPROFILE%"
rd /s /q "%TEMP%\virapilot-setup" >nul 2>&1