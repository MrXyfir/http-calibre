"use strict";

const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require("diskusage");
const fs = require("fs-extra");

/*
    POST library/:lib/books/:book/format
    RETURN
        { error: boolean }
    DESCRIPTION
        Add new format of :book
*/
module.exports = function(req, res) { 
    
    // Add new format from upload folder to :book
    exec(
        `calibredb add_format --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book} "${escape(req.file.path)}"`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err || data.indexOf("Error") != -1) {
                res.json({ error: true });
            }
            else {
                res.json({ error: false });
                
                // Notify API of system's free space
                fs.emptyDir(req._path.ul, err => disk.check(process.env.rootdir, (err, info) => {
                    request.put({
                        url: process.env.apiurl + "space", form: {
                            free: info.free
                        }
                    });
                }));
            }
        }
    )
    
};