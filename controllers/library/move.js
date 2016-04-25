"use strict";

const exec = require("child_process").exec;
const disk = require("diskusage");
const fs = require("fs-extra");

/*
    PUT library/:lib
    REQUIRED
        toServer: string
    RETURN
        { error: boolean, freeSpace?: number }
    DESCRIPTION
        Attempt to transfer library to provided server
        Delete library / upload folders
        Return free disk space to API
*/
module.exports = function(req, res) {
    
    exec(
        `scp -r ${req._path.lib} ${req.body.toServer}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err) {
                res.json({ error: true });
            }
            else {
                const ids = data.split("Added book ids: ")[1]
                    .replace(new RegExp("[^0-9,]", 'g'), '');
                
                // Notify API of system's free space
                fs.emptyDir(req._path.lib, err => disk.check(process.env.rootdir, (err, info) => {
                    res.json({ error: false, freeSpace: info.free });
                }));
            }
        }
    )
    
};