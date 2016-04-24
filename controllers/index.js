const router = require("express").Router();

/* Library */

router.route("/")
    .post(require("./library/create"))
    .put(require("./library/move"))
    .delete(require("./library/delete"));
router.post("/upload", require("./library/upload"));

/* Books */

router.route("/books")
    .get(require("./books/list"))
    .post(require("./books/add"))
    .delete(require("./books/remove"));
router.get("/books/search", require("./books/search"));
    
router.route("/books/:book/metadata")
    .get(require("./metadata/get"))
    .put(require("./metadata/set"));

router.post("/books/:book/format/", require("./format/add"));
router.delete("/books/:book/format/:format", require("./format/remove"));
router.post("/books/:book/format/convert/:from/:to", require("./format/convert-to"));

module.exports = router;