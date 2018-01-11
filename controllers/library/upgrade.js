const addXyColumns = require('lib/add-xy-columns');

/*
  POST libraries/:lib/upgrade
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Upgrade library database
*/
module.exports = async function(req, res) {

  try {
    await addXyColumns(req._path.lib);
    res.json({ error: false });
  }
  catch (err) {
    res.json({ error: true, message: err });
  }

};