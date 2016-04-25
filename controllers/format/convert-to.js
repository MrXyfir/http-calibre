"use strict";

const sqlite = require("sqlite3");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require("diskusage");
const fs = require("fs-extra");

/*
    POST library/:lib/books/:book/format/convert/:from/:to
    RETURN
        { error: boolean, freeSpace?: number }
    DESCRIPTION
        Gets path of :from for :book from Calibre's metadata.db
        Attempts to generate a :to format version of :book using :from
        Adds newly generated version to library
*/
module.exports = function(req, res) {
    
    if (!req.params.from.match(/^[A-Za-z0-9]{1,5}$/) || !req.params.to.match(/^[A-Za-z0-9]{1,5}$/)) {
        res.json({ error: true });
        return;
    }
    
    const db = new sqlite.Database(req._path.lib + "/metadata.db");
    let path = "", sql = "", vars = [];
    
    // Get book path from books table WHERE id
    sql = "SELECT path FROM 'books' WHERE id = ?";
    vars = [+req.params.book];
    
    db.get(sql, vars, (err, row) => {
        if (err || !row) {
            db.close();
            res.json({ error: true });
        }
        else {
            path = req._path.lib + '/' + row.path + '/';
            
            // Get book file name from data table WHERE id AND format
            sql = "SELECT name FROM 'data' WHERE book = ? AND format = ?";
            vars = [+req.params.book, req.params.from];
            
            db.get(sql, vars, (err, row) => {
                db.close();
                
                if (err || !rows) {
                    res.json({ error: true });
                }
                else {
                    path += row.name + '.' + req.params.from;
                    
                    const nPath = `${req._path.ul}/${row.name}.${req.params.to}`; 
                    
                    // Attempt to convert to new format
                    exec(
                        `ebook-convert ${escape(path)} ${escape(nPath)}`,
                        { cwd: process.env.calibredir }, (err, data, stderr) => {
                            if (err || data.indexOf("Output saved to") == -1) {
                                res.json({ error: true });
                            }
                            else {
                                // Add format to :book
                                exec(
                                    `calibredb add_format --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book} "${escape(nPath)}"`,
                                    { cwd: process.env.calibredir }, (err, data, stderr) => {
                                        if (err || data.indexOf("Error") != -1) {
                                            res.json({ error: true });
                                        }
                                        else {
                                            // Empty upload directory and get free disk space
                                            fs.emptyDir(req._path.ul, err => disk.check(process.env.rootdir, (err, info) => {
                                                res.json({ error: false, freeSpace: info.free });
                                            }));
                                        }
                                    }
                                )
                            }
                        }
                    );
                }
            });
        }
    });
    
};