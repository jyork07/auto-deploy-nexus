@echo off
title ViraPilot v2.0 - Quick Installer
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
echo Quick Installation Wizard
echo ========================================
echo.

:: Check for administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This installer requires administrator privileges.
    echo.
    echo Please right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [INFO] Administrator privileges confirmed.
echo.

:: Step 1: Install system dependencies
echo [STEP 1/4] Installing system dependencies...
echo.
call "%~dp0install-dependencies.bat"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

:: Step 2: Create installation directory
echo.
echo [STEP 2/4] Setting up installation directory...
set "INSTALL_DIR=%ProgramFiles%\ViraPilot"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copy application files
xcopy /E /I /H /Y "%~dp0..\*" "%INSTALL_DIR%\"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to copy application files
    pause
    exit /b 1
)

echo [INFO] Application files copied to %INSTALL_DIR%

:: Step 3: Build application
echo.
echo [STEP 3/4] Building ViraPilot application...
cd /d "%INSTALL_DIR%"
call "%INSTALL_DIR%\build-scripts\build.bat"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application
    pause
    exit /b 1
)

:: Step 4: Create shortcuts and register application
echo.
echo [STEP 4/4] Finalizing installation...

:: Create desktop shortcut
powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\ViraPilot.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\electron\release\win-unpacked\ViraPilot.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'ViraPilot - Advanced AI Pipeline Management'; $Shortcut.Save()}"

:: Create start menu shortcut
if not exist "%ProgramData%\Microsoft\Windows\Start Menu\Programs\ViraPilot" mkdir "%ProgramData%\Microsoft\Windows\Start Menu\Programs\ViraPilot"
powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%ProgramData%\Microsoft\Windows\Start Menu\Programs\ViraPilot\ViraPilot.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\electron\release\win-unpacked\ViraPilot.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'ViraPilot - Advanced AI Pipeline Management'; $Shortcut.Save()}"

:: Add to Windows Registry for uninstall
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "DisplayName" /t REG_SZ /d "ViraPilot v2.0" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "DisplayVersion" /t REG_SZ /d "2.0.0" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "Publisher" /t REG_SZ /d "ViraPilot Team" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "UninstallString" /t REG_SZ /d "%INSTALL_DIR%\uninstall.bat" /f

:: Create uninstaller
echo @echo off > "%INSTALL_DIR%\uninstall.bat"
echo echo Uninstalling ViraPilot... >> "%INSTALL_DIR%\uninstall.bat"
echo rd /s /q "%INSTALL_DIR%" >> "%INSTALL_DIR%\uninstall.bat"
echo del "%USERPROFILE%\Desktop\ViraPilot.lnk" >> "%INSTALL_DIR%\uninstall.bat"
echo rd /s /q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\ViraPilot" >> "%INSTALL_DIR%\uninstall.bat"
echo reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /f >> "%INSTALL_DIR%\uninstall.bat"
echo echo ViraPilot has been uninstalled. >> "%INSTALL_DIR%\uninstall.bat"
echo pause >> "%INSTALL_DIR%\uninstall.bat"

color 0B
echo.
echo ========================================
echo 🎉 Installation Completed Successfully! 🎉
echo ========================================
echo.
echo ViraPilot v2.0 has been installed to:
echo %INSTALL_DIR%
echo.
echo Shortcuts created:
echo • Desktop: ViraPilot.lnk
echo • Start Menu: Programs\ViraPilot\ViraPilot.lnk
echo.
echo You can now:
echo 1. Double-click the desktop shortcut to launch ViraPilot
echo 2. Access it from the Start Menu
echo 3. Configure your AI API keys in the Settings tab
echo.
echo To uninstall, run: %INSTALL_DIR%\uninstall.bat
echo.
set /p launch="Would you like to launch ViraPilot now? (Y/N): "
if /i "%launch%"=="Y" (
    start "" "%INSTALL_DIR%\electron\release\win-unpacked\ViraPilot.exe"
)

echo.
echo Thank you for installing ViraPilot!
pause