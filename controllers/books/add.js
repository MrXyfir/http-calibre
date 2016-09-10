const resizeDisk = require("lib/resize-disk");
const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const fs = require("fs-extra");

const config = require("config");

/*
    POST :lib/books
    RETURN
        { error: boolean }
    DESCRIPTION
        Add uploadeded books to library
        Notify core API of new book(s)
*/
module.exports = function(req, res) { 
    
    const files = req.files.map(file => {
        return `"${escape(file.path)}" `;
    }).join(' ');
    
    exec(
        `calibredb add --library-path ${req._path.lib} --dont-notify-gui ${files}`,
        (err, data, stderr) => {
            if (err || data.indexOf("Added book ids:") == -1) {
                fs.emptyDir(req._path.ul, err => {
                    res.json({ error: true });
                });
            }
            else {
                const ids = data.split("Added book ids: ")[1]
                    .replace(new RegExp("[^0-9,]", 'g'), '');
                
                // Notify Libyq of new books
                fs.emptyDir(req._path.ul, err => {
                    request.post({
                        url: config.urls.api + req._libId + "/books",
                        form: { ids }
                    }, (err, response, body) => {
                        if (err || JSON.parse(body).error) {
                            res.json({ error: true });

                            // Delete new books
                            exec(
                                `calibredb add --library-path ${req._path.lib} --dont-notify-gui ${ids}`,
                                (err, response, body) => 1
                            );
                        }
                        else {
                            res.json({ error: false });
                            resizeDisk();
                        }
                    });
                });
            }
        }
    )
    
};