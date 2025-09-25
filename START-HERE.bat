@echo off
title ViraPilot v2.0 - Quick Start
color 0A
mode con cols=80 lines=30

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
echo ========================================================================
echo                           WELCOME TO VIRAPILOT!
echo ========================================================================
echo.
echo This is your complete AI Pipeline Management System with:
echo.
echo 🧠 Multi-AI Model Support (GPT-4, Claude, Gemini Pro, etc.)
echo ⚡ Real-time Pipeline Monitoring 
echo 🔐 Local Settings Storage (No cloud dependency)
echo 📊 Advanced Analytics and Insights
echo 💻 Standalone Desktop Application
echo 🎨 Beautiful Modern Interface
echo.
echo ========================================================================
echo                          INSTALLATION OPTIONS
echo ========================================================================
echo.
echo [1] QUICK INSTALL (Recommended)
echo     - One-click installation with all dependencies
echo     - Automatic desktop shortcut creation
echo     - Complete setup in 10-15 minutes
echo.
echo [2] READ INSTALLATION GUIDE
echo     - Detailed step-by-step instructions
echo     - Troubleshooting information
echo     - Manual installation options
echo.
echo [3] LAUNCH VIRAPILOT (if already installed)
echo     - Start the desktop application
echo     - Access your AI pipeline dashboard
echo.
echo [4] SYSTEM REQUIREMENTS CHECK
echo     - Verify your system compatibility
echo     - Check prerequisites
echo.
echo [5] EXIT
echo.
echo ========================================================================

:menu
set /p choice="Please select an option (1-5): "

if "%choice%"=="1" goto quick_install
if "%choice%"=="2" goto read_guide  
if "%choice%"=="3" goto launch_app
if "%choice%"=="4" goto system_check
if "%choice%"=="5" goto exit
echo Invalid choice. Please enter 1, 2, 3, 4, or 5.
goto menu

:quick_install
echo.
echo Starting Quick Installation...
echo.
echo This will:
echo - Install Node.js, Git, Python, and Visual Studio Build Tools
echo - Build the ViraPilot application
echo - Create desktop and start menu shortcuts
echo - Require administrator privileges
echo.
set /p confirm="Continue with installation? (Y/N): "
if /i "%confirm%"=="Y" (
    echo.
    echo Launching installer...
    call "%~dp0build-scripts\quick-install.bat"
) else (
    echo Installation cancelled.
    goto menu
)
goto end

:read_guide
echo.
echo Opening Installation Guide...
if exist "%~dp0INSTALLATION-GUIDE.md" (
    start notepad "%~dp0INSTALLATION-GUIDE.md"
) else (
    echo Installation guide not found. Opening README.md instead...
    if exist "%~dp0README.md" (
        start notepad "%~dp0README.md"
    ) else (
        echo Documentation files not found.
    )
)
goto menu

:launch_app
echo.
echo Checking for ViraPilot installation...
if exist "%~dp0electron\release\win-unpacked\ViraPilot.exe" (
    echo Found! Launching ViraPilot...
    start "" "%~dp0electron\release\win-unpacked\ViraPilot.exe"
    echo.
    echo ViraPilot launched successfully!
    echo If the application doesn't appear, check your taskbar.
) else if exist "%ProgramFiles%\ViraPilot\electron\release\win-unpacked\ViraPilot.exe" (
    echo Found! Launching ViraPilot from Program Files...
    start "" "%ProgramFiles%\ViraPilot\electron\release\win-unpacked\ViraPilot.exe"
    echo.
    echo ViraPilot launched successfully!
) else (
    echo ViraPilot not found. Please install it first using option 1.
)
goto menu

:system_check
echo.
echo ========================================================================
echo                          SYSTEM REQUIREMENTS CHECK
echo ========================================================================
echo.

:: Check Windows version
echo Checking Windows version...
for /f "tokens=4-7 delims=[.] " %%i in ('ver') do (
    if %%i==10 (
        echo ✅ Windows 10 detected - Compatible
    ) else if %%i==11 (
        echo ✅ Windows 11 detected - Compatible  
    ) else (
        echo ❌ Unsupported Windows version - Requires Windows 10 or 11
    )
)

:: Check for 64-bit
echo.
echo Checking system architecture...
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    echo ✅ 64-bit system detected - Compatible
) else (
    echo ❌ 32-bit system detected - Requires 64-bit Windows
)

:: Check available memory
echo.
echo Checking available memory...
for /f "tokens=2 delims==" %%i in ('wmic computersystem get TotalPhysicalMemory /value') do (
    set /a ram_gb=%%i/1024/1024/1024 2>nul
)
if defined ram_gb (
    if %ram_gb% geq 8 (
        echo ✅ %ram_gb% GB RAM detected - Excellent
    ) else if %ram_gb% geq 4 (
        echo ⚠️ %ram_gb% GB RAM detected - Minimum requirements met
    ) else (
        echo ❌ %ram_gb% GB RAM detected - Insufficient ^(4 GB minimum^)
    )
) else (
    echo ❓ Could not determine RAM amount
)

:: Check disk space
echo.
echo Checking disk space on C: drive...
for /f "tokens=3" %%i in ('dir C:\ /-c ^| find "bytes free"') do (
    set /a free_gb=%%i/1024/1024/1024 2>nul
)
if defined free_gb (
    if %free_gb% geq 5 (
        echo ✅ %free_gb% GB free space - Excellent
    ) else if %free_gb% geq 2 (
        echo ⚠️ %free_gb% GB free space - Minimum requirements met  
    ) else (
        echo ❌ %free_gb% GB free space - Insufficient ^(2 GB minimum^)
    )
) else (
    echo ❓ Could not determine free disk space
)

:: Check internet connection
echo.
echo Checking internet connection...
ping -n 1 google.com >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Internet connection - Available
) else (
    echo ❌ Internet connection - Not available ^(required for installation^)
)

:: Check admin privileges
echo.
echo Checking administrator privileges...
net session >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Administrator privileges - Available
) else (
    echo ❌ Administrator privileges - Required for installation
    echo    ^(Right-click this file and select "Run as administrator"^)
)

echo.
echo ========================================================================
echo System check completed. Review the results above.
echo ========================================================================
echo.
pause
goto menu

:exit
echo.
echo Thank you for choosing ViraPilot!
echo.
echo If you need help:
echo - Read the INSTALLATION-GUIDE.md file
echo - Check the README.md for detailed information  
echo - Visit our GitHub repository for support
echo.
timeout /t 3 >nul
exit

:end
echo.
echo ========================================================================
echo Installation process completed.
echo Check the installation window for results.
echo ========================================================================
pause