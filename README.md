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

### One-command setup (recommended)

1. Install [Node.js 20 LTS](https://nodejs.org/) if you haven't already.
2. From the project folder, run the automated setup assistant:

   ```bash
   npm run setup
   ```

   The script verifies your Node.js version, installs dependencies, offers to install the optional Electron tooling, and can start the Vite dev server for you.

   > **Tip:** For unattended environments use `npm run setup -- --yes --skip-dev` to accept the defaults, skip interactive prompts, and prevent the dev server from launching automatically.

When the setup finishes (or you start the dev server yourself), ViraPilot is available at [http://localhost:5173/](http://localhost:5173/) with live hot-reloading.

### Manual installation (advanced)

If you prefer to run each step yourself:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### Packaging the desktop app (optional)

1. Build the web assets as shown above (`npm run build`).
2. Install the Electron dependencies and run the desired packaging target:

   ```bash
   cd electron
   npm install
   # Choose the platform-specific build:
   npm run build:win   # Windows
   npm run build:mac   # macOS
   npm run build:linux # Linux
   ```

3. The packaged binaries are placed in `electron/release/`.

### Building the production bundle

```bash
# Generate the optimized frontend assets
npm run build

# (Optional) Preview the production build locally
npm run preview

# Run the code quality checks
npm run lint
```

### Windows one-click installer (optional)

For automated Windows installations you can still use the legacy helper scripts located in `build-scripts/`:

- `quick-install.bat` – installs prerequisites, builds the app, and creates shortcuts.
- `install-dependencies.bat` – installs Node.js, Git, Python, and the Visual Studio Build Tools.
- `build.bat` – builds the frontend and packages the Electron desktop app.

These scripts must be executed from an elevated PowerShell or Command Prompt.

## 🔧 Configuration

### First Time Setup

1. **Launch ViraPilot** from desktop shortcut
2. **Navigate to Settings Tab**
3. **Enter API Keys**:
   - OpenAI API Key
   - Anthropic API Key (for Claude)
   - Google AI API Key (for Gemini)
   - Azure OpenAI credentials

### Local Storage
- All settings are stored locally in browser storage
- No data is transmitted to external servers (except AI service APIs)
- Export/import configuration for backup

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

### Starting Your First Pipeline

1. **Configure API Keys**: Go to Settings → API Keys tab
2. **Select AI Model**: Choose from GPT-4, Claude, Gemini Pro, etc.
3. **Input Data**: Enter your prompt or data in the Pipeline tab
4. **Start Processing**: Click "Start Pipeline" button
5. **Monitor Progress**: Watch real-time progress in the Overview tab

### Dashboard Tabs

- **📊 Overview**: System status and pipeline monitoring
- **⚡ Pipeline**: Configure and manage AI processing jobs
- **🧠 AI Insights**: Performance analytics and recommendations
- **💻 Monitor**: Detailed system resource monitoring  
- **⚙️ Settings**: API keys, preferences, and configuration

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
