const archiver = require('archiver');
const fs = require('fs-extra');

const config  = require('config');
const mailgun = require('mailgun-js')({
	apiKey: config.keys.mailgun,
	domain: config.urls.mailgun.domain
});

/*
  POST libraries/:lib/zip
  REQUIRED
    email: string
  RETURN
    { error: boolean }
  DESCRIPTION
    Zips the library and sends its download link to the provided email
*/
module.exports = function(req, res) {

  res.json({ error: false });

  const file = `Library_${Date.now()}.zip`,
    filePath = config.directories.downloads + '/' + file,
    output   = fs.createWriteStream(filePath);

  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () =>
    mailgun.messages().send({
      subject: 'Xyfir Books Library Download Link',
      from: 'Xyfir Books <books@xyfir.com>',
      text:
        'https://books.xyfir.com/library/downloads/' + file +
        '\n\n' +
        'This link will expire in 24 hours.',
      to: req.body.email
    }, () => 1)
  );

  archive.on('error', async err => {
    await fs.unlink(filePath);
  });

  // Pipe archive data to the file 
  archive.pipe(output);
  // Add files from directory, putting its contents at the root of archive
  archive.directory(req._path.lib, false);
  // No more data to be added
  archive.finalize();

};