const addXyColumns = require('lib/add-xy-columns');
const unzip = require('extract-zip');
const fs = require('fs-extra');

const config = require('config');

/*
  POST libraries/:lib/upload
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Empty previous library directory
    Unzip file into library folder
    Add `xy__` custom columns if needed
*/
module.exports = async function(req, res) {

  try {
    await fs.emptyDir(req._path.lib);

    await new Promise((resolve, reject) => {
      unzip(req.file.path, { dir: req._path.lib }, err =>
        err ? reject('Could not unzip file') : resolve()
      );
    });

    await addXyColumns(req._path.lib);

    res.json({ error: false });
    await fs.emptyDir(req._path.ul);
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};