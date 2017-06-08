const spawn = require('child_process').spawn;

/*
  GET :lib/books
  RETURN
    { books: [{
      author_sort: string, authors: string, cover: string, formats: string[],
      tags: string[], title: string, pubdate: string, publisher: string,
      id: number, rating: number, series: string, series_index: number,
      last_modified: string, identifiers: string, size: number,
      timestamp: number, comments: string
    }]}
  DESCRIPTION
    Return metadata / info for books in library
*/
module.exports = function(req, res) {

  const calibre = spawn('calibredb', [
    'list',
    '--library-path', req._path.lib,
    '--for-machine',
    '--fields', 'author_sort,authors,cover,formats,id,rating,series,'
      + 'series_index,tags,title,pubdate,publisher,last_modified,'
      + 'identifiers,size,timestamp,comments'
  ]);

  let output = '', sent = false;

  calibre.stdout.on('data', data => output += data);

  calibre.stderr.on('data', data => {
    if (!sent) {
      res.json({ books: [] });
      sent = true;
    }
  });

  calibre.on('close', code => {
    if (code == 0) {
      const defaults = {
        cover: String, rating: Number, series: String, publisher: String,
        identifiers: String, comments: String
      };

      output = JSON.parse(output)
        // Add default values to fields that may not be returned by Calibre
        .map(book => {
          Object.keys(defaults).forEach(k =>
            book[k] = book[k] || defaults[k]()
          );

          return book;
        })
        // Ensure books[i].cover|formats paths are only
        // author_folder/book_folder/file and not full file paths
        .map(book =>
          Object.assign(book, {
            cover:
              book.cover.split('/').slice(-3).join('/'),
            formats:
              book.formats.map(format => format.split('/').slice(-3).join('/'))
          })
        );
    }
    else {
      output = [];
    }

    if (!sent) {
      res.json({ books: output });
      sent = true;
    }
  });
  
};