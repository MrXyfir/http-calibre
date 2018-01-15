const Calibre = require('node-calibre');

/*
  GET libraries/:lib/books/:book/metadata/fetch
  REQUIRED
    author: string, title: string
    OR
    isbn: string
  RETURN
    { error: boolean, message?: string, metadata?: string }
  DESCRIPTION
    Fetches an ebook's metadata
*/
module.exports = async function(req, res) {

  const calibre = new Calibre({ library: req._path.lib });

  try {
    const result = await calibre.run(
      'fetch-ebook-metadata',
      req.query.isbn
        ? { i: req.query.isbn }
        : { a: req.query.author, t: req.query.title }
    );

    if (result.indexOf('No results found') != -1) throw result;

    res.json({ error: false, metadata: result });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

}