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

      res.json({ error: false });

      fs.emptyDir(req._path.ul, () => 1);
      fs.unlink(req._path.books, () => 1);
    })
    .catch(err => {
      res.json({ error: true, message: err });

      fs.emptyDir(req._path.ul, () => 1);

      // Delete newly added books
      if (removeBooks) calibre.run('calibredb remove', [ids]);
    });

};