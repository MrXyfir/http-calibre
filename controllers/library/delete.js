const fs = require("fs-extra");

/*
    DELETE library/:lib
    RETURN
        0 = OK, 1 = ERROR
    DESCRIPTION
        Delete library and library's upload folder
*/
module.exports = function(req, res) {
    
    fs.remove(req.path.lib, err => {
        if (err) {
            res.send(1);
        }
        else {
            fs.remove(req.path.ul, err => {
               res.send(+err);
            });
        }
    });
    
};