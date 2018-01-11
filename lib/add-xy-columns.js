const Calibre = require('node-calibre');

/**
 * Add needed `xy__` custom columns to Calibre library.
 * @param {string} library
 */
module.exports = async function(library) {

  try {
    const calibre = new Calibre({ library });
    const columns = [
      // label, name, type
      ['xy__notes', 'Notes', 'text'],
      ['xy__words', 'Word Count', 'int'],
      ['xy__percent', 'Percent Complete', 'int'],
      ['xy__bookmarks', 'Bookmarks', 'text'],
      ['xy__last_read', 'Last Read', 'int']
    ];

    // Get the library's current custom columns
    const current = await calibre.run('calibredb custom_columns');

    // Check if the library already has `xy__` columns
    const xyindex = current
      .split('\n')
      .findIndex(col => /^xy__\w+/g.test(col));

    if (xyindex > -1) return;

    // Add columns to library
    // !! Unfortunately, these cannot all be run at once via Promise.all()
    for (let column of columns) {
      await calibre.run('calibredb add_custom_column', column);
    }
  }
  catch (err) {
    console.error(err);
    throw 'Error checking/adding `xy__` columns to library';
  }

}