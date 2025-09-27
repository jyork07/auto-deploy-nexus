@echo off
setlocal EnableExtensions EnableDelayedExpansion
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

call :require_admin || goto :fail

echo [STEP 1/4] Installing and verifying system dependencies...
call "%~dp0install-dependencies.bat"
if %errorlevel% neq 0 goto :fail

call :prepare_paths || goto :fail

echo.
echo [STEP 2/4] Copying ViraPilot files to !INSTALL_DIR!...
call :sync_application_files || goto :fail

pushd "!INSTALL_DIR!" >nul

echo.
echo [STEP 3/4] Preparing Node.js environment...
call :hydrate_environment || goto :fail_popd

echo.
echo [STEP 4/4] Creating shortcuts and installers...
call :finalize_installation || goto :fail_popd

call :success_message
popd >nul
endlocal
exit /b 0

:fail_popd
popd >nul

:fail
color 0C
echo.
echo ========================================
echo ❌ Installation failed
echo ========================================
echo Review the errors above, resolve them, and run the Quick Installer again.
echo.
pause
endlocal
exit /b 1

:: -----------------------------------------------------------------
:: Helper routines
:: -----------------------------------------------------------------

:require_admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Administrator privileges are required.
    echo Right-click this file and choose "Run as administrator".
    echo.
    pause
    exit /b 1
)
color 0A
echo [INFO] Administrator privileges confirmed.
echo.
exit /b 0

:prepare_paths
set "INSTALL_DIR=%ProgramFiles%\ViraPilot"
for %%I in ("%~dp0..") do set "SOURCE_DIR=%%~fI"
if /I "!SOURCE_DIR!"=="!INSTALL_DIR!" (
    set "SOURCE_DIR=!INSTALL_DIR!"
    set "SKIP_COPY=1"
) else (
    set "SKIP_COPY=0"
)

if not exist "!INSTALL_DIR!" mkdir "!INSTALL_DIR!"
if not exist "!INSTALL_DIR!" (
    echo [ERROR] Unable to create installation directory at !INSTALL_DIR!.
    exit /b 1
)
exit /b 0

:sync_application_files
if "!SKIP_COPY!"=="1" (
    echo [INFO] Running installer from existing installation directory. Skipping file copy.
    exit /b 0
)

if exist "!INSTALL_DIR!\*" (
    echo [INFO] Cleaning previous installation directory...
    for %%D in ("node_modules" "dist" "electron\node_modules" "electron\release" "Installers") do (
        if exist "!INSTALL_DIR!\%%~D" rd /s /q "!INSTALL_DIR!\%%~D"
    )
)

if exist "!SOURCE_DIR!\Installers" rd /s /q "!SOURCE_DIR!\Installers"

if exist "%SystemRoot%\System32\robocopy.exe" (
    robocopy "!SOURCE_DIR!" "!INSTALL_DIR!" /MIR /FFT /R:2 /W:5 /XD ".git" ".github" "Installers" "electron\release" "dist" "node_modules" "electron\node_modules" /XF "*.lnk" "*.log" >nul
    set "RC=%ERRORLEVEL%"
    if !RC! GEQ 8 (
        echo [ERROR] File copy failed with Robocopy exit code !RC!.
        exit /b 1
    )
) else (
    xcopy /E /I /H /Y "!SOURCE_DIR!\*" "!INSTALL_DIR!\" >nul
    if %errorlevel% neq 0 (
        echo [ERROR] File copy failed with XCOPY error level %errorlevel%.
        exit /b 1
    )
)

echo [INFO] Application files copied to !INSTALL_DIR!
exit /b 0

:hydrate_environment
set "NODE_DEFAULT=%ProgramFiles%\nodejs"
if exist "!NODE_DEFAULT!\node.exe" set "PATH=!NODE_DEFAULT!;!PATH!"
if defined ProgramFiles(x86) (
    set "NODE_DEFAULT_X86=%ProgramFiles(x86)%\nodejs"
    if exist "!NODE_DEFAULT_X86!\node.exe" set "PATH=!NODE_DEFAULT_X86!;!PATH!"
)

