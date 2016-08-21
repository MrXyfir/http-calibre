const resizeDisk = require("lib/resize-disk");
const request = require("request");
const sqlite = require("sqlite3");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const fs = require("fs-extra");

/*
    POST :lib/books/:book/format/convert/:from/:to
    RETURN
        { error: boolean }
    DESCRIPTION
        Gets path of :from for :book from Calibre's metadata.db
        Attempts to generate a :to format version of :book using :from
        Adds newly generated version to library
        Update server's free space via api
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
                
                if (err || !row) {
                    res.json({ error: true });
                }
                else {
                    const nPath = path + row.name + '.' + req.params.to;
                    path += row.name + '.' + req.params.from; 
                    
                    // Attempt to convert to new format
                    exec(
                        `ebook-convert "${escape(path)}" "${escape(nPath)}"`,
                        (err, data, stderr) => {
                            if (err || data.indexOf("Output saved to") == -1) {
                                res.json({ error: true });
                            }
                            else {
                                // Add format to :book
                                exec(
                                    `calibredb add_format --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book} "${escape(nPath)}"`,
                                    (err, data, stderr) => {
                                        if (err || data.indexOf("Error") != -1) {
                                            res.json({ error: true });
                                        }
                                        else {
                                            res.json({ error: false });
 
                                            resizeDisk();
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