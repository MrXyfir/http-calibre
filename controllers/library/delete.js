const fs = require('fs-extra');

/*
  DELETE libraries/:lib
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Delete library and library's upload folder
*/
module.exports = async function(req, res) {

  try {
    await fs.remove(req._path.lib);
    await fs.remove(req._path.ul);

    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};