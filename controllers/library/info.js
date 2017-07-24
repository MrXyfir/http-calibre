const getFolderSize = require('get-folder-size');

/*
  GET :lib
  RETURN
    { error: boolean, size?: number }
  DESCRIPTION
    Returns a library's info
*/
module.exports = function(req, res) {
  
  getFolderSize(req._path.lib, (err, size) => {
    if (err)
      res.json({ error: true });
    else
      res.json({ error: false, size });
  });
  
};