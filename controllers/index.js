const router = require("express").Router();

/* Library */

router.route("/")
    .post(require("./library/create"))
    .put(require("./library/move"))
    .delete(require("./library/delete"));
router.post("/upload", require("./upload/library"));

/* Books */

router.route("/books")
    .get(require("./books/list"))
    .post(require("./books/add"))
    .delete(require("./books/remove"));
router.get("/books/search", require("./books/search"));
router.post("/books/upload", require("./upload/books"));
    
router.route("/books/:book/metadata")
    .get(require("./metadata/get"))
    .put(require("./metadata/set"));
    
router.route("/books/:book/format/:format")
    .post(require("./format/add"))
    .delete(require("./format/remove"));
router.post("/books/:book/format/:format/convert", require("./format/convert-to"));

module.exports = router;