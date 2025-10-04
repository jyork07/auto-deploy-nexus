# ViraPilot v2.0 - Local Installation Guide

## Complete Offline Installation for Windows

ViraPilot v2.0 is designed to run completely locally on your Windows machine with no cloud dependencies. All data, settings, and API keys are stored locally on your system.

---

## 🎯 Quick Start

### One-Click Installation

```batch
# Run the automated installer
.\build-scripts\local-installer.bat
```

This will:
1. ✅ Check all system dependencies (Node.js, Python, Git, FFmpeg)
2. ✅ Install workspace dependencies
3. ✅ Build the web application
4. ✅ Build the Electron desktop app
5. ✅ Create local configuration directory
6. ✅ Generate installer package

---

## 📋 System Requirements

### Required Software

- **Windows 10/11** (64-bit)
- **Node.js 18+** - JavaScript runtime
- **Python 3.8+** - For video processing scripts
- **Git** - Version control (for dependencies)
- **FFmpeg** - Video/audio processing

### Hardware Requirements

- **CPU**: Intel Core i5 or AMD Ryzen 5 (recommended)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space minimum
- **GPU**: Optional (speeds up video processing)

---

## 🔧 Manual Installation

### Step 1: Install Dependencies

If the automated installer fails, install dependencies manually:

#### Node.js
```
Download from: https://nodejs.org/
Version: 20.10.0 LTS or later
During install: ✅ Add to PATH
```

#### Python
```
Download from: https://python.org/
Version: 3.11.6 or later
During install: ✅ Add to PATH
                ✅ Install pip
```

#### Git
```
Download from: https://git-scm.com/download/win
Version: 2.42.0 or later
During install: Use default settings
```

#### FFmpeg
```
Download from: https://ffmpeg.org/download.html
Extract to: C:\ffmpeg
Add to PATH: C:\ffmpeg\bin
```

### Step 2: Build the Application

```batch
# Navigate to project root
cd path\to\virapilot

# Install workspace dependencies
npm install --no-audit --no-fund

# Build web application
npm run build

# Install Electron dependencies
cd electron
npm install --no-audit --no-fund

# Build Electron app
npm run build:win

# Return to root
cd ..
```

### Step 3: Install the Application

```batch
# Run the installer
.\electron\release\ViraPilot Setup 2.0.0.exe
```

---

## 🔐 Local Storage & Configuration

### Configuration Directory

All settings and data are stored locally at:
```
%USERPROFILE%\.virapilot\
```

Example:
```
C:\Users\YourName\.virapilot\
├── settings.json       # Application settings
├── api-keys.json       # API keys (stored locally)
├── analytics.json      # Analytics data
└── content-queue.json  # Processing queue
```

### API Keys Storage

API keys are **never sent to any cloud service**. They are stored locally in:
```
%USERPROFILE%\.virapilot\api-keys.json
```

Format:
```json
{
  "openai": "sk-...",
  "anthropic": "sk-ant-...",
  "googleai": "AIza...",
  "youtube": "AIza...",
  "tiktok": "...",
  "tavily": "tvly-..."
}
```

**Security Note**: This file contains sensitive information. Keep it secure and never share it.

---

## 🚀 First Launch

### 1. Start the Application

After installation, launch ViraPilot from:
- Start Menu → ViraPilot
- Desktop shortcut
- Or run: `%LOCALAPPDATA%\Programs\virapilot\ViraPilot.exe`

### 2. Configure API Keys

Navigate to **Settings → API Keys** and enter your API keys:

- **OpenAI** (Required) - For AI processing
  - Get from: https://platform.openai.com/api-keys
  - Format: `sk-...`

- **Google AI** (Optional) - Alternative AI provider
  - Get from: https://makersuite.google.com/app/apikey
  - Format: `AIza...`

- **YouTube Data API** (Required for YouTube upload)
  - Get from: https://console.cloud.google.com/
  - Format: `AIza...`

- **TikTok API** (Required for TikTok upload)
  - Get from: https://developers.tiktok.com/
  - Format: 32+ character string

- **Tavily Search** (Optional for experiments)
  - Get from: https://tavily.com/
  - Format: `tvly-...`

### 3. Configure Settings

Navigate to **Settings → General**:

- Enable/disable features
- Set autopilot parameters
- Configure upload preferences
- Adjust performance settings

### 4. Verify Installation

