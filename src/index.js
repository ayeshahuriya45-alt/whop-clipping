const Scheduler = require('./scheduler');
const Clipper = require('./clipper');
const Uploader = require('./uploader');
const logger = require('./logger');

/**
 * Main application entry point
 */
async function main() {
  try {
    logger.info('Starting Whop Clipping Automation');

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'clip':
        // Manual clipping
        logger.info('Running manual clipping');
        const clipper = new Clipper();
        const clipResult = await clipper.runClipping();
        logger.info('Clipping completed', clipResult);
        break;

      case 'upload':
        // Manual upload
        logger.info('Running manual upload');
        const uploader = new Uploader();
        const uploadResult = await uploader.runUpload();
        logger.info('Upload completed', uploadResult);
        break;

      case 'scheduler':
        // Start automated scheduler
        logger.info('Starting automated scheduler');
        const scheduler = new Scheduler();

        // Schedule clipping every 6 hours
        // Schedule uploads every 12 hours
        scheduler.startAll('0 */6 * * *', '0 */12 * * *');

        logger.info('Scheduler is running. Press Ctrl+C to stop.');
        logger.info('Active jobs:', scheduler.listJobs());

        // Handle graceful shutdown
        process.on('SIGINT', () => {
          logger.info('Shutting down scheduler');
          scheduler.stopAll();
          process.exit(0);
        });

        break;

      default:
        logger.info('Available commands:');
        logger.info('  npm run clip     - Run manual clipping');
        logger.info('  npm run upload   - Run manual upload');
        logger.info('  npm start        - Start automated scheduler');
        break;
    }
  } catch (error) {
    logger.error('Fatal error in main application', { error: error.message });
    process.exit(1);
  }
}

// Run main if this is the entry point
if (require.main === module) {
  main();
}

module.exports = { Scheduler, Clipper, Uploader };