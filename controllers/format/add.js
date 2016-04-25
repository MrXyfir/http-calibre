"use strict";

const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require("diskusage");
const fs = require("fs-extra");

/*
    POST library/:lib/books/:book/format
    RETURN
        { error: boolean, fileName?: string }
    DESCRIPTION
        Add uploaded file of type :format to :book
*/
module.exports = function(req, res) {
    
    if (!req.params.format.match(/^[A-Za-z0-9]{1,5}$/)) {
        res.json({ error: true });
        return;
    } 
    
    // Add new format from upload folder to :book
    exec(
        `calibredb add_format --library-path ${req.path.lib} --dont-notify-gui ${+req.params.book} "${escape(req.file.path)}"`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err || data.indexOf("Error") != -1) {
                res.json({ error: true });
            }
            else {
                res.json({ error: false, fileName: req.file.filename });
                
                // Notify API of system's free space
                fs.emptyDir(req.path.ul, err => disk.check('/', (err, info) => {
                    request.put({
                        url: process.env.updateFreeSpaceUrl, form: {
                            free: info.free
                        }
                    });
                }));
            }
        }
    )
    
};