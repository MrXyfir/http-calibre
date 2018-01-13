const Calibre = require('node-calibre');
const sqlite = require('sqlite3');
const config = require('config');
const fs = require('fs-extra');

/*
  PUT libraries/:lib/books/:book/cover
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Updates a book's cover with uploaded image
    Calls main API to update book's cover version
*/
module.exports = async function(req, res) {

  const calibre = new Calibre({ library: req._path.lib });
  const db = new sqlite.Database(req._path.lib + '/metadata.db');

  try {
    // Grab book's path within library
    const row = await new Promise((resolve, reject) =>
      db.get(
        'SELECT path FROM books WHERE id = ?',
        [+req.params.book],
        (err, row) => err ? reject(err) : resolve(row)
      )
    );
    db.close();

    if (!row) throw 'Could not find book';

    // Move newly uploaded cover file to replace current cover file
    await fs.rename(req.file.path, `${req._path.lib}/${row.path}/cover.jpg`);

    // Embed metadata for book
    await calibre.run('calibredb embed_metadata', [+req.params.book]);

    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
    db.close();
  }

}