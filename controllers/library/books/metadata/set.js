const Calibre = require('node-calibre');
const request = require('superagent');
const config = require('config');

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

  const { normal, xyfir } = req.body;
  const calibre = new Calibre({ library: req._path.lib });
  const book = +req.params.book;

  try {
    if (normal) {
      for (let field in normal) {
        const result = await calibre.run(
          'calibredb set_metadata',
          [book],
          { f: `${field}:${normal[field]}` }
        );

        if (result.indexOf('is not a known field') != -1)
          throw `Invalid field "${field}"`;
      }
    }

    if (xyfir) {
      for (let field in xyfir) {
        await calibre.run(
          'calibredb set_custom',
          [`xy__${field}`, book, xyfir[field]]
        );
      }
    }

    await calibre.run('calibredb embed_metadata', [book]);

    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

}