const resizeDisk = require("lib/resize-disk");
const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;

const config = require("config");

/*
    PUT :lib/books/:book/metadata
    REQUIRED
        data: json-string
            { key: value, key2: value, ... }
    RETURN
        { error: boolean, message?: string }
    DESCRIPTION
        Sets a field in book's metadata
        Notify API of book's metadata change + server's free space
*/
module.exports = function(req, res) {
    
    let fields = {};
    
    try {
        fields = JSON.parse(req.body.data);
    }
    catch (e) {
        res.json({ error: true, message: "Bad fields" });
        return;
    }
    
    // Build / escape field arguments
    const data = Object.keys(fields).map(field => {
        return `-f "${escape(field)}:${escape(fields[field])}"`;
    }).join(' ');
    
    exec(
        `calibredb set_metadata --library-path ${req._path.lib} --dont-notify-gui ${data} ${+req.params.book}`,
        (err, data, stderr) => {
            if (err || data.indexOf("Backing up metadata") == -1) {
                res.json({ error: true, message: "Could not set metadata" });
            }
            else {
                res.json({ error: false });

                exec(
                    `calibredb embed_metadata --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book}`,
                    (err, data, stderr) => {
                        request.put({
                            url: config.urls.api + req._libId
                                + "/books/" + +req.params.book,
                            form: { type: "metadata" } 
                        }, (err, response, body) => 1);
                    }
                );

                resizeDisk();
            }
        }
    );
    
};