const router = require("express").Router();

router.get("/:author/:book/:file", require("./file"));
router.get("/metadata.db", require("./metadata"));

module.exports = router;