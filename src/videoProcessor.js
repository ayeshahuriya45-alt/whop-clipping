const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('./config');

class VideoProcessor {
  constructor() {
    // Make sure ffmpeg is installed on your system
    // Linux: sudo apt-get install ffmpeg
    // Mac: brew install ffmpeg
    // Windows: Download from ffmpeg.org
  }

  /**
   * Process video for YouTube (optimize quality and format)
   * @param {string} inputPath - Input video path
   * @param {string} outputPath - Output video path
   * @returns {Promise<string>} Output path
   */
  async processForYouTube(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      logger.info(`Processing video for YouTube: ${inputPath}`);

      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size('1920x1080')
        .fps(30)
        .output(outputPath)
        .on('end', () => {
          logger.info(`Video processed for YouTube: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Error processing video for YouTube', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Process video for Instagram Reels (vertical format)
   * @param {string} inputPath - Input video path
   * @param {string} outputPath - Output video path
   * @returns {Promise<string>} Output path
   */
  async processForInstagram(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      logger.info(`Processing video for Instagram: ${inputPath}`);

      // Instagram Reels: 9:16 aspect ratio, max 90 seconds
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size('1080x1920') // Vertical format
        .fps(30)
        .duration(90) // Max 90 seconds for Reels
        .output(outputPath)
        .on('end', () => {
          logger.info(`Video processed for Instagram: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Error processing video for Instagram', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Trim video to specific duration
   * @param {string} inputPath - Input video path
   * @param {string} outputPath - Output video path
   * @param {number} startTime - Start time in seconds
   * @param {number} duration - Duration in seconds
   * @returns {Promise<string>} Output path
   */
  async trimVideo(inputPath, outputPath, startTime = 0, duration = 30) {
    return new Promise((resolve, reject) => {
      logger.info(`Trimming video: ${inputPath} (${startTime}s, ${duration}s)`);

      ffmpeg(inputPath)
        .seekInput(startTime)
        .duration(duration)
        .output(outputPath)
        .on('end', () => {
          logger.info(`Video trimmed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Error trimming video', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Add watermark/text overlay to video
   * @param {string} inputPath - Input video path
   * @param {string} outputPath - Output video path
   * @param {string} text - Text to overlay
   * @returns {Promise<string>} Output path
   */
  async addTextOverlay(inputPath, outputPath, text = '') {
    return new Promise((resolve, reject) => {
      logger.info(`Adding text overlay to video: ${text}`);

      ffmpeg(inputPath)
        .videoFilter(`drawtext=text='${text}':fontsize=24:fontcolor=white:x=10:y=10`)
        .output(outputPath)
        .on('end', () => {
          logger.info(`Text overlay added: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Error adding text overlay', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Get video metadata
   * @param {string} filePath - Video file path
   * @returns {Promise<Object>} Video metadata
   */
  async getMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('Error getting video metadata', { error: err.message });
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }
}

module.exports = new VideoProcessor();