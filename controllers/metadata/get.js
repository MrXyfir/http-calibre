const parseBookFields = require('lib/parse-book-fields');
const Calibre = require('node-calibre');

/*
  GET libraries/:lib/books/:book/metadata
  OPTIONAL
    normal: string, xyfir: string
  RETURN
    {
      error: boolean, message?: string,
      metadata?: {
        [column: string]: any
      }
    }
  DESCRIPTION
    Returns requested metadata fields for a book
*/
module.exports = async function(req, res) {

  const {normal = '', xyfir = ''} = req.query;
  const calibre = new Calibre({ library: req._path.lib });

  let fields = normal;

  if (xyfir) {
    if (fields) fields += ',';

    fields += xyfir.split(',').map(f => `*xy__${f}`).join(',');
  }

  try {
    const result = await calibre.run('calibredb list', [], {
      'for-machine': null,
      'search': `id:${+req.params.book}`,
      'fields': fields
    });

    res.json({
      error: false,
      metadata: parseBookFields(result, fields.split(','))
    });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

}