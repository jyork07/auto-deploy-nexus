# Jarvis-Style Windows Build Path (PowerShell)

This guide captures a practical local stack for a **Jarvis-style supervisor** on Windows:

- **Model runtime:** Ollama
- **Primary model:** Qwen (tool/coding-focused)
- **Agent layer:** OpenClaw
- **Memory:** Obsidian vault + Local REST API plugin
- **UI:** Electron supervisor app
- **Remote access:** Tailscale Serve (tailnet-only)

> Scope note: some setup steps are intentionally manual (Obsidian plugin enablement, Tailscale auth, OpenClaw onboarding).

## 1) One-time machine prerequisite check

Run in PowerShell (standard user is fine):

```powershell
$ErrorActionPreference = "Stop"

$ROOT = "$env:USERPROFILE\JarvisOS"
$APP  = "$ROOT\app"
$DATA = "$ROOT\data"
$LOGS = "$ROOT\logs"
$BIN  = "$ROOT\bin"

New-Item -ItemType Directory -Force -Path $ROOT,$APP,$DATA,$LOGS,$BIN | Out-Null

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js not found. Install Node 20 LTS: https://nodejs.org/"
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git not found. Install Git: https://git-scm.com/download/win"
  exit 1
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Host "Python not found. Install Python 3.11+: https://www.python.org/downloads/windows/"
  exit 1
}

Write-Host "Base prerequisites detected."
```

## 2) Install Ollama and pull local models

```powershell
irm https://ollama.com/install.ps1 | iex
ollama --version

ollama pull qwen3:8b
ollama pull qwen3:4b
ollama pull nomic-embed-text

ollama run qwen3:4b "Reply with exactly: OLLAMA_OK"
```

## 3) Install and validate Tailscale

```powershell
Write-Host "Install from: https://tailscale.com/download/windows"
tailscale version
tailscale login
tailscale status
tailscale ip
```

## 4) Create Obsidian vault structure

```powershell
$ROOT  = "$env:USERPROFILE\JarvisOS"
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

### Manual Obsidian action (required)

1. Open vault: `C:\Users\<you>\JarvisOS\vault`
2. Settings → Community plugins
3. Disable Safe Mode if needed
4. Install + enable **Local REST API**
5. Generate API key and keep host on localhost
6. Record the plugin port + API key

## 5) Install OpenClaw via Ollama integrations

```powershell
ollama launch
# choose OpenClaw in the launcher

openclaw --version
openclaw doctor
```

## 6) Scaffold Electron app + dependencies

```powershell
$ROOT = "$env:USERPROFILE\JarvisOS"
$APP  = "$ROOT\app"

cd $ROOT
npm create electron@latest app -- --template=webpack-typescript
cd $APP
npm install
npm install axios better-sqlite3 ps-list tree-kill wait-on electron-store
npm install --save-dev electron-builder cross-env concurrently
```

## 7) Supervisor folder structure

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

## 8) Local environment file

```powershell
@"
OBSIDIAN_REST_URL=http://127.0.0.1:27123
OBSIDIAN_API_KEY=PUT_YOUR_KEY_HERE
OLLAMA_URL=http://127.0.0.1:11434
"@ | Set-Content ".\.env.local"
```

## 9) First run

```powershell
cd $APP
npm start
```

## 10) Tailscale remote access (safe default)

Use **Serve** (tailnet-only) rather than Funnel (public internet):

```powershell
# example: expose only your local dashboard
# verify current syntax with `tailscale serve --help`
tailscale serve http / http://127.0.0.1:3000
tailscale serve status
```

## 11) Build Windows installer

```powershell
cd $APP
npm run dist
```

## 12) Optional startup self-heal launcher

Create `C:\Users\<you>\JarvisOS\launch-jarvis.ps1`:

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

Run with:

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\JarvisOS\launch-jarvis.ps1"
```

---

## Recommended baseline choices

- **Default model:** `qwen2.5:7b-instruct` (or `qwen3:4b/8b` if you prioritize speed/quality tradeoff)
- **Runtime:** Ollama
- **Agent executor:** OpenClaw
- **Memory:** Obsidian + embeddings
- **Remote control:** Tailscale Serve

## Manual checkpoints that remain expected

- Obsidian desktop install + Local REST API plugin activation
- Tailscale account sign-in/auth flow
- OpenClaw integration onboarding

These are normal GUI/browser-auth steps and are not fully automatable in a clean PowerShell-only path.
