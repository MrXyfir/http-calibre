"use strict";

const request = require("request");
const sqlite = require("sqlite3");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require("diskusage");
const fs = require("fs-extra");

/*
    POST library/:lib/upload
    RETURN
        { error: boolean }
    DESCRIPTION
        Empty previous library directory
		Unzip file into library folder
		Grab all book ids from metadata.db
		Send book ids / disk space to core API
*/
module.exports = function(req, res) {
    
    fs.emptyDir(req.path.lib, err => {
        if (err) {
            res.json({ error: true });
        }
        else {
            fs.createReadStream(req.file.path).pipe(
                unzip.Extract({ path: req.path.lib })
            );
            
            const db = new sqlite.Database(req.path.lib + "/metadata.db");
            
            db.all("SELECT id FROM 'books'", (err, rows) => {
                if (err || !rows.length) {
                    db.close();
                    res.json({ error: true });
                }
                else {
                    const ids = rows.map(row => {
                        return row.id;
                    }).join(',');
                    
                    fs.emptyDir(req.path.ul, err => disk.check('/', (err, info) => {
                        request.post({
                            url: process.env.apiUrl + "book", form: {
                                ids, freeSpace: info.free
                            }
                        }, (err, response, body) => {
                            if (err)
                                res.json({ error: true });
                            else
                                res.json({ error: JSON.parse(body).error });
                        });
                    }));
                }
            });
        }
    });
    
};