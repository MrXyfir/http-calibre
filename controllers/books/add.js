const resizeDisk = require('lib/resize-disk');
const request = require('superagent');
const Calibre = require('node-calibre');
const fs = require('fs-extra');

const config = require('config');

/*
  POST libraries/:lib/books
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Add uploadeded books to library
    Notify core API of new book(s)
*/
module.exports = function(req, res) { 
  
  const calibre = new Calibre({ library: req._path.lib }),
  files = req.files.map(file => file.path);

  let removeBooks = false, ids = '';

  calibre
    .run('calibredb add', files)
    .then(result => {
      if (result.indexOf('Added book ids:') == -1)
        throw 'Could not add book(s)';

      ids = result
        .split('Added book ids: ')[1]
        .replace(new RegExp('[^0-9,]', 'g'), '');
      
      // Notify Xyfir Books of new books
      return new Promise((resolve, reject) => {
        request
          .post(config.urls.api + req._libId + '/books')
          .send({ ids })
          .end((err, response) => {
            // Error adding books to Xyfir Books
            if (err || response.body.error) {
              removeBooks = true;
              reject('Could not add book to xyBooks');
            }
            else {
              resolve();
            }
          });
      });
    })
    .then(() => {
      res.json({ error: false });
      
      fs.emptyDir(req._path.ul, () => 1);
      resizeDisk();
    })
    .catch(err => {
      res.json({ error: true, message: err });
      
      fs.emptyDir(req._path.ul, () => 1);

      // Delete newly added books
      if (removeBooks) calibre.run('calibredb remove', [ids]);
    });
  
};