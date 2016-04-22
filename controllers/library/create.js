const fs = require("fs-extra");

/*
    POST library/:lib
    RETURN
        0 = OK, 1 = ERROR
    DESCRIPTION
        Create library and library's upload folder
*/
module.exports = function(req, res) {
    
    const library = process.env.libdir + '/' + req.params.lib;
    const upload = process.env.uldir + '/' + req.params.lib;
    
    fs.mkdir(library, err => {
        if (err) {
            res.send(1);
        }
        else {
            fs.mkdir(upload, err => {
               if (err) {
                   fs.remove(library, err => {
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