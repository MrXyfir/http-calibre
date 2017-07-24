require('app-module-path').addPath(__dirname);

const express = require('express');
const parser = require('body-parser');

const config = require('config');
const app = express();

if (config.environment.type == 'dev') app.use(require('cors')());
if (config.environment.runCronJobs) require('./jobs/start-cron')();

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(['/files/:lib', '/:lib'], (req, res, next) => {
  if (!req.params.lib.match(/^[0-9]{1,10}-[A-Za-z0-9]{40,128}$/)) {
    res.json({ error: true, message: 'Invalid library id' });
  }
  else {
    req._path = {
      lib: config.directories.libraries + '/' + req.params.lib,
      ul: config.directories.uploads + '/' + req.params.lib
    },
    req._libId = req.params.lib;
    
    next();
  }
});
app.use('/files/:lib', require('./controllers/files/'));
app.use('/:lib', require('./controllers/'));

app.get('/downloads/:file', (req, res) =>
  req.params.file.test(/^\w+_\d+$/) ?
  res.sendFile(config.directories.downloads + '/' + req.params.file) :
  res.status(404).send()
);

app.listen(config.environment.port, () =>
  console.log('~~Server running on port', config.environment.port)
);