# Whop Clipping Automation

Automated system for clipping Whop content and uploading to YouTube and Instagram.

## Features

✨ **Automated Clipping**
- Fetch clips from Whop API
- Download and process clips
- Store metadata and organize files

🎬 **Auto-Upload**
- Upload to YouTube with metadata
- Upload to Instagram Reels (vertical format)
- Automatic quality optimization

⏰ **Scheduled Automation**
- Run clipping jobs on a schedule
- Run uploads on a schedule
- Manual trigger options

## Installation

### Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
  - **Linux**: `sudo apt-get install ffmpeg`
  - **Mac**: `brew install ffmpeg`
  - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ayeshahuriya45-alt/whop-clipping.git
cd whop-clipping
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your credentials:
```env
WHOP_API_KEY=your_whop_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
INSTAGRAM_USERNAME=your_instagram_username
INSTAGRAM_PASSWORD=your_instagram_password
```

## Usage

### Manual Clipping

Download and process clips from Whop:

```bash
npm run clip
```

### Manual Upload

Upload processed clips to YouTube and Instagram:

```bash
npm run upload
```

### Automated Scheduling

Start the scheduler to run clipping and uploads automatically:

```bash
npm start
```

The default schedule:
- **Clipping**: Every 6 hours (cron: `0 */6 * * *`)
- **Upload**: Every 12 hours (cron: `0 */12 * * *`)

## Configuration

Edit `src/scheduler.js` to customize the schedule:

```javascript
// Run clipping every 6 hours
scheduler.scheduleClipping('0 */6 * * *');

// Run uploads every 12 hours
scheduler.scheduleUpload('0 */12 * * *');
```

### Cron Expression Examples

- `0 9 * * *` - Every day at 9 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Every Sunday at midnight
- `*/30 * * * *` - Every 30 minutes

## Project Structure

```
whop-clipping/
├── src/
│   ├── index.js              # Main entry point
│   ├── config.js             # Configuration loader
│   ├── logger.js             # Logging utility
│   ├── whopClient.js         # Whop API client
│   ├── youtubeUploader.js    # YouTube upload logic
│   ├── instagramUploader.js  # Instagram upload logic
│   ├── videoProcessor.js     # Video processing (FFmpeg)
│   ├── clipper.js            # Clipping workflow
│   ├── uploader.js           # Upload workflow
│   └── scheduler.js          # Job scheduling
├── clips/                    # Downloaded clips directory
├── .env.example              # Environment template
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

## API Keys & Credentials

### Whop API

1. Go to [Whop Dashboard](https://www.whop.com)
2. Navigate to API settings
3. Generate API key
4. Add to `.env` as `WHOP_API_KEY`

### YouTube API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials (Desktop application)
5. Download JSON and extract credentials
6. Add to `.env`:
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REFRESH_TOKEN`

### Instagram

1. Create Instagram Business Account
2. Get access token from [Meta Developers](https://developers.facebook.com)
3. Add to `.env`:
   - `INSTAGRAM_USERNAME`
   - `INSTAGRAM_PASSWORD`
   - `INSTAGRAM_BUSINESS_ACCOUNT_ID`

## Logs

Application logs are stored in:
- `error.log` - Error messages
- `combined.log` - All log messages
- Console output - Real-time logs (development mode)

## Troubleshooting

### FFmpeg not found
Make sure FFmpeg is installed and accessible from your PATH.

### API Authentication Failed
Check that your API keys and credentials in `.env` are correct and have proper permissions.

### Upload Fails
- Verify video format compatibility
- Check file size limits for platforms
- Ensure sufficient storage space

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue.

---

**Last Updated**: 2024