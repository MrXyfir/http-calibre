const resizeDisk = require("lib/resize-disk");
const exec = require("child_process").exec;

/*
    DELETE libraries/:lib/books
    REQUIRED
        books: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Delete a list of books by id from library
*/
module.exports = function(req, res) {
    
    if (!req.body.books || !req.body.books.match(/^[0-9,]{1,}$/)) {
        res.json({ error: true });
        return;
    }
    
    exec(
        `calibredb remove --library-path ${req._path.lib} --dont-notify-gui ${req.body.books}`,
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