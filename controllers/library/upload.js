const resizeDisk = require('lib/resize-disk');
const request = require('superagent');
const sqlite = require('sqlite3');
const unzip = require('extract-zip');
const fs = require('fs-extra');

const config = require('config');

/*
  POST :lib/upload
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Empty previous library directory
    Unzip file into library folder
    Grab all book ids from metadata.db
    Send book ids to core API
*/
module.exports = function(req, res) {

  const error = err => {
    res.json({ error: true, message: err });
  };
  
  fs.emptyDir(req._path.lib, err => {
    if (err) error('Could not wipe old library'); return;
    
    unzip(req.file.path, { dir: req._path.lib }, (err) => {
      if (err) error('Could not unzip file'); return;

      const db = new sqlite.Database(
        req._path.lib + '/metadata.db'
      );
  
      db.all('SELECT id FROM "books"', (err, rows) => {
        db.close();

        if (err || !rows.length) error('Invalid library'); return;
        
        const ids = rows.map(row => row.id).join(',');
        
        request
          .post(config.urls.api + req._libId + '/library')
          .send({ ids })
          .end((err, result) => {
            if (err || result.body.error)
              error('Could not add books to xyBooks'); return;
            
            fs.emptyDir(req._path.ul, () => 1);
            resizeDisk();
          });
      });
    });
  });
  
};