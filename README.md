# ViraPilot v2.0 - Advanced AI Pipeline Management System

<div align="center">
  <img src="./assets/virapilot-logo.png" alt="ViraPilot Logo" width="120" height="120">
  
  **Professional AI Pipeline Management System**
  
  [![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/virapilot/virapilot)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/virapilot/virapilot)
</div>

## 🚀 Features

- **🧠 Multi-AI Model Support**: OpenAI GPT-4, Claude, Gemini Pro, and more
- **⚡ Real-time Pipeline Monitoring**: Live system metrics and processing status
- **🔐 Local Settings Storage**: Secure API key management in browser storage
- **📊 Advanced Analytics**: Performance insights and optimization recommendations
- **💻 Desktop Application**: Standalone Electron app with no browser dependency
- **🎨 Modern UI**: Beautiful dark theme with gradient accents
- **🔧 Easy Configuration**: Intuitive settings panel for all configurations
- **📈 System Monitoring**: CPU, memory, storage, and network monitoring
- **🎯 AI Insights**: Smart recommendations for pipeline optimization

## 📦 Quick Installation

### Simple Installation (All Platforms)

**Windows:**
```bash
INSTALL.bat
```

**Mac/Linux:**
```bash
chmod +x INSTALL.sh
./INSTALL.sh
```

This will:
- ✅ Check for Node.js 18+
- ✅ Install all npm dependencies
- ✅ Build the application

### Prerequisites

Before installing, ensure you have:

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **FFmpeg** - Required for video processing
   - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`
3. **yt-dlp** - Required for video downloading
   - Windows: Download from [github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) and add to PATH
   - Mac: `brew install yt-dlp`
   - Linux: `pip install yt-dlp`

### Verify Installation

```bash
node --version    # Should be v18 or higher
ffmpeg -version
yt-dlp --version
```

## 🛠️ Manual Installation

### Prerequisites
- Windows 10/11 (64-bit)
- Administrator privileges
- Internet connection for dependency downloads

### Step-by-Step Guide

1. **Install Dependencies** (if not already installed):
   ```bash
   # Run the dependency installer
   build-scripts/install-dependencies.bat
   ```

2. **Build the Application**:
   ```bash
   # Build the complete application
   build-scripts/build.bat
   ```

3. **Launch ViraPilot**:
   ```bash
   # Start the desktop application
   electron/release/win-unpacked/ViraPilot.exe
   ```

## 🔧 Configuration

### API Keys Setup

ViraPilot requires API keys to function. See [SETUP.md](SETUP.md) for detailed instructions.

**Required APIs:**
1. **YouTube Data API v3** - For content discovery and upload
2. **OpenAI or Anthropic** - For AI content analysis
3. **TikTok API** (Optional) - For TikTok uploads

### First Time Setup

1. **Start the application**: `npm run dev`
2. **Navigate to Settings Tab** in the web interface
3. **Enter API Keys** in the Settings panel
4. **Configure Pipeline Settings**:
   - Fetch interval
   - Content region
   - AI scoring threshold
   - Upload preferences

### Data Storage

- **Supabase Database**: Content tracking, pipeline runs, analytics
- **Settings**: API keys stored securely in Supabase
- **Processed Videos**: Saved to `./processed_videos` directory

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10 (64-bit) or newer
- **RAM**: 4 GB RAM
- **Storage**: 2 GB free space
- **CPU**: Intel Core i3 or AMD equivalent
- **Network**: Internet connection for AI API calls

### Recommended Requirements
- **OS**: Windows 11 (64-bit)
- **RAM**: 8 GB RAM or more
- **Storage**: 5 GB free space
- **CPU**: Intel Core i5 or AMD Ryzen 5
- **Network**: High-speed internet connection

## 🎯 Usage

### Running the Application

**Development Mode:**
```bash
npm run dev
```
Access at: `http://localhost:5173`

**Production Mode:**
```bash
npm run build
npm run preview
```

### Starting Your First Pipeline

1. **Configure API Keys**: Go to Settings panel and add your API keys
2. **Configure Pipeline**: Set region, scoring threshold, and preferences
3. **Start Autopilot**: Click "Start Pipeline" to begin automated processing
4. **Monitor Progress**: View real-time updates in the dashboard
5. **Review Results**: Check processed content in Supabase dashboard

### Features

- **🔍 Content Discovery**: Automatically finds trending videos on YouTube
- **🧠 AI Scoring**: Analyzes viral potential using OpenAI/Claude
- **🎬 Video Processing**: Downloads and optimizes videos for platforms
- **📤 Auto Upload**: Uploads to YouTube Shorts and TikTok
- **📊 Analytics**: Tracks performance and ROI

## 🔐 Security Features

- **Local Storage**: All sensitive data stored locally
- **No Telemetry**: No data collection or tracking
- **Secure API Handling**: API keys encrypted in browser storage
- **Isolated Environment**: Electron sandbox for security

## 🚨 Troubleshooting

### Common Issues

**Installation Failed**:
- Ensure you're running as Administrator
- Check internet connection
- Disable antivirus temporarily during installation

**Application Won't Start**:
- Check if all dependencies are installed
- Run `build-scripts/install-dependencies.bat` again
- Check Windows Event Viewer for error details

**API Keys Not Working**:
- Verify API key format and validity
- Check internet connection
- Ensure API service is not rate-limited

### Getting Help

1. Check the built-in documentation (Help menu)
2. Review console logs (View → Toggle Developer Tools)
3. Export configuration for debugging (Settings → Security)

## 🔄 Updates

ViraPilot checks for updates automatically. You can also:
- Download the latest version manually
- Run the installer again to update
- Backup your configuration before updating

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **Documentation**: Built-in help system (Help → Documentation)
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord community

---

<div align="center">
  <strong>ViraPilot v2.0 - Making AI Pipeline Management Simple and Powerful</strong>
  
  Made with ❤️ for AI developers and enthusiasts
</div>
