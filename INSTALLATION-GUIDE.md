# ViraPilot v2.0 - Installation Guide

## 🚀 Quick Start

1. **Install Node.js** – version 20 or newer is recommended. The LTS installer from [nodejs.org](https://nodejs.org/) includes npm.
2. **Install dependencies** – from the project root run:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

   The app is served at http://localhost:5173/ with hot-module reloading enabled.

4. **Build for production** (optional):

   ```bash
   npm run build    # Create the optimized web bundle
   npm run preview  # Preview the build locally
   npm run lint     # Run ESLint to ensure code quality
   ```

## 💻 Packaging the Desktop App

The Electron project lives in the `electron/` directory. Packaging requires the web assets built in the previous step.

```bash
# From the repository root
npm run build

cd electron
npm install

# Choose the appropriate packaging command for your platform
npm run build:win    # Windows installer and portable build
npm run build:mac    # macOS DMG
npm run build:linux  # Linux AppImage, deb, and rpm
```

Artifacts are output to `electron/release/`. You can clean the directory between builds if needed.

## 🪟 Windows Helper Scripts (Optional)

Legacy batch files are still provided for teams that prefer a scripted setup:

- `build-scripts\quick-install.bat` – installs prerequisites, builds the app, and creates shortcuts.
- `build-scripts\install-dependencies.bat` – installs Node.js, Git, Python, and the Visual Studio Build Tools.
- `build-scripts\build.bat` – rebuilds the frontend and packages the Electron app.

Run these scripts from an elevated PowerShell or Command Prompt session. They are optional and not required for day-to-day development.

## 🎯 First Launch Setup

### 1. Launch ViraPilot
- Double-click desktop shortcut or
- Find in Start Menu → ViraPilot

### 2. Initial Configuration
The application will open with the dashboard. Navigate to the **Settings** tab to configure:

#### API Keys Tab:
- **OpenAI**: Enter your OpenAI API key for GPT models
- **Anthropic**: Enter your Anthropic API key for Claude models  
- **Google AI**: Enter your Google AI API key for Gemini models
- **Azure OpenAI**: Configure Azure endpoint and key

#### General Settings:
- Enable/disable notifications
- Set auto-save preferences
- Configure debug mode if needed

#### Performance Settings:
- Set maximum concurrent jobs (1-10)
- Configure cache size (512-4096 MB)
- Adjust based on your system capabilities

### 3. Test Your Setup
1. Go to **Pipeline** tab
2. Select an AI model you've configured
3. Enter a test prompt
4. Click "Start Processing"
5. Monitor progress in **Overview** tab

## 🚨 Troubleshooting Installation Issues

### Common Error: "Node.js not found"
**Solution**:
1. Restart Command Prompt after installing Node.js
2. Verify installation: `node --version`
3. If still failing, add Node.js to PATH manually:
   - Windows Settings → System → About → Advanced system settings
   - Environment Variables → System variables → PATH
   - Add: `C:\Program Files\nodejs\`

### Common Error: "Python not found"
**Solution**:
1. Reinstall Python with "Add to PATH" checked
2. Or manually add Python to PATH:
   - Add: `C:\Users\[YourUsername]\AppData\Local\Programs\Python\Python311\`
   - Add: `C:\Users\[YourUsername]\AppData\Local\Programs\Python\Python311\Scripts\`

### Common Error: "Build tools missing"
**Solution**:
1. Install Visual Studio Build Tools with C++ workload
2. Restart computer after installation
3. Try building again

### Common Error: "Permission denied"
**Solution**:
1. Run Command Prompt as Administrator
2. Ensure antivirus isn't blocking the installation
3. Check folder permissions for ViraPilot directory

### Common Error: "Network/Download issues"
**Solution**:
1. Check internet connection
2. Disable VPN if active
3. Configure corporate proxy if needed:
   ```cmd
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

### Application Won't Start
**Diagnosis Steps**:
1. Check if `ViraPilot.exe` exists in `electron\release\win-unpacked\`
2. Try running from Command Prompt to see error messages
3. Check Windows Event Viewer for application errors
4. Verify all dependencies are properly installed

## 🔄 Updating ViraPilot

### Automatic Updates
ViraPilot will check for updates on startup and notify you when available.

### Manual Updates
1. Download the latest version
2. Run `build-scripts\quick-install.bat` again
3. The installer will update existing installation
4. Your settings and API keys will be preserved

## 🗑️ Uninstalling ViraPilot

### Using Windows Settings
1. Windows Settings → Apps
2. Search for "ViraPilot"
3. Click → Uninstall

### Manual Uninstall
1. Delete installation folder (e.g., `C:\Program Files\ViraPilot`)
2. Delete desktop shortcut
3. Delete Start Menu folder: `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\ViraPilot`
4. Remove registry entry:
   - Run `regedit` as Administrator
   - Navigate to: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ViraPilot`
   - Delete the ViraPilot key

## 📞 Getting Help

### Built-in Help
- ViraPilot → Help Menu → Documentation
- Settings → Security → Export Configuration (for support)

### Online Resources
- GitHub Issues: Report bugs and request features
- Documentation: Comprehensive user guide
- Community: Discord server for user support

### Before Contacting Support
1. Check this installation guide
2. Verify system requirements
3. Try the troubleshooting steps
4. Export your configuration (Settings → Security → Export)
5. Note any error messages exactly as they appear

---

**📧 Support Contact**: Include your system information, error messages, and exported configuration when requesting help.