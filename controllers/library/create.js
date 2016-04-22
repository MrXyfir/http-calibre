const fs = require("fs-extra");

/*
    POST library/:lib
    RETURN
        0 = OK, 1 = ERROR
    DESCRIPTION
        Create library and library's upload folder
*/
module.exports = function(req, res) {
    
    fs.mkdir(req.path.lib, err => {
        if (err) {
            res.send(1);
        }
        else {
            fs.mkdir(req.path.ul, err => {
               if (err) {
                   fs.remove(req.path.lib, err => {
                       res.send(1);
                   });
               } 
               else {
                   res.send(0);
               }
            });
        }
    });
    
};