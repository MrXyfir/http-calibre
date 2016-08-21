const resizeDisk = require("lib/resize-disk");
const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const fs = require("fs-extra");

/*
    POST :lib/books/:book/format
    RETURN
        { error: boolean }
    DESCRIPTION
        Add new format of :book
*/
module.exports = function(req, res) { 
    
    // Add new format from upload folder to :book
    exec(
        `calibredb add_format --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book} "${escape(req.file.path)}"`,
        (err, data, stderr) => {
            if (err || data.indexOf("Error") != -1) {
                res.json({ error: true });
            }
            else {
                res.json({ error: false });
                
                fs.emptyDir(req._path.ul, err => resizeDisk());
            }
        }
    )
    
};