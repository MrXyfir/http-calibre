"use strict";

const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require('diskusage');

/*
    DELETE library/:lib/books/:book/format/:format
    RETURN
        { error: boolean, freeSpace?: number }
    DESCRIPTION
        Deletes a specific format of :book
*/
module.exports = function(req, res) {
    
    if (!req.params.format.match(/^[A-Za-z0-9]{1,5}$/)) {
        res.json({ error: true });
        return;
    }
    
    exec(
        `calibredb remove_format --library-path ${req.path.lib} --dont-notify-gui ${+req.params.book} ${req.params.format}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err) {
                res.json({ error: true });
            }
            else {
                disk.check('/', (err, info) => {
                   res.json({ error: false, freeSpace: info.free });
               });
            }
        }
    );
    
};