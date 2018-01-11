const router = require('express').Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, req._path.ul)
  },
  filename: function(req, file, cb) {
    const filename = Date.now().toString()
      + '.' + file.originalname.split('.').slice(-1);

    cb(null, filename);
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
router.post('/upgrade', require('./library/upgrade'));

/* Books */
router.route('/books')
  .get(require('./books/list'))
  .post(uploadBooks.array('book', 20), require('./books/add'))
  .delete(require('./books/remove'));

router.put(
  '/books/:book/cover',
  uploadCover.single('cover'),
  require('./books/change-cover')
);

router.route('/books/:book/metadata')
  .get(require('./metadata/get'))
  .put(require('./metadata/set'));
router.get('/books/:book/metadata/fetch', require('./metadata/fetch'));

router.post(
  '/books/:book/format',
  uploadBooks.single('book'),
  require('./format/add')
);
router.delete('/books/:book/format/:format', require('./format/remove'));
router.post('/books/:book/format/convert', require('./format/convert-to'));

module.exports = router;