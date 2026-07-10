const fs = require('fs');
const path = require('path');
const youtubeUploader = require('./youtubeUploader');
const instagramUploader = require('./instagramUploader');
const logger = require('./logger');
const config = require('./config');
const videoProcessor = require('./videoProcessor');

class Uploader {
  constructor() {
    this.outputDir = config.app.outputDir;
    this.uploadDir = path.join(this.outputDir, 'uploaded');
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      logger.info(`Created upload tracking directory: ${this.uploadDir}`);
    }
  }

  /**
   * Main upload workflow
   */
  async runUpload(options = {}) {
    try {
      if (!config.app.uploadEnabled) {
        logger.info('Uploads are disabled in configuration');
        return { success: false, message: 'Uploads disabled' };
      }

      logger.info('Starting upload process');

      // Get unprocessed clips
      const clipsToUpload = this.getUnprocessedClips();

      if (clipsToUpload.length === 0) {
        logger.info('No clips available to upload');
        return { success: true, clipsUploaded: 0 };
      }

      logger.info(`Found ${clipsToUpload.length} clips to upload`);

      const uploadResults = [];

      for (const clipPath of clipsToUpload) {
        try {
          logger.info(`Processing clip for upload: ${clipPath}`);

          const fileName = path.basename(clipPath);
          const metadata = {
            title: `Whop Clip - ${Date.now()}`,
            description: 'Automated clip from Whop content',
            tags: ['whop', 'automated', 'clip'],
          };

          // Upload to YouTube
          if (options.platforms?.includes('youtube') || !options.platforms) {
            try {
              logger.info(`Uploading to YouTube: ${fileName}`);
              const ytResponse = await youtubeUploader.uploadVideo(clipPath, metadata);
              uploadResults.push({
                platform: 'youtube',
                clip: fileName,
                videoId: ytResponse.id,
                success: true,
              });
              logger.info(`YouTube upload successful: ${ytResponse.id}`);
            } catch (error) {
              logger.error(`YouTube upload failed for ${fileName}`, { error: error.message });
              uploadResults.push({
                platform: 'youtube',
                clip: fileName,
                success: false,
                error: error.message,
              });
            }
          }

          // Upload to Instagram
          if (options.platforms?.includes('instagram') || !options.platforms) {
            try {
              logger.info(`Processing for Instagram: ${fileName}`);

              // Process video for Instagram (vertical format)
              const instagramOutputPath = path.join(
                this.outputDir,
                `instagram_${path.basename(clipPath)}`
              );
              await videoProcessor.processForInstagram(clipPath, instagramOutputPath);

              logger.info(`Uploading to Instagram: ${fileName}`);
              const igResponse = await instagramUploader.uploadReel(
                instagramOutputPath,
                metadata
              );

              uploadResults.push({
                platform: 'instagram',
                clip: fileName,
                videoId: igResponse.videoId,
                success: true,
              });
              logger.info(`Instagram upload successful: ${igResponse.videoId}`);
            } catch (error) {
              logger.error(`Instagram upload failed for ${fileName}`, { error: error.message });
              uploadResults.push({
                platform: 'instagram',
                clip: fileName,
                success: false,
                error: error.message,
              });
            }
          }

          // Mark clip as uploaded
          this.markAsUploaded(clipPath);
        } catch (error) {
          logger.error(`Error processing clip for upload: ${clipPath}`, {
            error: error.message,
          });
        }
      }

      logger.info(
        `Upload complete. Uploaded ${uploadResults.filter((r) => r.success).length}/${uploadResults.length} clips`
      );

      return {
        success: true,
        clipsUploaded: uploadResults.filter((r) => r.success).length,
        results: uploadResults,
      };
    } catch (error) {
      logger.error('Error in upload process', { error: error.message });
      throw error;
    }
  }

  /**
   * Get unprocessed clips from output directory
   */
  getUnprocessedClips() {
    try {
      const files = fs.readdirSync(this.outputDir);
      return files
        .filter((file) => file.endsWith('.mp4') && !file.startsWith('instagram_'))
        .map((file) => path.join(this.outputDir, file));
    } catch (error) {
      logger.error('Error getting unprocessed clips', { error: error.message });
      return [];
    }
  }

  /**
   * Mark clip as uploaded
   */
  markAsUploaded(clipPath) {
    try {
      const fileName = path.basename(clipPath);
      const markerFile = path.join(this.uploadDir, `${fileName}.uploaded`);
      fs.writeFileSync(markerFile, JSON.stringify({ uploadedAt: new Date() }));
      logger.info(`Marked clip as uploaded: ${fileName}`);
    } catch (error) {
      logger.error('Error marking clip as uploaded', { error: error.message });
    }
  }

  /**
   * Check if clip was already uploaded
   */
  wasUploaded(clipPath) {
    try {
      const fileName = path.basename(clipPath);
      const markerFile = path.join(this.uploadDir, `${fileName}.uploaded`);
      return fs.existsSync(markerFile);
    } catch (error) {
      return false;
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const uploader = new Uploader();
  uploader
    .runUpload()
    .then((result) => {
      logger.info('Upload workflow completed', result);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Upload workflow failed', { error });
      process.exit(1);
    });
}

module.exports = Uploader;