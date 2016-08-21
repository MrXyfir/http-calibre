const resizeDisk = require("lib/resize-disk");
const fs = require("fs-extra");

/*
    DELETE :lib
    RETURN
        { error: boolean }
    DESCRIPTION
        Delete library and library's upload folder
*/
module.exports = function(req, res) {
    
    fs.remove(req._path.lib, err => {
        if (err) {
            res.json({ error: true });
        }
        else {
            fs.remove(req._path.ul, err => {
                res.json({ error: false });
                resizeDisk();
            });
        }
    });
    
};