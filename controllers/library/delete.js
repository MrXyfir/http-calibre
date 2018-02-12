const fs = require('fs-extra');

/*
  DELETE libraries/:lib
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Wipe library and library's upload folder
    Does not actually delete the directories
*/
module.exports = async function(req, res) {

  try {
    await fs.emptyDir(req._path.lib);
    await fs.emptyDir(req._path.ul);

    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};