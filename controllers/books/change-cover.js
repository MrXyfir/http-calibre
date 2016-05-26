"use strict";

const request = require("request");
const sqlite = require("sqlite3");
const exec = require("child_process").exec;
const disk = require("diskusage");
const fs = require("fs");

/*
    PUT library/:lib/books/:book/cover
    RETURN
        { error: boolean }
    DESCRIPTION
        Updates a book's cover with uploaded image
        Calls main API to update book's cover version + server's free space
*/
module.exports = function(req, res) {
    
    const db = new sqlite.Database(req._path.lib + "/metadata.db");
    
    // Grab book's path within library
    db.get("SELECT path FROM books WHERE id = ?", [+req.params.book], (err, row) => {
        db.close();
        
        if (err || !row) {
            res.json({ error: true });
        }
        else {
            const path = req._path.lib + '/' + row.path + "/cover.jpg";
            
            // Overwrite old cover image
            fs.rename(req.file.path, path, err => {
                if (err) {
                    res.json({ error: true });
                }
                else {
                    exec(
                        `calibredb embed_metadata --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book}`,
                        { cwd: process.env.calibredir }, (err, data, stderr) => {
                            res.json({ error: false });
                            
                            disk.check(process.env.rootdir, (err, info) => {
                                request.put({
                                    url: process.env.apiurl + req._path.lib.split('/').slice(-1)
                                        + "/books/" + +req.params.book,
                                    form: { type: "cover", freeSpace: info.free }
                                }, (err, response, body) => {
                                    return;
                                });
                            });
                        }
                    );
                }
            });
        }
    });
    
};