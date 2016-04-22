const disk = require('diskusage');
const fs = require("fs-extra");

/*
    DELETE library/:lib
    RETURN
        { error: boolean, freeSpace?: number }
    DESCRIPTION
        Delete library and library's upload folder
*/
module.exports = function(req, res) {
    
    fs.remove(req.path.lib, err => {
        if (err) {
            res.json({ error: true });
        }
        else {
            fs.remove(req.path.ul, err => {
               disk.check('/', (err, info) => {
                   res.json({ error: false, freeSpace: info.free });
               });
            });
        }
    });
    
};