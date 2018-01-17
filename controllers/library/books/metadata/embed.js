const Calibre = require('node-calibre');

/*
  POST libraries/:lib/books/:book/metadata/embed
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Embeds metadata from database into ebook file(s)
*/
module.exports = async function(req, res) {

  const calibre = new Calibre({ library: req._path.lib });

  try {
    await calibre.run('calibredb embed_metadata', [+req.params.book]);
    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

}