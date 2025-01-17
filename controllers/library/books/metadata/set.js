const Calibre = require('node-calibre');
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
  const { normal, xyfir } = req.body;
  const calibre = new Calibre({ library: req._path.lib });
  const book = +req.params.book;

  try {
    if (normal) {
      const result = await calibre.run('calibredb set_metadata', [book], {
        f: Object.entries(normal).map(([f, v]) => `${f}:${v}`)
      });

      if (result.indexOf('is not a known field') != -1) throw result;
    }

    if (xyfir) {
      for (let field in xyfir) {
        await calibre.run('calibredb set_custom', [
          `xy__${field}`,
          book,
          xyfir[field]
        ]);
      }
    }

    res.json({ error: false });

    // Update library's books.json if only last_read and percent fields are
    // being updated (closing book), otherwise just delete books.json
    // ** Eventually this should support all fields
    if (
      !normal &&
      Object.keys(xyfir || {}).length == 2 &&
      xyfir.last_read !== undefined &&
      xyfir.percent !== undefined
    ) {
      try {
        let books = await fs.readFile(req._path.books, 'utf8');
        books = JSON.parse(books);

        const index = books.findIndex(b => b.id == book);

        (books[index].last_read = xyfir.last_read),
          (books[index].percent = xyfir.percent);

        await fs.writeFile(req._path.books, JSON.stringify(books));
      } catch (err) {
        // File probably doesn't exist
        console.error('oops', err);
      }
    } else {
      fs.unlink(req._path.books, () => 1);
    }
  } catch (err) {
    res.json({ error: true, message: err });
  }
};
