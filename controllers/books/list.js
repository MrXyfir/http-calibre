const parseBookFields = require('lib/parse-book-fields');
const {spawn} = require('child_process');

/*
  GET libraries/:lib/books
  RETURN
    { books: [{
      last_modified: string, size: number, timestamp: number, comments: string,
      author_sort: string, authors: string, cover: string, formats: string[],
      tags: string[], title: string, pubdate: string, publisher: string,
      id: number, rating: number, series: string, series_index: number,
      identifiers: {
        [type: string]: string|number
      }
    }]}
  DESCRIPTION
    Return metadata / info for books in library
*/
module.exports = function(req, res) {

  const calibre = spawn('calibredb', [
    'list',
    '--library-path', req._path.lib,
    '--for-machine',
    '--fields',
      'author_sort,authors,cover,formats,id,rating,series,' +
      'series_index,tags,title,pubdate,publisher,last_modified,' +
      'identifiers,size,timestamp,comments'
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
      output = parseBookFields(output, { DEFAULTS: true });
    else
      output = [];

    if (!sent) {
      res.json({ books: output });
      sent = true;
    }
  });

};