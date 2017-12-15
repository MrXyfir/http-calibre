const Calibre = require('node-calibre');
const request = require('superagent');
const config = require('config');

/*
  PUT libraries/:lib/books/:book/metadata
  REQUIRED
    data: json-string
      { key: value, key2: value, ... }
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Sets a field in book's metadata
    Notify API of book's metadata change
*/
module.exports = async function(req, res) {

  const calibre = new Calibre({ library: req._path.lib });
  let fields = {};

  try {
    try { fields = JSON.parse(req.body.data); }
    catch (err) { throw 'Bad fields'; }

    for (let field in fields) {
      const result = await calibre.run(
        'calibredb set_metadata',
        [+req.params.book],
        { f: `${field}:${fields[field]}` }
      );

      if (result.indexOf('Backing up metadata') == -1)
        throw 'Could not set metadata';
    }

    await calibre.run('calibredb embed_metadata', [+req.params.book]);

    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

}