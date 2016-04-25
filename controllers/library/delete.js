"use strict";

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
    
    fs.remove(req._path.lib, err => {
        if (err) {
            res.json({ error: true });
        }
        else {
            fs.remove(req._path.ul, err => {
               disk.check(process.env.rootdir, (err, info) => {
                   res.json({ error: false, freeSpace: info.free });
               });
            });
        }
    });
    
};