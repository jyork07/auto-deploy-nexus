# ViraPilot - Quick Start Guide

## Installation (5 minutes)

### 1. Prerequisites Check

Open terminal/command prompt and verify:

```bash
node --version    # Need v18 or higher
ffmpeg -version   # Need for video processing
yt-dlp --version  # Need for video downloading
```

If missing, install from:
- Node.js: https://nodejs.org/
- FFmpeg: https://ffmpeg.org/download.html
- yt-dlp: https://github.com/yt-dlp/yt-dlp/releases

### 2. Run Installer

**Windows:**
```bash
INSTALL.bat
```

**Mac/Linux:**
```bash
./INSTALL.sh
```

This takes 2-3 minutes and installs all dependencies.

## API Keys Setup (10 minutes)

### YouTube API Key (Required)

1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the key

### OpenAI API Key (Required)

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

**OR use Anthropic Claude:**

1. Go to: https://console.anthropic.com/
2. Create API key
3. Copy the key

### TikTok API (Optional)

Only needed if you want to upload to TikTok:
1. Apply at: https://developers.tiktok.com/
2. Create app and get credentials

## First Run (2 minutes)

### 1. Start the Application

```bash
npm run dev
```

Open browser to: `http://localhost:5173`

### 2. Configure Settings

1. Click "Settings" tab
2. Add API Keys:
   - YouTube API Key
   - OpenAI or Anthropic API Key
3. Click "Save Settings"

### 3. Configure Pipeline

Set these in Settings panel:

- **Region**: US (or your target region)
- **Fetch Interval**: 60 minutes
- **Top K Clips**: 5 (process top 5 videos per cycle)
- **Retention Threshold**: 70 (minimum AI score)
- **Shorts Only**: Yes (only process short videos)

## Run Your First Pipeline (Automated)

### Start Autopilot Mode

1. Go to "Pipeline" tab
2. Click "Start Autopilot"
3. Watch the magic happen!

### What Happens:

1. **Discovery** - Fetches trending videos from YouTube
2. **AI Scoring** - Analyzes each video for viral potential
3. **Processing** - Downloads and optimizes top videos
4. **Upload** - Uploads to configured platforms (if enabled)

### Monitor Progress

- Real-time updates in Dashboard
- Check Supabase dashboard for database records
- Processed videos saved to `./processed_videos`

## Manual Mode

Want more control? Use manual mode:

1. **Search Videos**: Enter YouTube URL or search query
2. **Analyze**: Get AI score and recommendations
3. **Process**: Download and optimize specific videos
4. **Upload**: Manually upload to platforms

## Tips for Success

### API Rate Limits

- **YouTube**: 10,000 units/day (free tier)
- **OpenAI**: Depends on your plan
- Start with small batches to test

### Video Processing

- First run takes longer (downloading videos)
- Subsequent runs are faster
- Close other apps to free up memory

### Best Practices

1. **Start Small**: Begin with `Top K Clips: 3`
2. **Test Settings**: Run one cycle before leaving it automated
3. **Check Logs**: Monitor console for any errors
4. **Backup Config**: Export settings after configuration

## Troubleshooting

### "API Key Invalid"

- Double-check the key is correct
- Ensure no extra spaces
- Verify API is enabled in provider console

### "FFmpeg Not Found"

- Install FFmpeg and add to system PATH
- Restart terminal after installation
- Windows: May need to restart computer

### "Video Download Failed"

- Check video is accessible
- Some videos may be geo-restricted
- Try a different video URL

### "Out of Memory"

- Reduce `Max Concurrent Jobs` to 1 or 2
- Close other applications
- Process fewer videos per cycle

## Next Steps

Once your first pipeline runs successfully:

1. **Enable Uploaders**: Configure YouTube/TikTok upload
2. **Adjust Thresholds**: Fine-tune AI scoring threshold
3. **Schedule Runs**: Set appropriate fetch interval
4. **Monitor Analytics**: Track performance in dashboard
5. **Optimize Settings**: Adjust based on results

## Need Help?

- Check [SETUP.md](SETUP.md) for detailed documentation
- Review console logs (F12 in browser)
- Check Supabase dashboard for data
- Ensure all prerequisites are installed

## Security Note

- API keys stored securely in Supabase
- Never share your API keys
- Use separate keys for testing/production
- Regularly rotate sensitive credentials

---

**That's it! You're ready to start automating viral content discovery and processing.**
