const resizeDisk = require("lib/resize-disk");
const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;

/*
    DELETE :lib/books/:book/format/:format
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes a specific format of :book
*/
module.exports = function(req, res) {
    
    if (!req.params.format.match(/^[A-Za-z0-9]{1,5}$/)) {
        res.json({ error: true });
        return;
    }
    
    exec(
        `calibredb remove_format --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book} ${req.params.format}`,
        (err, data, stderr) => {
            if (err) {
                res.json({ error: true });
            }
            else {
                res.json({ error: false });
                resizeDisk();
            }
        }
    );
    
};