const fs = require("fs-extra");

/*
    DELETE library/:lib
    RETURN
        0 = OK, 1 = ERROR
    DESCRIPTION
        Delete library and library's upload folder
*/
module.exports = function(req, res) {
    
    const library = process.env.libdir + '/' + req.params.lib;
    const upload = process.env.uldir + '/' + req.params.lib;
    
    fs.remove(library, err => {
        if (err) {
            res.send(1);
        }
        else {
            fs.remove(upload, err => {
               res.send(+err);
            });
        }
    });
    
};