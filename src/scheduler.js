const schedule = require('node-schedule');
const Clipper = require('./clipper');
const Uploader = require('./uploader');
const logger = require('./logger');

class Scheduler {
  constructor() {
    this.clipper = new Clipper();
    this.uploader = new Uploader();
    this.jobs = [];
  }

  /**
   * Schedule clipping job
   * @param {string} cronExpression - Cron expression (e.g., '0 */6 * * *' for every 6 hours)
   */
  scheduleClipping(cronExpression = '0 */6 * * *') {
    try {
      logger.info(`Scheduling clipping job: ${cronExpression}`);

      const job = schedule.scheduleJob(cronExpression, async () => {
        logger.info('Running scheduled clipping job');
        try {
          await this.clipper.runClipping();
        } catch (error) {
          logger.error('Error in scheduled clipping job', { error: error.message });
        }
      });

      this.jobs.push(job);
      logger.info('Clipping job scheduled successfully');
    } catch (error) {
      logger.error('Error scheduling clipping job', { error: error.message });
    }
  }

  /**
   * Schedule upload job
   * @param {string} cronExpression - Cron expression
   */
  scheduleUpload(cronExpression = '0 */12 * * *') {
    try {
      logger.info(`Scheduling upload job: ${cronExpression}`);

      const job = schedule.scheduleJob(cronExpression, async () => {
        logger.info('Running scheduled upload job');
        try {
          await this.uploader.runUpload();
        } catch (error) {
          logger.error('Error in scheduled upload job', { error: error.message });
        }
      });

      this.jobs.push(job);
      logger.info('Upload job scheduled successfully');
    } catch (error) {
      logger.error('Error scheduling upload job', { error: error.message });
    }
  }

  /**
   * Start all scheduled jobs
   */
  startAll(clippingCron, uploadCron) {
    try {
      logger.info('Starting all scheduled jobs');
      this.scheduleClipping(clippingCron);
      this.scheduleUpload(uploadCron);
      logger.info('All scheduled jobs started');
    } catch (error) {
      logger.error('Error starting scheduled jobs', { error: error.message });
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    try {
      logger.info('Stopping all scheduled jobs');
      this.jobs.forEach((job) => job.cancel());
      this.jobs = [];
      logger.info('All scheduled jobs stopped');
    } catch (error) {
      logger.error('Error stopping scheduled jobs', { error: error.message });
    }
  }

  /**
   * List active jobs
   */
  listJobs() {
    return this.jobs.map((job, index) => ({
      index,
      nextInvocation: job.nextInvocation(),
    }));
  }
}

module.exports = Scheduler;