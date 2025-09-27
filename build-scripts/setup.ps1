[CmdletBinding()]
param(
    [switch]$SkipPackaging,
    [switch]$UseWinget,
    [string]$TranscriptPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not $TranscriptPath) {
    $TranscriptPath = Join-Path $root 'setup-transcript.log'
}

$transcriptStarted = $false
try {
    if ($PSVersionTable.PSVersion.Major -ge 5) {
        Start-Transcript -Path $TranscriptPath -Append | Out-Null
        $transcriptStarted = $true
    }
} catch {
    Write-Warning "Unable to start transcript logging: $_"
}

function Write-Section {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Gray
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Ensure-WingetReady {
    if (-not $UseWinget) {
        throw "Winget usage was not requested but is required for this operation."
    }

    if (-not $IsWindows) {
        throw "Winget automation is only available on Windows."
    }

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "winget CLI was not found on PATH. Install winget or install the dependency manually."
    }
}

function Ensure-Tool {
    param(
        [Parameter(Mandatory)] [string]$DisplayName,
        [Parameter(Mandatory)] [string]$CommandName,
        [string[]]$VersionArgs = @('--version'),
        [string]$VersionPattern,
        [string]$WingetId,
        [string]$InstallHint
    )

    $command = Get-Command $CommandName -ErrorAction SilentlyContinue
    if (-not $command) {
        Write-Info "$DisplayName was not found on PATH."
        if ($UseWinget -and $WingetId) {
            Ensure-WingetReady
            Write-Info "Attempting to install $DisplayName using winget ($WingetId)..."
            $wingetArgs = @('install', '--id', $WingetId, '--exact', '--source', 'winget', '--accept-package-agreements', '--accept-source-agreements')
            $proc = Start-Process -FilePath 'winget' -ArgumentList $wingetArgs -Wait -PassThru -NoNewWindow
            if ($proc.ExitCode -ne 0) {
                throw "winget install for $DisplayName failed with exit code $($proc.ExitCode)."
            }
            $command = Get-Command $CommandName -ErrorAction SilentlyContinue
        }

        if (-not $command) {
            $hint = if ($InstallHint) { " $InstallHint" } else { '' }
            throw "$DisplayName is required but could not be located.$hint"
        }
    }

    $version = $null
    try {
        $output = & $CommandName @VersionArgs 2>$null
        if ($null -ne $output) {
            $line = ($output | Select-Object -First 1).ToString().Trim()
            if ($VersionPattern -and ($line -match $VersionPattern)) {
                $version = $Matches[1]
            } elseif ($line) {
                $version = $line
            }
        }
    } catch {
        # ignore version detection errors
    }

    if ($version) {
        Write-Success "$DisplayName detected ($version)."
    } else {
        Write-Success "$DisplayName detected."
    }
}

function Invoke-CommandLine {
    param(
        [Parameter(Mandatory)] [string]$Command,
        [string[]]$Arguments = @(),
        [string]$WorkingDirectory
    )

    $previousLocation = Get-Location
    try {
        if ($WorkingDirectory) {
            Set-Location $WorkingDirectory
        }
        $argString = if ($Arguments.Count -gt 0) { $Arguments -join ' ' } else { '' }
        Write-Info "→ $Command $argString"
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Command '$Command' exited with code $LASTEXITCODE."
        }
    } finally {
        if ($WorkingDirectory) {
            Set-Location $previousLocation
        }
    }
}

function Invoke-Step {
    param(
        [Parameter(Mandatory)] [string]$Name,
        [Parameter(Mandatory)] [scriptblock]$Action
    )

    Write-Section $Name
    try {
        & $Action
        Write-Success "$Name completed."
    } catch {
        Write-Failure "$Name failed: $_"
        throw
    }
}

try {
    Write-Section 'ViraPilot automated setup'
    Write-Info "Repository root: $root"
    Write-Info "Transcript log: $TranscriptPath"

    Invoke-Step 'Validating required tooling' {
        Ensure-Tool -DisplayName 'Node.js' -CommandName 'node' -VersionPattern '^v?(.+)$' -WingetId 'OpenJS.NodeJS.LTS' -InstallHint 'Install the latest LTS build from https://nodejs.org/. '
        Ensure-Tool -DisplayName 'npm' -CommandName 'npm' -VersionPattern '^(.+)$' -InstallHint 'npm ships with Node.js. Reinstall Node.js if npm is missing.'
        Ensure-Tool -DisplayName 'Git' -CommandName 'git' -VersionArgs @('--version') -VersionPattern 'git version (.+)' -WingetId 'Git.Git' -InstallHint 'Download from https://git-scm.com/download/win.'
        Ensure-Tool -DisplayName 'Python' -CommandName 'python' -VersionArgs @('--version') -VersionPattern 'Python (.+)' -WingetId 'Python.Python.3.11' -InstallHint 'Install Python 3.11+ and enable "Add to PATH" during setup.'
    }

    Invoke-Step 'Installing workspace dependencies' {
        Invoke-CommandLine -Command 'npm' -Arguments @('install', '--no-audit', '--no-fund') -WorkingDirectory $root
    }

    Invoke-Step 'Building web application' {
        Invoke-CommandLine -Command 'npm' -Arguments @('run', 'build') -WorkingDirectory $root
    }

    Invoke-Step 'Installing Electron dependencies' {
        $electronDir = Join-Path $root 'electron'
        Invoke-CommandLine -Command 'npm' -Arguments @('install', '--no-audit', '--no-fund') -WorkingDirectory $electronDir
    }

    $shouldPackage = $true
    if ($SkipPackaging) {
        Write-Info 'Packaging skipped because -SkipPackaging was supplied.'
        $shouldPackage = $false
    } elseif (-not $IsWindows) {
        Write-Info 'Packaging skipped because Windows-specific artifacts cannot be produced on this platform.'
        $shouldPackage = $false
    }

    if ($shouldPackage) {
        Invoke-Step 'Packaging Electron application' {
            $electronDir = Join-Path $root 'electron'
            Invoke-CommandLine -Command 'npm' -Arguments @('run', 'build:win') -WorkingDirectory $electronDir
        }
    }

    Write-Section 'Setup finished'
    Write-Success 'ViraPilot workspace is ready.'
    Write-Info "Electron release artifacts (if built): $(Join-Path $root 'electron' 'release')"
    Write-Info "Nexus bundle (post-build): $(Join-Path $root 'dist' 'nexus')"
} finally {
    if ($transcriptStarted) {
        try {
            Stop-Transcript | Out-Null
        } catch {
            Write-Warning "Unable to stop transcript: $_"
        }
    }
}
