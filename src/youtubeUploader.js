const { google } = require('googleapis');
const fs = require('fs');
const logger = require('./logger');
const config = require('./config');

class YouTubeUploader {
  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.getAuth(),
    });
  }

  getAuth() {
    const oauth2Client = new google.auth.OAuth2(
      config.youtube.clientId,
      config.youtube.clientSecret,
      'http://localhost:3000/oauth2callback'
    );

    oauth2Client.setCredentials({
      refresh_token: config.youtube.refreshToken,
    });

    return oauth2Client;
  }

  /**
   * Upload video to YouTube
   * @param {string} filePath - Path to video file
   * @param {Object} metadata - Video metadata (title, description, tags, etc.)
   * @returns {Promise<Object>} Upload response
   */
  async uploadVideo(filePath, metadata = {}) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      logger.info(`Uploading video to YouTube: ${filePath}`);

      const response = await this.youtube.videos.insert(
        {
          part: 'snippet,status',
          requestBody: {
            snippet: {
              title: metadata.title || 'Untitled Clip',
              description: metadata.description || '',
              tags: metadata.tags || ['whop', 'clip', 'automated'],
              categoryId: '24', // Entertainment
            },
            status: {
              privacyStatus: metadata.privacyStatus || 'private',
            },
          },
          media: {
            body: fs.createReadStream(filePath),
          },
        },
        {
          onUploadProgress: (evt) => {
            const progress = Math.round((evt.bytesRead / fs.statSync(filePath).size) * 100);
            logger.info(`Upload progress: ${progress}%`);
          },
        }
      );

      logger.info(`Video uploaded successfully to YouTube: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Error uploading video to YouTube', { error: error.message });
      throw error;
    }
  }

  /**
   * Get video status
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Object>} Video status
   */
  async getVideoStatus(videoId) {
    try {
      const response = await this.youtube.videos.list({
        part: 'status',
        id: videoId,
      });

      return response.data.items[0]?.status;
    } catch (error) {
      logger.error(`Error getting video status for ${videoId}`, { error: error.message });
      throw error;
    }
  }
}

module.exports = new YouTubeUploader();