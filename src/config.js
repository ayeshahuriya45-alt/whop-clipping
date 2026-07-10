require('dotenv').config();

module.exports = {
  whop: {
    apiKey: process.env.WHOP_API_KEY,
    baseUrl: process.env.WHOP_API_BASE_URL || 'https://api.whop.com/v1',
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
  },
  instagram: {
    username: process.env.INSTAGRAM_USERNAME,
    password: process.env.INSTAGRAM_PASSWORD,
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
  },
  app: {
    outputDir: process.env.OUTPUT_DIR || './clips',
    clipsPerRun: parseInt(process.env.CLIPS_PER_RUN) || 5,
    uploadEnabled: process.env.UPLOAD_ENABLED === 'true',
    debugMode: process.env.DEBUG_MODE === 'true',
  },
};