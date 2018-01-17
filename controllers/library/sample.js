const path = require('path');
const fs = require('fs-extra');

/*
  POST libraries/:lib/sample
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Replace library with 'sample' library containing free books
*/
module.exports = async function(req, res) {

  try {
    await fs.emptyDir(req._path.lib);
    await fs.copy(path.resolve('res/sample-library'), req._path.lib);

    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};