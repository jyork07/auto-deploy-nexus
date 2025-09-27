# ViraPilot v2.0 - Installation Guide

Welcome! This guide walks you through getting the full Windows desktop app running without any developer tooling. Follow the
steps in order and you will finish with a clickable `ViraPilot.exe` build.

## 🚀 Simple Windows Install (Recommended)

### 1. Check your PC
- Windows 10 (64-bit) build 1903 or newer, or any Windows 11 64-bit edition
- 4 GB RAM minimum (8 GB or more recommended)
- 5 GB of free disk space (to hold the project and build output)
- Stable internet connection, or the ability to download installers ahead of time
- Administrator rights on the machine

### 2. Install the required tools (do this once)
1. **Git** – download from https://git-scm.com/download/win. Choose the standard installer (or the standalone/offline installer if
   you expect to be without internet) and accept the defaults.
2. **Node.js 20 LTS** – download from https://nodejs.org/en/download/ and install using the Windows `.msi` package. Close and reopen
   any terminals afterwards so they pick up the new PATH.
3. **Python 3.11** – download from https://www.python.org/downloads/. When the installer appears, tick **"Add python.exe to PATH"**
   at the bottom before clicking Install.
4. **Visual Studio Build Tools** – visit https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022, grab the
   installer, and select the **"Desktop development with C++"** workload. Restart Windows when prompted.

Once these are installed you do not need to repeat this step for future ViraPilot updates.

### 3. Get the ViraPilot files
- Download the latest release zip (for example `ViraPilot-v2.0.0.zip`) and extract it to `C:\ViraPilot`, **or**
- After installing Git, clone the repository with `git clone https://github.com/<your-org>/ViraPilot.git C:\ViraPilot`

Confirm the folder contains files such as `package.json`, `START-HERE.bat`, `electron/`, and `build-scripts/` before moving on.

### 4. Run the setup command
1. Open the Start menu, search for **"Command Prompt"**, right-click it, and choose **"Run as administrator"**.
2. Switch to your ViraPilot directory:
   ```cmd
   cd "C:\ViraPilot"
   ```
3. Start the automated build:
   ```cmd
   npm run setup
   ```

This single command installs every Node/Electron dependency, builds the production React bundle, packages the Electron desktop
application, and writes the finished files to `electron\release\win-unpacked`. The first run can take 10–20 minutes depending on
internet speed.

You will know it worked when you see `ViraPilot.exe` inside the `electron\release\win-unpacked` folder.

### 5. Launch the desktop app
- Open File Explorer to `C:\ViraPilot\electron\release\win-unpacked\`
- Double-click **`ViraPilot.exe`** for the full, non-debug experience
- Optional: Right-click → **Send to → Desktop (create shortcut)** so you can open it quickly next time

### 6. Keep things tidy
- Leave the `C:\ViraPilot` folder in place; you can rerun `npm run setup` there when a new version ships
- Copy the shortcut to `C:\ProgramData\Microsoft\Windows\Start Menu\Programs` if you want Start Menu integration
- To remove ViraPilot completely, delete the folder and shortcut

## 🧰 If `npm run setup` fails

You can complete the install manually with the following sequence:

1. Install dependencies if you have not already:
   ```cmd
   npm install
   ```
2. Build the React application:
   ```cmd
   npm run build
   ```
3. Install the Electron-specific dependencies:
   ```cmd
   cd electron
   npm install
   ```
4. Package the Windows desktop build:
   ```cmd
   npm run build:win
   cd ..
   ```
5. Launch the packaged app from `electron\release\win-unpacked\ViraPilot.exe`.

If any command fails, read the error message, resolve the missing dependency (see Troubleshooting below), and run the same
command again.

## 🛠️ What the setup installs

### System dependencies you added in Step 2
- **Node.js v20.x LTS** – JavaScript runtime needed for builds
- **Git** – required by certain npm packages during installation
- **Python 3.11.x** – used by native Node modules that compile binaries
- **Visual Studio Build Tools** – provides the MSVC compiler toolchain

### Application components produced by `npm run setup`
- **React production bundle** for the user interface
- **Electron desktop app** that wraps the UI as a native Windows program
- **Pipeline services** responsible for AI job orchestration and monitoring
- **Secure local storage** for settings and API keys

## 🎯 First launch checklist

1. Start `ViraPilot.exe` (desktop shortcut or the win-unpacked folder).
2. Open the **Settings → API Keys** tab and paste your keys for OpenAI, Anthropic, Google AI, and/or Azure OpenAI.
3. Visit **Settings → General** to customise notifications and autosave behaviour.
4. Visit **Settings → Performance** to adjust concurrent jobs and cache size based on your hardware.
5. Run a smoke test from the **Pipeline** tab by choosing a model, entering a short prompt, and pressing **Start Processing**.

## 🚨 Troubleshooting quick fixes

| Symptom | Likely cause | How to fix |
| --- | --- | --- |
| `npm` says it cannot find Node | Terminal was opened before Node installation | Close the terminal and open a new **Run as administrator** Command Prompt |
| `python` is not recognized | PATH option unchecked during Python install | Re-run the Python installer and tick **Add python.exe to PATH**, or add it manually via System Properties → Environment Variables |
| Build fails complaining about MSVC/CL | Visual Studio Build Tools missing the C++ workload | Re-run the Visual Studio Build Tools installer and enable **Desktop development with C++**, then reboot |
| Permission denied errors | Command Prompt lacks admin rights or antivirus interference | Run Command Prompt as administrator and temporarily pause aggressive antivirus tools |
| Network timeouts during `npm run setup` | Slow or filtered internet connection | Retry on a stable network or configure your proxy with `npm config set proxy <url>` / `npm config set https-proxy <url>` |

If the packaged app still will not start, run it from the terminal to capture logs:
```cmd
"C:\ViraPilot\electron\release\win-unpacked\ViraPilot.exe"
```
Then open Windows Event Viewer (Windows Logs → Application) for additional details and share them with support.

## 🔄 Updating ViraPilot later

1. Open Command Prompt as administrator and change into `C:\ViraPilot`.
2. Pull or download the latest release files.
3. Run `npm run setup` again. Only changed files will be rebuilt.

## 🗑️ Uninstalling ViraPilot

1. Delete the `C:\ViraPilot` folder.
2. Remove any desktop or Start Menu shortcuts.
3. (Optional) Remove the application entry from Windows Settings → Apps if you created one manually.

## 📞 Getting help

- Review this guide and the troubleshooting table above.
- Export configuration data from **Settings → Security → Export Configuration** if support requests it.
- When opening a ticket, include your Windows version, what step failed, and the exact error message shown in the terminal.

Happy flying! ✈️

