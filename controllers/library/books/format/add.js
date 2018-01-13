const Calibre = require('node-calibre');
const fs = require('fs-extra');

/*
  POST libraries/:lib/books/:book/format
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Add new format of :book
*/
module.exports = async function(req, res) { 

  const calibre = new Calibre({ library: req._path.lib });

  try {
    const result = await calibre.run(
      'calibredb add_format', [+req.params.book, req.file.path]
    );

    if (result.indexOf('Error') != -1) throw result;

    res.json({ error: false });
    fs.emptyDir(req._path.ul);
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};