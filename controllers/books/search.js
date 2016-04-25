"use strict";

const escape = require("js-string-escape");
const exec = require("child_process").exec;

/*
    GET library/:lib/books/search
    REQUIRED
        search: string
    RETURN
        number[]
    DESCRIPTION
        Return ids of books that match search query
*/
module.exports = function(req, res) {
    
    exec(
        `calibredb search "${escape(query)}" --library-path ${req._path.lib}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            res.json(err ? [] : data.split(','));
        }
    );
    
};