set "PY_DEFAULT=%ProgramFiles%\Python311"
if exist "!PY_DEFAULT!\python.exe" set "PATH=!PY_DEFAULT!;!PY_DEFAULT!\Scripts;!PATH!"
if defined ProgramFiles(x86) (
    set "PY_DEFAULT_X86=%ProgramFiles(x86)%\Python311"
    if exist "!PY_DEFAULT_X86!\python.exe" set "PATH=!PY_DEFAULT_X86!;!PY_DEFAULT_X86!\Scripts;!PATH!"
)

set "GIT_DEFAULT=%ProgramFiles%\Git\cmd"
if exist "!GIT_DEFAULT!\git.exe" set "PATH=!GIT_DEFAULT!;!PATH!"
if defined ProgramFiles(x86) (
    set "GIT_DEFAULT_X86=%ProgramFiles(x86)%\Git\cmd"
    if exist "!GIT_DEFAULT_X86!\git.exe" set "PATH=!GIT_DEFAULT_X86!;!PATH!"
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found on PATH even after installation.
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm was not found on PATH. Please verify your Node.js installation.
    exit /b 1
)

if exist node_modules (
    echo [INFO] Removing previous node_modules to ensure a clean install...
    rd /s /q node_modules
)

echo [INFO] Installing workspace dependencies (this can take several minutes)...
npm ci --no-audit --no-fund >nul
if %errorlevel% neq 0 (
    echo [WARN] npm ci failed - falling back to npm install.
    npm install --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install workspace dependencies.
        exit /b 1
    )
)

echo [INFO] Running Vite build (includes Nexus extraction)...
npm run build --silent
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    exit /b 1
)

if exist electron\node_modules (
    echo [INFO] Refreshing Electron dependencies...
    rd /s /q electron\node_modules
)

pushd electron >nul
if exist package-lock.json (
    npm ci --no-audit --no-fund >nul
    set "NPM_RC=%ERRORLEVEL%"
    if !NPM_RC! neq 0 (
        echo [WARN] npm ci in /electron failed - retrying with npm install.
        npm install --no-audit --no-fund
        if %errorlevel% neq 0 (
            popd >nul
            echo [ERROR] Failed to install Electron dependencies.
            exit /b 1
        )
    )
) else (
    npm install --no-audit --no-fund >nul
    if %errorlevel% neq 0 (
        popd >nul
        echo [ERROR] Failed to install Electron dependencies.
        exit /b 1
    )
)
popd >nul

exit /b 0

:finalize_installation
set "RELEASE_DIR=electron\release"
if exist "%RELEASE_DIR%" rd /s /q "%RELEASE_DIR%"

pushd electron >nul
call npm run build:win
if %errorlevel% neq 0 (
    popd >nul
    echo [ERROR] Electron packaging failed.
    exit /b 1
)
popd >nul

if not exist "%RELEASE_DIR%" (
    echo [ERROR] Expected release artifacts were not generated.
    exit /b 1
)

set "INSTALLERS_DIR=Installers"
if not exist "%INSTALLERS_DIR%" mkdir "%INSTALLERS_DIR%"
if exist "%INSTALLERS_DIR%\ViraPilot-Installers.zip" del /f /q "%INSTALLERS_DIR%\ViraPilot-Installers.zip" >nul 2>&1

for %%F in ("%RELEASE_DIR%\*.exe" "%RELEASE_DIR%\*.msi" "%RELEASE_DIR%\*.zip" "%RELEASE_DIR%\*.yml" "%RELEASE_DIR%\*.blockmap") do (
    if exist %%~fF copy /Y %%~fF "%INSTALLERS_DIR%\" >nul
)

if exist "%RELEASE_DIR%\win-unpacked" (
    if exist "%INSTALLERS_DIR%\win-unpacked" rd /s /q "%INSTALLERS_DIR%\win-unpacked"
    if exist "%SystemRoot%\System32\robocopy.exe" (
        robocopy "%RELEASE_DIR%\win-unpacked" "%INSTALLERS_DIR%\win-unpacked" /MIR /R:2 /W:5 >nul
        set "RC=%ERRORLEVEL%"
        if !RC! GEQ 8 (
            echo [WARN] Failed to copy win-unpacked directory (Robocopy code !RC!).
        )
    ) else (
        xcopy /E /I /H /Y "%RELEASE_DIR%\win-unpacked\*" "%INSTALLERS_DIR%\win-unpacked\" >nul
    )
)

