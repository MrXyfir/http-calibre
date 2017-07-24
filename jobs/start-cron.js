const cron = require('cron');

// jobs
const deleteExpiredDownloads = require('./delete-expired-downloads');

/*
  Sets cronjobs to run at appropriate times
*/
module.exports = function() {

  // Delete files in downloads directory that are over a day old
  // Runs twice a day
  new cron.CronJob(
    '0 1/12 * * *',
    async () => await deleteExpiredDownloads(),
    () => 1,
    true
  );

};