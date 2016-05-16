"use strict";

const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require('diskusage');

/*
    DELETE library/:lib/books/:book/format/:format
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes a specific format of :book
        Update server's freeSpace via API 
*/
module.exports = function(req, res) {
    
    if (!req.params.format.match(/^[A-Za-z0-9]{1,5}$/)) {
        res.json({ error: true });
        return;
    }
    
    exec(
        `calibredb remove_format --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book} ${req.params.format}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err) {
                res.json({ error: true });
            }
            else {
                res.json({ error: false });
                
                disk.check(process.env.rootdir, (err, info) => {
                   request.put({
                        url: process.env.apiurl + "space",
                        form: { free: info.free }
                    });
               });
            }
        }
    );
    
};