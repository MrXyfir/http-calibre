const router = require('express').Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, req._path.ul)
  },
  filename: function(req, file, cb) {
    const fname = `${Date.now()}.${file.originalname.split('.').slice(-1)}`;
    cb(null, fname);
  }
})

const uploadBooks = multer({
  storage, limits: {fileSize: 100000001, files: 20}
});
const uploadCover = multer({
  storage, limits: {fileSize: 5000001, files: 1}
});
const uploadLibrary = multer({
  storage, limits: {fileSize: 500000001, files: 1}
})

/* Library */
router.route('/')
  .get(require('./library/info'))
  .put(uploadLibrary.single('lib'), require('./library/upload'))
  .post(require('./library/create'))
  .delete(require('./library/delete'));
router.post('/zip', require('./library/zip'));
router.post('/sample', require('./library/sample'));
router.post('/upgrade', require('./library/upgrade'));

/* Library - Books */
router.route('/books')
  .get(require('./library/books/list'))
  .post(uploadBooks.array('book', 20), require('./library/books/add'))
  .delete(require('./library/books/remove'));

router.put(
  '/books/:book/cover',
  uploadCover.single('cover'),
  require('./library/books/change-cover')
);

/* Library - Books - Metadata */
router.route('/books/:book/metadata')
  .get(require('./library/books/metadata/get'))
  .put(require('./library/books/metadata/set'));
router.get(
  '/books/:book/metadata/fetch',
  require('./library/books/metadata/fetch')
);
router.post(
  '/books/:book/metadata/embed',
  require('./library/books/metadata/embed')
);

/* Library - Books - Format */
router.post(
  '/books/:book/format',
  uploadBooks.single('book'),
  require('./library/books/format/add')
);
router.delete(
  '/books/:book/format/:format',
  require('./library/books/format/remove')
);
router.post(
  '/books/:book/format/convert',
  require('./library/books/format/convert-to')
);

module.exports = router;