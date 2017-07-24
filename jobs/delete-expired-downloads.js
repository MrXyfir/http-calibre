const config = require('config');
const fs = require('fs-extra');

module.exports = async function() {

  try {
    const files = await fs.readdir(config.directories.downloads);

    for (let file of files) {
      if (Date.now() > +file.split('_')[1] + 86400000)
        await fs.unlink(file);
    }
  }
  catch (err) {
    console.error('Failed job "delete-expired-downloads":', err);
  }

  return;

}