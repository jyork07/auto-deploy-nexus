# JarvisOS Windows Supervisor Build Path

This guide captures a practical Windows PowerShell build path for a local “Jarvis supervisor” stack:

- **Ollama** for local models.
- **Tailscale** for private remote access.
- **Obsidian + Local REST API plugin** for memory.
- **Electron** for a single-instance desktop supervisor.

> Scope note: some steps are intentionally manual (GUI/auth flows).

## 1) One-time machine setup (PowerShell)

```powershell
$ErrorActionPreference = "Stop"

$ROOT = "$env:USERPROFILE\JarvisOS"
$APP  = "$ROOT\app"
$DATA = "$ROOT\data"
$LOGS = "$ROOT\logs"
$BIN  = "$ROOT\bin"

New-Item -ItemType Directory -Force -Path $ROOT,$APP,$DATA,$LOGS,$BIN | Out-Null

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not installed. Install Node 20 LTS first: https://nodejs.org/"
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed. Install Git first: https://git-scm.com/download/win"
  exit 1
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Host "Python is not installed. Install Python 3.11+ first: https://www.python.org/downloads/windows/"
  exit 1
}

Write-Host "Base prerequisites detected."
```

## 2) Install Ollama

```powershell
irm https://ollama.com/install.ps1 | iex
ollama --version
ollama pull qwen3:8b
ollama pull qwen3:4b
ollama pull nomic-embed-text
ollama run qwen3:4b "Reply with exactly: OLLAMA_OK"
```

## 3) Install Tailscale

```powershell
Write-Host "Install Tailscale from https://tailscale.com/download/windows"
tailscale version
tailscale login
tailscale status
tailscale ip
```

## 4) Install Obsidian + prepare vault

```powershell
$VAULT = "$ROOT\vault"
New-Item -ItemType Directory -Force -Path $VAULT | Out-Null

New-Item -ItemType Directory -Force -Path `
  "$VAULT\00 Inbox",`
  "$VAULT\01 Memory",`
  "$VAULT\02 Tasks",`
  "$VAULT\03 Projects",`
  "$VAULT\04 Logs",`
  "$VAULT\05 Prompts" | Out-Null

@"
# Jarvis Brain

- This vault is the durable memory layer.
- OpenClaw is the executor.
- Ollama is the local model runtime.
"@ | Set-Content "$VAULT\00 Inbox\Jarvis Brain.md"
```

Manual Obsidian steps:

1. Open vault: `C:\Users\<you>\JarvisOS\vault`
2. Settings → Community plugins
3. Disable safe mode (if needed)
4. Install/enable **Local REST API**
5. Generate API key
6. Keep host as localhost
7. Record the plugin port and key

## 5) Install OpenClaw (from Ollama integrations)

```powershell
ollama launch
openclaw --version
openclaw doctor
```

## 6) Create Electron app

```powershell
cd $ROOT
npm create electron@latest app -- --template=webpack-typescript
cd $APP
npm install
npm install axios better-sqlite3 ps-list tree-kill wait-on
npm install electron-store
npm install --save-dev electron-builder cross-env concurrently
```

## 7) Create supervisor layout

```powershell
cd $APP
New-Item -ItemType Directory -Force -Path `
  ".\src\main",`
  ".\src\renderer",`
  ".\src\shared",`
  ".\src\main\services",`
  ".\src\main\health",`
  ".\src\main\repair",`
  ".\src\main\obsidian",`
  ".\src\main\ollama",`
  ".\src\main\openclaw",`
  ".\src\main\tailscale" | Out-Null
```

## 8) Main Electron process (`src/main/main.ts`)

Use a single-instance lock and IPC health checks:

- `app.requestSingleInstanceLock()` to prevent duplicate launches.
- `ipcMain.handle("health:all", ...)` to query Ollama/Tailscale/OpenClaw.
- `execFile` wrappers for CLI checks.

## 9) Preload bridge (`src/main/preload.ts`)

Expose a narrow API surface:

- `window.jarvis.healthAll()` through `contextBridge` + `ipcRenderer.invoke`.

## 10) Renderer (`src/renderer/index.html`)

Minimal dashboard with a **Run health check** button that renders JSON output.

## 11) `package.json` scripts/build

Recommended baseline:

```json
{
  "scripts": {
    "start": "electron .",
    "dist": "electron-builder"
  },
  "build": {
    "appId": "local.jarvis.os",
    "productName": "JarvisOS",
    "files": ["src/**/*", "package.json"],
    "win": {
      "target": "nsis"
    }
  }
}
```

## 12) Local env file

Create `.env.local`:

```env
OBSIDIAN_REST_URL=http://127.0.0.1:27123
OBSIDIAN_API_KEY=PUT_YOUR_KEY_HERE
OLLAMA_URL=http://127.0.0.1:11434
```

## 13) First run

```powershell
cd $APP
npm start
```

Then click **Run health check**.

## 14) Tailscale remote access (private)

Prefer **Serve** for tailnet-only exposure:

```powershell
tailscale serve http / http://127.0.0.1:3000
tailscale serve status
tailscale serve --help
```

Do **not** publish Ollama/OpenClaw/Obsidian directly.

## 15) Build installer/EXE

```powershell
cd $APP
npm run dist
```

## 16) Startup self-heal script (`launch-jarvis.ps1`)

```powershell
$ErrorActionPreference = "Continue"

function Test-Http($url) {
  try {
    Invoke-RestMethod -Uri $url -TimeoutSec 3 | Out-Null
    return $true
  } catch {
    return $false
  }
}

Write-Host "Checking Ollama..."
if (-not (Test-Http "http://127.0.0.1:11434/api/tags")) {
  Write-Host "Ollama is not responding."
}

Write-Host "Checking Tailscale..."
try { tailscale status | Out-Null } catch { Write-Host "Tailscale CLI unavailable." }

Write-Host "Checking OpenClaw..."
try { openclaw doctor } catch { Write-Host "OpenClaw unavailable." }

Write-Host "Launching Jarvis UI..."
Start-Process "$env:USERPROFILE\JarvisOS\app\node_modules\.bin\electron.cmd" -ArgumentList "."
```

Run:

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\JarvisOS\launch-jarvis.ps1"
```

## 17) Still-manual tasks

- Installing Obsidian desktop.
- Enabling/configuring Local REST API plugin inside Obsidian.
- Tailscale sign-in.
- OpenClaw onboarding if integration paths change.

## 18) Next-level supervisor hardening

- Check PID ownership before killing ports.
- Verify required Ollama models are present.
- Probe Obsidian REST using API key.
- Run `openclaw doctor` and parse result.
- Validate `tailscale status`.
- Launch UI only after all critical checks pass.
