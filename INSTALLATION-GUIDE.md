# ViraPilot v2.0 - Installation Guide

## 🚀 Quick Start (Double-Click Installation)

### For Windows Users (Recommended)

1. **Download the Project**: Extract all files to a folder (e.g., `C:\ViraPilot`)

2. **Run the Installer**: Double-click `build-scripts\quick-install.bat`

3. **Follow Prompts**: The installer will:
   - Request administrator privileges (required)
   - Install Node.js, Git, Python, and Visual Studio Build Tools
   - Build the React frontend application
   - Package the Electron desktop application
   - Create desktop and start menu shortcuts
   - Register the application with Windows

4. **Launch ViraPilot**: Double-click the desktop shortcut created

⚡ **Total installation time**: 10-15 minutes (depending on internet speed)

## 🛠️ What Gets Installed

### System Dependencies
- **Node.js v20.10.0**: JavaScript runtime for building the application
- **Git**: Version control system (required for some npm packages)
- **Python 3.11.6**: Required for native module compilation
- **Visual Studio Build Tools**: C++ compiler for native modules

### Application Components
- **React Frontend**: Modern web-based dashboard interface
- **Electron Desktop App**: Standalone Windows application
- **Local Storage System**: Secure settings and API key management
- **Pipeline Engine**: AI processing and monitoring system

## 📋 System Requirements Check

Before installation, ensure your system meets these requirements:

### ✅ Minimum Requirements
- Windows 10 (64-bit) Build 1903 or newer
- 4 GB RAM (8 GB recommended)
- 2 GB free disk space (5 GB recommended)
- Internet connection for installation and API calls
- Administrator privileges

### 🔍 How to Check Your System

1. **Windows Version**:
   - Press `Win + R`, type `winver`, press Enter
   - Should show Windows 10 Build 1903+ or Windows 11

2. **RAM**:
   - Press `Ctrl + Shift + Esc` to open Task Manager
   - Go to "Performance" tab → "Memory"
   - Check total physical memory

3. **Disk Space**:
   - Open File Explorer
   - Right-click on C: drive → Properties
   - Check available free space

4. **Administrator Rights**:
   - Right-click on any .bat file
   - You should see "Run as administrator" option

## 🔧 Manual Installation (Advanced Users)

If the automatic installer fails or you prefer manual control:

### Step 1: Install Dependencies Manually

1. **Node.js**:
   - Download from: https://nodejs.org/en/download/
   - Install the LTS version (20.10.0 or newer)
   - Verify: Open Command Prompt, run `node --version`

2. **Git**:
   - Download from: https://git-scm.com/download/win
   - Install with default settings
   - Verify: Run `git --version` in Command Prompt

3. **Python**:
   - Download from: https://www.python.org/downloads/
   - Install Python 3.11.6 or newer
   - ⚠️ **Important**: Check "Add Python to PATH" during installation
   - Verify: Run `python --version` in Command Prompt

4. **Visual Studio Build Tools**:
   - Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - Install with "C++ build tools" workload
   - This enables compilation of native Node.js modules

### Step 2: Build the Application

1. **Open Command Prompt as Administrator**:
   - Press `Win + X` → "Windows PowerShell (Admin)" or "Command Prompt (Admin)"

2. **Navigate to ViraPilot folder**:
   ```cmd
   cd "C:\path\to\ViraPilot"
   ```

3. **Install main dependencies**:
   ```cmd
   npm install
   ```

4. **Build React application**:
   ```cmd
   npm run build
   ```

5. **Install Electron dependencies**:
   ```cmd
   cd electron
   npm install
   ```

6. **Build Electron application**:
   ```cmd
   npm run build:win
   ```

7. **Return to main directory**:
   ```cmd
   cd ..
   ```

### Step 3: Create Shortcuts (Manual)

1. **Desktop Shortcut**:
   - Right-click on Desktop → New → Shortcut
   - Target: `C:\path\to\ViraPilot\electron\release\win-unpacked\ViraPilot.exe`
   - Name: "ViraPilot"

2. **Start Menu**:
   - Create folder: `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\ViraPilot`
   - Copy the shortcut there

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