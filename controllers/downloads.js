const config = require('config');

/*
  GET downloads/:file
*/
module.exports = function(req, res) {

  /^\w+_\d+\.\w+$/.test(req.params.file)
    ? res.sendFile(config.directories.downloads + '/' + req.params.file)
    : res.status(404).send();

}