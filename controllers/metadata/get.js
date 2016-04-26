"use strict";

const escape = require("js-string-escape");
const exec = require("child_process").exec;

/*
    GET library/:lib/books/:book/metadata
    REQUIRED
        author: string, title: string
    RETURN
        OK = OPF (XML) output, ERROR = 1
    DESCRIPTION
        Fetches an ebook's metadata
*/
module.exports = function(req, res) {
    
    exec(
        `fetch-ebook-metadata -a "${escape(req.query.author)}" -t "${escape(req.query.title)}" -o`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err || data.indexOf("No results found") != -1)
                res.send('1');
            else
                res.send(data);
        }
    );
    
};