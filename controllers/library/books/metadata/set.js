const Calibre = require('node-calibre');
const request = require('superagent');
const config = require('config');
const fs = require('fs-extra');

/*
  PUT libraries/:lib/books/:book/metadata
  OPTIONAL
    normal: { [field: string]: any },
    xyfir: { [field: string]: any }
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Sets fields in a book's metadata
*/
module.exports = async function(req, res) {

  const {normal, xyfir} = req.body;
  const calibre = new Calibre({ library: req._path.lib });
  const book = +req.params.book;

  try {
    if (normal) {
      const result = await calibre.run(
        'calibredb set_metadata', [book],
        {f: Object.entries(normal).map(([f, v]) => `${f}:${v}`)}
      );

      if (result.indexOf('is not a known field') != -1) throw result;
    }

    if (xyfir) {
      for (let field in xyfir) {
        await calibre.run(
          'calibredb set_custom',
          [`xy__${field}`, book, xyfir[field]]
        );
      }
    }

    res.json({ error: false });

    calibre.run('calibredb embed_metadata', [book]);
    fs.unlink(req._path.books, () => 1);
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

}