const axios = require('axios');
const logger = require('./logger');
const config = require('./config');

class WhopClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.whop.baseUrl,
      headers: {
        Authorization: `Bearer ${config.whop.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch clips from Whop API
   * @param {Object} options - Query options (limit, offset, etc.)
   * @returns {Promise<Array>} Array of clips
   */
  async getClips(options = {}) {
    try {
      const limit = options.limit || config.app.clipsPerRun;
      const offset = options.offset || 0;

      logger.info(`Fetching clips from Whop API (limit: ${limit}, offset: ${offset})`);

      const response = await this.client.get('/clips', {
        params: {
          limit,
          offset,
          ...options,
        },
      });

      logger.info(`Successfully fetched ${response.data.clips.length} clips`);
      return response.data.clips;
    } catch (error) {
      logger.error('Error fetching clips from Whop API', { error: error.message });
      throw error;
    }
  }

  /**
   * Download a clip from Whop
   * @param {string} clipId - The clip ID
   * @returns {Promise<Buffer>} Video buffer
   */
  async downloadClip(clipId) {
    try {
      logger.info(`Downloading clip: ${clipId}`);

      const response = await this.client.get(`/clips/${clipId}/download`, {
        responseType: 'arraybuffer',
      });

      logger.info(`Successfully downloaded clip: ${clipId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error downloading clip ${clipId}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Get clip metadata
   * @param {string} clipId - The clip ID
   * @returns {Promise<Object>} Clip metadata
   */
  async getClipMetadata(clipId) {
    try {
      const response = await this.client.get(`/clips/${clipId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching metadata for clip ${clipId}`, {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new WhopClient();