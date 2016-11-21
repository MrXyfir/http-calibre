const resizeDisk = require("lib/resize-disk");
const request = require("request");
const sqlite = require("sqlite3");
const escape = require("js-string-escape");
const unzip = require("extract-zip");
const exec = require("child_process").exec;
const fs = require("fs-extra");

const config = require("config");

/*
    POST :lib/upload
    RETURN
        { error: boolean, message?: string }
    DESCRIPTION
        Empty previous library directory
		Unzip file into library folder
		Grab all book ids from metadata.db
		Send book ids to core API
*/
module.exports = function(req, res) {
    
    fs.emptyDir(req._path.lib, err => {
        if (err) {
            res.json({
                error: true, message: "Could not wipe old library"
            });
        }
        else {
            unzip(req.file.path, { dir: req._path.lib }, (err) => {
                if (err) {
                    res.json({
                        error: true, message: "Could not unzip file"
                    });
                }
                else {
                    const db = new sqlite.Database(
                        req._path.lib + "/metadata.db"
                    );
            
                    db.all("SELECT id FROM 'books'", (err, rows) => {
                        db.close();

                        if (err || !rows.length) {
                            res.json({
                                error: true, message: "Invalid library"
                            });
                        }
                        else {
                            const ids = rows.map(row => row.id).join(',');
                            
                            fs.emptyDir(req._path.ul, err => {
                                request.post({
                                    url: config.urls.api + req.params.lib
                                        + "/library",
                                    form: { ids }
                                }, (err, response, body) => {
                                    res.json({
                                        error: !!err || JSON.parse(body).error
                                    });
                                    
                                    resizeDisk();
                                });
                            });
                        }
                    });
                }
            });
        }
    });
    
};