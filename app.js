require('app-module-path').addPath(__dirname);

const express = require('express');
const parser = require('body-parser');

const config = require('config');
const app = express();

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(['/files/:lib', '/libraries/:lib'], (req, res, next) => {
  if (!req.params.lib.match(/^[0-9]{1,10}-[A-Za-z0-9]{40,128}$/)) {
    res.json({ error: true, message: 'Invalid library id' });
  } else {
    req._path = {
      lib: `${config.directories.libraries}/${req.params.lib}`,
      ul: `${config.directories.uploads}/${req.params.lib}`
    };
    req._path.books = `${req._path.lib}/books.json`;
    req._libId = req.params.lib;

    next();
  }
});
app.use('/files/:lib', require('./controllers/files/'));
app.use('/libraries/:lib', require('./controllers/'));
app.get('/downloads/:file', require('./controllers/downloads'));

app.listen(config.environment.port, () =>
  console.log('~~Server running on port', config.environment.port)
);
