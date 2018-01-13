const Calibre = require('node-calibre');
const request = require('superagent');
const sqlite = require('sqlite3');
const fs = require('fs-extra');

/*
  POST libraries/:lib/books/:book/format/convert
  REQUIRED
    from: string, to: string
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Gets path of q.from for :book from Calibre's metadata.db
    Attempts to generate a q.to format version of :book using q.from
    Adds newly generated version to library
*/
module.exports = function(req, res) {

  const regex = /^[A-Za-z0-9]{1,5}$/;

  if (!regex.test(req.query.from) || !regex.test(req.query.to)) {
    res.json({ error: true, message: 'Invalid format type(s)' });
    return;
  }

  const db = new sqlite.Database(req._path.lib + '/metadata.db');
  let path = '', sql = '', vars = [];

  // Get book path from books table WHERE id
  sql = 'SELECT path FROM "books" WHERE id = ?',
  vars = [+req.params.book];

  db.get(sql, vars, (err, row) => {
    if (err || !row) {
      db.close();
      res.json({ error: true, message: 'Could not find book' });
      return;
    }

    path = req._path.lib + '/' + row.path + '/';

    // Get book file name from data table WHERE id AND format
    sql = 'SELECT name FROM "data" WHERE book = ? AND format = ?';
    vars = [+req.params.book, req.query.from];

    db.get(sql, vars, (err, row) => {
      db.close();

      if (err || !row) {
        res.json({ error: true, message: 'Could not find format' });
        return;
      }

      // Build paths
      const nPath = path + row.name + '.' + req.query.to;
      path += row.name + '.' + req.query.from;

      const calibre = new Calibre({ library: req._path.lib });

      // Convert file at path to new file at nPath
      calibre
        .run('ebook-convert', [path, nPath])
        .then(result => {
          if (result.indexOf('Output saved to') == -1)
            throw 'Could not convert format';

          // Add new format at nPath to book at req.params.book
          return calibre.run(
            'calibredb add_format', [+req.params.book, nPath]
          );
        })
        .then(result => {
          if (result.indexOf('Error') > -1)
            throw 'Could not add format to library';

          res.json({ error: false });
        })
        .catch(err => {
          res.json({ error: true, message: err });
        });
    });
  });

};