const resizeDisk = require("lib/resize-disk");
const request = require("request");
const sqlite = require("sqlite3");
const exec = require("child_process").exec;
const fs = require("fs");

const config = require("config");

/*
    PUT libraries/:lib/books/:book/cover
    RETURN
        { error: boolean }
    DESCRIPTION
        Updates a book's cover with uploaded image
        Calls main API to update book's cover version
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
                        (err, data, stderr) => {
                            res.json({ error: false });
                            
                            request.put({
                                url: config.urls.api + req._libId
                                    + "/books/" + +req.params.book,
                                form: { type: "cover" }
                            }, (err, response, body) => 1);

                            resizeDisk();
                        }
                    );
                }
            });
        }
    });
    
};