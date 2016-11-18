const router = require("express").Router();

router.get("/:author/:book/:file", require("./files/file"));
router.get("/metadata.db", require("./files/metadata"));

module.exports = router;