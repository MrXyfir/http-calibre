"use strict";

const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require("diskusage");
const fs = require("fs-extra");

/*
    POST library/:lib/books
    RETURN
        { error: boolean }
    DESCRIPTION
        Add uploadeded books to library
        Notify core API of free storage space and new book(s)
*/
module.exports = function(req, res) { 
    
    const files = req.files.map(file => {
        return `"${escape(file.path)}" `;
    }).join(' ');
    
    exec(
        `calibredb add --library-path ${req._path.lib} --dont-notify-gui ${files}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err || data.indexOf("Added book ids:") == -1) {
                res.json({ error: true });
            }
            else {
                const ids = data.split("Added book ids: ")[1]
                    .replace(new RegExp("[^0-9,]", 'g'), '');
                
                // Notify API of system's free space
                fs.emptyDir(req._path.ul, err => disk.check(process.env.rootdir, (err, info) => {
                    request.post({
                        url: process.env.apiurl + "book", form: {
                            freeSpace: info.free, ids
                        }
                    }, (err, response, body) => {
                        res.json({ error: false });
                    });
                }));
            }
        }
    )
    
};