if exist "%INSTALLERS_DIR%\*" (
    powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '%INSTALLERS_DIR%\*' -DestinationPath '%INSTALLERS_DIR%\ViraPilot-Installers.zip' -Force" >nul
    if %errorlevel% neq 0 (
        echo [WARN] Unable to create bundled installer archive. Individual files are still available.
    ) else (
        echo [INFO] Packaged installers archived at !INSTALL_DIR!\%INSTALLERS_DIR%\ViraPilot-Installers.zip
    )
)

call :create_shortcuts
call :register_uninstaller
exit /b 0

:create_shortcuts
set "TARGET_EXE=%INSTALL_DIR%\electron\release\win-unpacked\ViraPilot.exe"
if not exist "%TARGET_EXE%" (
    echo [WARN] Desktop binary not found at %TARGET_EXE%. Skipping shortcut creation.
    exit /b 0
)

powershell -NoLogo -NoProfile -Command "& {$shell = New-Object -ComObject WScript.Shell; $desktopShortcut = $shell.CreateShortcut('$env:USERPROFILE\Desktop\ViraPilot.lnk'); $desktopShortcut.TargetPath = '%TARGET_EXE%'; $desktopShortcut.WorkingDirectory = '%INSTALL_DIR%'; $desktopShortcut.Description = 'ViraPilot - Advanced AI Pipeline Management'; $desktopShortcut.Save()}" >nul

if not exist "%ProgramData%\Microsoft\Windows\Start Menu\Programs\ViraPilot" mkdir "%ProgramData%\Microsoft\Windows\Start Menu\Programs\ViraPilot"
powershell -NoLogo -NoProfile -Command "& {$shell = New-Object -ComObject WScript.Shell; $menuShortcut = $shell.CreateShortcut('%ProgramData%\Microsoft\Windows\Start Menu\Programs\ViraPilot\ViraPilot.lnk'); $menuShortcut.TargetPath = '%TARGET_EXE%'; $menuShortcut.WorkingDirectory = '%INSTALL_DIR%'; $menuShortcut.Description = 'ViraPilot - Advanced AI Pipeline Management'; $menuShortcut.Save()}" >nul
exit /b 0

:register_uninstaller
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "DisplayName" /t REG_SZ /d "ViraPilot v2.0" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "DisplayVersion" /t REG_SZ /d "2.0.0" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "Publisher" /t REG_SZ /d "ViraPilot Team" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /v "UninstallString" /t REG_SZ /d "%INSTALL_DIR%\uninstall.bat" /f >nul

echo @echo off>"%INSTALL_DIR%\uninstall.bat"
echo echo Uninstalling ViraPilot...>>"%INSTALL_DIR%\uninstall.bat"
echo rd /s /q "%INSTALL_DIR%">>"%INSTALL_DIR%\uninstall.bat"
echo del "%USERPROFILE%\Desktop\ViraPilot.lnk" 2^>nul>>"%INSTALL_DIR%\uninstall.bat"
echo rd /s /q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\ViraPilot" 2^>nul>>"%INSTALL_DIR%\uninstall.bat"
echo reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot" /f>>"%INSTALL_DIR%\uninstall.bat"
echo echo ViraPilot has been uninstalled.>>"%INSTALL_DIR%\uninstall.bat"
echo pause>>"%INSTALL_DIR%\uninstall.bat"
exit /b 0

:success_message
color 0B
echo.
echo ========================================
echo 🎉 Installation Completed Successfully! 🎉
echo ========================================
echo.
echo ViraPilot v2.0 has been installed to:
echo %INSTALL_DIR%
echo.
echo Installer packages are available in:
echo %INSTALL_DIR%\Installers
echo.
echo Shortcuts created:
echo • Desktop: ViraPilot.lnk
echo • Start Menu: Programs\ViraPilot\ViraPilot.lnk
echo.
set /p launch="Would you like to launch ViraPilot now? (Y/N): "
if /i "!launch!"=="Y" (
    start "" "%INSTALL_DIR%\electron\release\win-unpacked\ViraPilot.exe"
)

echo.
echo Thank you for installing ViraPilot!
pause
exit /b 0
