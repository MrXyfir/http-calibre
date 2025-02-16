const Calibre = require('node-calibre');
const fs = require('fs-extra');

/*
  DELETE libraries/:lib/books/:book/format/:format
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Deletes a specific format of :book
*/
module.exports = async function(req, res) {

  const calibre = new Calibre({ library: req._path.lib });

  try {
    if (!req.params.format.match(/^[A-Za-z0-9]{1,5}$/))
      throw 'Invalid format';

    await calibre.run(
      'calibredb remove_format', [+req.params.book, req.params.format]
    );

    res.json({ error: false });

    fs.unlink(req._path.books, () => 1);
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};