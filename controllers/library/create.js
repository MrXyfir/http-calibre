const addXyColumns = require('lib/add-xy-columns');
const fs = require('fs-extra');

/*
  POST libraries/:lib
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Create library and library's upload folder
*/
module.exports = async function(req, res) {

  try {
    // Create library's storage and upload directories
    await Promise.all([
      fs.mkdir(req._path.lib),
      fs.mkdir(req._path.ul)
    ]);

    await addXyColumns(req._path.lib);

    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};