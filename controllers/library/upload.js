const resizeDisk = require('lib/resize-disk');
const request = require('superagent');
const sqlite = require('sqlite3');
const unzip = require('extract-zip');
const fs = require('fs-extra');

const config = require('config');

/*
  POST libraries/:lib/upload
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Empty previous library directory
    Unzip file into library folder
    Grab all book ids from metadata.db
    Send book ids to core API
*/
module.exports = async function(req, res) {

  try {
    await new Promise((resolve, reject) => {
      fs.emptyDir(req._path.lib, err => {
        err ? reject('Could not wipe old library') : resolve();
      });
    });

    await new Promise((resolve, reject) => {
      unzip(req.file.path, { dir: req._path.lib }, err => {
        err ? reject('Could not unzip file') : resolve();
      });
    });

    const db = new sqlite.Database(req._path.lib + '/metadata.db');

    const ids = await new Promise((resolve, reject) => {
      db.all('SELECT id FROM "books"', (err, rows) => {
        db.close();

        err || !rows.length
          ? reject('Invalid library')
          : resolve(rows.map(row => row.id).join(','));
      });
    });

    await new Promise((resolve, reject) => {
      request
        .post(config.urls.api + req._libId + '/library')
        .send({ ids })
        .end((err, result) => {
          if (err || result.body.error)
            reject('Could not add books to xyBooks');
          else
            resolve();
        });
    });

    res.json({ error: false });

    fs.emptyDir(req._path.ul, () => 1);
    resizeDisk();
  }
  catch (err) {
    res.json({ error: true, message: err });
  }
  
};