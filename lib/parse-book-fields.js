const defaults = {
  cover: '', rating: 0, series: '', publisher: '', identifiers: {},
  comments: '', '*xy__notes': [], '*xy__bookmarks': [], '*xy__words': 0,
  '*xy__percent': 0, '*xy__last_read': 0
};

/**
 * Takes books returned from `calibredb list` and converts the values to those
 *  that xyBooks will expect.
 * @param {string|object[]} books
 * @param {string[]} fields
 * @return {object[]}
 */
module.exports = function(books, fields) {

  try {
    if (typeof books == 'string') books = JSON.parse(books);
  }
  catch (err) {
    return [];
  }

  return books.map(book => {
    fields.forEach(k => {
      // Add default values that may not have been returned
      book[k] = book[k] || defaults[k];

      // Convert name from *xy__col -> col
      if (/^\*xy__\w+$/.test(k)) {
        book[k.split('__')[1]] = book[k];
        delete book[k];
      }
    });

    // Clear Calibre's default pubdate if none is present
    if (book.pubdate == '0101-01-01T00:00:00+00:00')
      book.pubdate = '';

    // Ensure books[i].cover|formats paths are only
    // author_folder/book_folder/file and not full file paths
    if (book.cover)
      book.cover = book.cover.split('/').slice(-3).join('/');
    if (Array.isArray(book.formats))
      book.formats = book.formats.map(f => f.split('/').slice(-3).join('/'));

    // Parse xy__bookmarks and xy__notes
    if (typeof book.notes == 'string')
      book.notes = JSON.parse(book.notes);
    if (typeof book.bookmarks == 'string')
      book.bookmarks = JSON.parse(book.bookmarks);

    return book;
  });

}