# ViraPilot v2.0 - Complete Setup Guide

## Prerequisites

### Required Software

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **FFmpeg** - Required for video processing
   - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`
3. **yt-dlp** - Required for video downloading
   - Windows: Download from [github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) and add to PATH
   - Mac: `brew install yt-dlp`
   - Linux: `sudo apt install yt-dlp`

### Verify Installation

```bash
node --version    # Should be v18 or higher
npm --version
ffmpeg -version
yt-dlp --version
```

## Installation Steps

### 1. Clone or Extract Project

```bash
cd /path/to/virapilot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The project uses Supabase for data persistence. Environment variables are already configured in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## API Keys Setup

ViraPilot requires several API keys to function. Set them up through the Settings panel in the app.

### 1. YouTube Data API v3

**Required for:** Content discovery and upload

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key

**For Upload Functionality (Optional):**
1. Create OAuth 2.0 Client ID
2. Download credentials JSON
3. Run OAuth flow to get refresh token

### 2. OpenAI API Key

**Required for:** AI content analysis

1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy the key (starts with `sk-`)

**Alternative: Anthropic Claude**
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create API key
3. Use instead of OpenAI

### 3. TikTok API (Optional)

**Required for:** TikTok uploads

1. Apply for TikTok Developer access at [developers.tiktok.com](https://developers.tiktok.com/)
2. Create an app
3. Get App ID, App Secret, and Access Token

## Running the Application

### Development Mode

```bash
npm run dev
```

Access at: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Electron Desktop App

```bash
cd electron
npm install
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Configuration

### Pipeline Settings

Configure through the Settings panel:

- **Fetch Interval**: How often to check for new content (minutes)
- **Top K Clips**: Number of best clips to process per cycle
- **Retention Threshold**: Minimum AI score (0-100) to process
- **Region**: YouTube region code (US, GB, etc.)
- **Shorts Only**: Only process short-form content (< 60s)
- **Max Concurrent Jobs**: Parallel video processing limit

### Output Directory

Processed videos are saved to `./processed_videos` by default.

## Features

### Automated Pipeline

1. **Content Discovery**: Fetches trending videos from YouTube
2. **AI Scoring**: Analyzes viral potential using OpenAI/Claude
3. **Video Processing**: Downloads and optimizes for platforms
4. **Multi-Platform Upload**: Uploads to YouTube Shorts, TikTok

### Manual Mode

- Search and analyze specific videos
- Process individual clips
- Generate metadata variants
- Export content without uploading

## Troubleshooting

### FFmpeg not found

**Error**: `FFmpeg/avconv not found`

**Solution**:
- Windows: Add FFmpeg to System PATH
- Mac/Linux: Install via package manager

### yt-dlp download fails

**Error**: `Unable to download video`

**Solution**:
- Update yt-dlp: `yt-dlp -U`
- Check video URL is accessible
- Some videos may be geo-restricted

### API Rate Limits

**YouTube**: 10,000 units/day (default quota)
- Increase quota in Google Cloud Console

**OpenAI**: Depends on your plan
- Monitor usage at platform.openai.com

### Memory Issues

For large video processing:
- Reduce `maxConcurrentJobs` in settings
- Close other applications
- Increase Node.js memory: `export NODE_OPTIONS="--max-old-space-size=4096"`

## Database Management

The app uses Supabase for:
- Content item tracking
- Pipeline run history
- API key storage (encrypted)
- Settings persistence

Access Supabase dashboard to:
- View processed content
- Check pipeline statistics
- Export data

## Security Notes

- API keys are stored encrypted in Supabase
- Never commit `.env` file to version control
- Refresh tokens should be rotated regularly
- Use separate API keys for development/production

## Support

For issues or questions:
- Check logs in browser console (F12)
- Review Supabase logs for database issues
- Ensure all prerequisites are installed
- Verify API keys are valid and have correct permissions

## Advanced Configuration

### Custom Video Processing

Edit `src/services/VideoProcessorReal.ts` to customize:
- Video quality settings
- Audio normalization levels
- Aspect ratio handling
- Subtitle generation

### Custom AI Prompts

Edit `src/services/AIService.ts` to modify:
- Scoring criteria
- Metadata generation
- Analysis parameters

## License

See LICENSE file for details.
