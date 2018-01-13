const Calibre = require('node-calibre');

/*
  DELETE libraries/:lib/books
  REQUIRED
    books: string
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Delete a list of books by id from library
*/
module.exports = async function(req, res) {

  const calibre = new Calibre({ library: req._path.lib });

  try {
    if (!req.body.books || !req.body.books.match(/^[0-9,]{1,}$/))
      throw 'Missing or invalid book ids';

    await calibre.run('calibredb remove', [req.body.books]);

    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};