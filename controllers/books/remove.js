"use strict";

const exec = require("child_process").exec;
const disk = require('diskusage');

/*
    DELETE library/:lib/books
    REQUIRED
        books: string
    RETURN
        { error: boolean, freeSpace?: number }
    DESCRIPTION
        Delete a list of books by id from library
*/
module.exports = function(req, res) {
    
    if (!req.body.books || !req.body.books.match(/^[0-9,]{1,}$/)) {
        res.json({ error: true });
        return;
    }
    
    exec(
        `calibredb remove ${req.body.books} --library-path ${req._path.lib} --dont-notify-gui`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err) {
                res.json({ error: true });
            }
            else {
                disk.check(process.env.rootdir, (err, info) => {
                    res.json({ error: false, freeSpace: info.free });
                });
            }
        }
    );
    
};