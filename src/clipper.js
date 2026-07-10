const fs = require('fs');
const path = require('path');
const whopClient = require('./whopClient');
const videoProcessor = require('./videoProcessor');
const logger = require('./logger');
const config = require('./config');

class Clipper {
  constructor() {
    this.outputDir = config.app.outputDir;
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      logger.info(`Created output directory: ${this.outputDir}`);
    }
  }

  /**
   * Main clipping workflow
   */
  async runClipping(options = {}) {
    try {
      logger.info('Starting clipping process');

      // Fetch clips from Whop
      const clips = await whopClient.getClips(options);

      if (clips.length === 0) {
        logger.info('No clips available to process');
        return { success: true, clipsProcessed: 0 };
      }

      logger.info(`Found ${clips.length} clips to process`);

      const processedClips = [];

      for (const clip of clips) {
        try {
          logger.info(`Processing clip: ${clip.id}`);

          // Download clip
          const clipBuffer = await whopClient.downloadClip(clip.id);
          const clipPath = path.join(this.outputDir, `clip_${clip.id}.mp4`);
          fs.writeFileSync(clipPath, clipBuffer);

          logger.info(`Downloaded clip: ${clipPath}`);

          // Get clip metadata
          const metadata = await whopClient.getClipMetadata(clip.id);

          // Store clip info
          processedClips.push({
            id: clip.id,
            path: clipPath,
            metadata: metadata,
            timestamp: new Date(),
          });

          logger.info(`Successfully processed clip: ${clip.id}`);
        } catch (error) {
          logger.error(`Error processing clip ${clip.id}`, { error: error.message });
          // Continue with next clip
        }
      }

      logger.info(`Clipping complete. Processed ${processedClips.length} clips`);

      return {
        success: true,
        clipsProcessed: processedClips.length,
        clips: processedClips,
      };
    } catch (error) {
      logger.error('Error in clipping process', { error: error.message });
      throw error;
    }
  }

  /**
   * Clip a specific segment from a video
   */
  async clipSegment(videoPath, startTime, duration, outputFileName) {
    try {
      const outputPath = path.join(this.outputDir, outputFileName);

      logger.info(`Creating clip segment: ${outputPath}`);

      await videoProcessor.trimVideo(videoPath, outputPath, startTime, duration);

      logger.info(`Clip segment created: ${outputPath}`);

      return outputPath;
    } catch (error) {
      logger.error('Error creating clip segment', { error: error.message });
      throw error;
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const clipper = new Clipper();
  clipper
    .runClipping()
    .then((result) => {
      logger.info('Clipping workflow completed', result);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Clipping workflow failed', { error });
      process.exit(1);
    });
}

module.exports = Clipper;