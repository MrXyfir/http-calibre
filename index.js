"use strict";

const express = require("express");
const parser = require("body-parser");
const app = express();

app.use("/", express.static(__dirname + "/public"));

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(require("cors")());

app.use("/library/:lib", function(req, res, next) {
    if (!req.params.lib.match(/^[0-9]{1,10}-[A-Za-z0-9]{40}$/)) {
        res.json({ error: true });
    }
    else {
        req._path = {
            lib: process.env.libdir + '/' + req.params.lib,
            ul: process.env.uldir + '/' + req.params.lib
        };
        
        next();
    }
});
app.use("/library/:lib", require("./controllers/"));

app.listen(process.env.port, () => {
    console.log("SERVER RUNNING ON", process.env.port);
});