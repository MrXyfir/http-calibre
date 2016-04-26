"use strict";

const escape = require("js-string-escape");
const exec = require("child_process").exec;

/*
    GET library/:lib/books/search
    REQUIRED
        query: string
    RETURN
        { matches: number[] }
    DESCRIPTION
        Return ids of books that match search query
*/
module.exports = function(req, res) {
    
    exec(
        `calibredb search "${escape(req.query.query)}" --library-path ${req._path.lib}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            res.json({ matches: err ? [] : data.split(',') });
        }
    );
    
};