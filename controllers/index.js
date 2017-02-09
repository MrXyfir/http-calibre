const router = require("express").Router();
const multer = require("multer");

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

const uploadBooks = multer({storage, limits: {fileSize: 5000001, files: 20}});
const uploadCover = multer({storage, limits: {fileSize: 200001, files: 1}});
const uploadLibrary = multer({storage, limits: {fileSize: 500000001, files: 1}})

/* Library */

router.route("/")
    .post(require("./library/create"))
    .delete(require("./library/delete"));
router.get("/size", require("./library/size"));
router.post("/upload", uploadLibrary.single("lib"), require("./library/upload"));

/* Books */

router.route("/books")
    .get(require("./books/list"))
    .post(uploadBooks.array("book", 20), require("./books/add"))
    .delete(require("./books/remove"));
router.get("/books/search", require("./books/search"));

router.put("/books/:book/cover", uploadCover.single("cover"), require("./books/change-cover"));
    
router.route("/books/:book/metadata")
    .get(require("./metadata/get"))
    .put(require("./metadata/set"));

router.post("/books/:book/format/", uploadBooks.single("book"), require("./format/add"));
router.delete("/books/:book/format/:format", require("./format/remove"));
router.post("/books/:book/format/convert/:from/:to", require("./format/convert-to"));

module.exports = router;