Navigate to **Monitor** tab to verify:

- ✅ All API keys valid
- ✅ FFmpeg installed
- ✅ Sufficient disk space
- ✅ API quotas available

---

## 🎬 Using ViraPilot

### Content Discovery

1. Navigate to **Discovery** tab
2. Click "Fetch Trending Videos"
3. Filter by category, region, duration
4. Select videos for processing

### Autopilot Mode

1. Navigate to **Autopilot** tab
2. Configure:
   - Fetch interval
   - Content filters
   - Upload settings
3. Click "Start Autopilot"
4. Monitor progress in real-time

### Manual Processing

1. Navigate to **Pipeline** tab
2. Add videos to queue
3. Configure editing parameters
4. Click "Process Queue"
5. Review and publish

### Analytics

1. Navigate to **Analytics** tab
2. View performance metrics
3. Track revenue estimates
4. Export reports

---

## 🔧 Troubleshooting

### FFmpeg Not Found

```batch
# Check FFmpeg installation
ffmpeg -version

# If not found, add to PATH:
# 1. Open System Properties → Environment Variables
# 2. Edit Path variable
# 3. Add: C:\ffmpeg\bin
# 4. Restart terminal
```

### Python Not Found

```batch
# Check Python installation
python --version

# If not found, reinstall Python with:
# ✅ Add to PATH option checked
```

### Build Errors

```batch
# Clear node_modules and rebuild
rm -rf node_modules
npm install

# Clear Electron cache
cd electron
rm -rf node_modules
npm install
```

### API Key Issues

If API keys aren't saving:

1. Check file permissions on `%USERPROFILE%\.virapilot\`
2. Verify antivirus isn't blocking file writes
3. Manually edit `api-keys.json` if needed

### Video Processing Fails

1. Verify FFmpeg is installed and in PATH
2. Check disk space (needs ~5GB free)
3. Ensure videos are accessible
4. Check console logs for errors

---

## 📦 Backup & Restore

### Export Configuration

1. Navigate to **Settings → Security**
2. Click "Export Configuration"
3. Save to secure location
4. Backup file: `virapilot-config.json`

### Import Configuration

1. Navigate to **Settings → Security**
2. Click "Import Configuration"
3. Select backup file
4. Confirm import

---

## 🔄 Updates

### Check for Updates

ViraPilot will notify you when updates are available.

### Manual Update

```batch
# Download latest release
# Extract to project directory
# Run installer again
.\build-scripts\local-installer.bat
```

---

## 🗑️ Uninstall

### Remove Application

1. Windows Settings → Apps → ViraPilot → Uninstall

### Remove Configuration

```batch
# Delete config directory
rmdir /s /q "%USERPROFILE%\.virapilot"
```

---

## 🆘 Support

### Documentation

- Installation Guide: `INSTALLATION-GUIDE.md`
- Project Blueprint: See project documentation
- Build Scripts: `build-scripts/`

### Logs

Application logs are stored at:
```
%USERPROFILE%\.virapilot\logs\
```

### Common Issues

- **Build fails**: Ensure all dependencies installed
- **API errors**: Verify API keys in Settings
- **Video processing slow**: Check FFmpeg GPU acceleration
- **Upload fails**: Verify OAuth tokens and API quotas

---

## ⚙️ Advanced Configuration

### Environment Variables

ViraPilot does not use .env files. All configuration is stored locally in JSON format.

### Custom FFmpeg Path

If FFmpeg is not in PATH, configure in Settings:

```json
{
  "ffmpeg_path": "C:\\custom\\path\\to\\ffmpeg.exe"
}
```

### Custom Config Directory

Change config directory (advanced):

```batch
set VIRAPILOT_CONFIG_DIR=D:\MyConfig
```

---

## 🔒 Privacy & Security

### What Stays Local

- ✅ All settings and preferences
- ✅ API keys
- ✅ Processing queue
- ✅ Analytics data
- ✅ Downloaded videos
- ✅ Processed content

### What Requires Internet

- ❌ API calls to AI services (OpenAI, Google, etc.)
- ❌ YouTube/TikTok uploads
- ❌ Trending video discovery
- ❌ Content downloads

**ViraPilot never sends your API keys or local data to any third-party service except the APIs you explicitly configure.**

---

## 📄 License

ViraPilot v2.0
Copyright © 2025

---

**Enjoy complete local control of your content pipeline!** 🚀
