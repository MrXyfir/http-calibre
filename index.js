require("app-module-path").addPath(__dirname);

const express = require("express");
const parser = require("body-parser");
const config = require("config");
const app = express();

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(require("cors")());

app.use("/:lib", function(req, res, next) {
    if (!req.params.lib.match(/^[0-9]{1,10}-[A-Za-z0-9]{40}$/)) {
        res.json({ error: true });
    }
    else {
        req._path = {
            lib: config.directories.libraries + '/' + req.params.lib,
            ul: config.directories.uploads + '/' + req.params.lib
        };
        req._libId = req.params.lib;
        
        next();
    }
});
app.use("/:lib", require("./controllers/"));

app.listen(config.environment.port, () => {
    console.log("~~Server running on port", config.environment.port);
});