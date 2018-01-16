const parseBookFields = require('lib/parse-book-fields');
const {spawn} = require('child_process');
const fs = require('fs-extra');

const fields = [
  'author_sort', 'authors', 'cover', 'formats', 'id', 'rating', 'series',
  'series_index', 'tags', 'title', 'pubdate', 'publisher', 'identifiers',
  'timestamp', 'comments', '*xy__last_read', '*xy__percent',
  '*xy__words', '*xy__bookmarks', '*xy__notes'
];

/*
  GET libraries/:lib/books
  RETURN
    {
      books: [{
        last_modified: string, size: number, timestamp: number, comments: string,
        author_sort: string, authors: string, cover: string, formats: string[],
        tags: string[], title: string, pubdate: string, publisher: string,
        id: number, rating: number, series: string, series_index: number,
        identifiers: {
          [type: string]: string|number
        }
        // custom `xy__` columns
        last_read: number, percent: number, words: number
      }]
    }
  DESCRIPTION
    Return metadata / info for books in library
*/
module.exports = async function(req, res) {

  let exists = true;

  try {
    await fs.access(req._path.books);
  }
  catch (err) {
    exists = false;
  }

  if (exists) return res.sendFile(req._path.books);

  const calibre = spawn('calibredb', [
    'list',
    '--library-path', req._path.lib,
    '--for-machine',
    '--fields', fields.join(',')
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
    if (code == 0)
      output = parseBookFields(output, fields);
    else
      output = [];

    if (!sent) {
      res.json({ books: output });
      sent = true;

      fs.writeFile(req._path.books, JSON.stringify(output));
    }
  });

};