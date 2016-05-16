"use strict";

const escape = require("js-string-escape");
const exec = require("child_process").exec;

/*
    GET library/:lib/books/:book/metadata
    REQUIRED
        author: string, title: string
        OR
        isbn: number
    RETURN
        OK = Metadata..., ERROR = 1
    DESCRIPTION
        Fetches an ebook's metadata
*/
module.exports = function(req, res) {
    
    const options = req.body.isbn
        ? `-i "${escape(req.body.isbn)}"`
        : `-a "${escape(req.query.author)}" -t "${escape(req.query.title)}"`;
    
    exec(
        `fetch-ebook-metadata ${options}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err || data.indexOf("No results found") != -1)
                res.send('1');
            else
                res.send(data);
        }
    );
    
};