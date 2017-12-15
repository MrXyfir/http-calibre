// jobs
const deleteExpiredDownloads = require('./delete-expired-downloads');

/*
  Sets cronjobs to run at appropriate times
*/
module.exports = function() {

  // Delete files in downloads directory that are over a day old
  // Runs twice a day
  setInterval(deleteExpiredDownloads, 43200 * 1000);

};