const fs = require("fs-extra");

/*
    POST :lib
    RETURN
       { error: boolean }
    DESCRIPTION
        Create library and library's upload folder
*/
module.exports = function(req, res) {
    
    fs.mkdir(req._path.lib, err => {
        if (err) {
            res.json({ error: true });
        }
        else {
            fs.mkdir(req._path.ul, err => {
               if (err) {
                   fs.remove(req._path.lib, err => {
                       res.json({ error: true });
                   });
               } 
               else {
                   res.json({ error: false });
               }
            });
        }
    });
    
};