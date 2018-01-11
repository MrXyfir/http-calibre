/**
 * @typedef {object} ParseBookFieldFlags
 * @prop {boolean} [DEFAULTS]
 * @prop {boolean} [XYFIR]
 */
/**
 * Takes books returned from `calibredb list` and converts the values to those
 *  that xyBooks will expect.
 * @param {string|object[]} books
 * @param {ParseBookFieldFlags} flags
 * @return {object[]}
 */
module.exports = function(books, flags) {

  try {
    if (typeof books == 'string') books = JSON.parse(books);
  }
  catch (err) {
    return [];
  }

  // Ensure books[i].cover|formats paths are only
  // author_folder/book_folder/file and not full file paths
  books = books.map(book => {
    if (book.cover)
      book.cover = book.cover.split('/').slice(-3).join('/');
    if (book.formats)
      book.formats = book.formats.map(f => f.split('/').slice(-3).join('/'));
    return book;
  });

  // Add default values to fields that may not be returned by Calibre
  if (flags.DEFAULTS) {
    const defaults = {
      cover: '', rating: 0, series: '', publisher: '',
      identifiers: {}, comments: ''
    };

    books = books.map(book => {
      Object.keys(defaults).forEach(k =>
        book[k] = book[k] || defaults[k]
      );

      return book;
    })
  }

  // Handle custom Xyfir (xy__*) columns
  if (flags.XYFIR) {
    books = books.map(book => {
      // Convert name from *xy__col -> col
      Object.keys(book).forEach(k => {
        if (/^\*xy__\w+$/.test(k)) {
          book[k.split('__')[1]] = book[k];
          delete book[k];
        }
      });

      // Parse xy__bookmarks and xy__notes
      book.notes = book.notes ? JSON.parse(book.notes) : [],
      book.bookmarks = book.bookmarks ? JSON.parse(book.bookmarks) : [];

      return book;
    });
  }

  return books;

}