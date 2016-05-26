"use strict";

const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require('diskusage');

/*
    PUT library/:lib/books/:book/metadata
    REQUIRED
        data: json-string
            { key: value, key2: value, ... }
    RETURN
        { error: boolean, message?: string }
    DESCRIPTION
        Sets a field in book's metadata
        Notify API of book's metadata change + server's free space
*/
module.exports = function(req, res) {
    
    let fields = {};
    
    try {
        fields = JSON.parse(req.body.data);
    }
    catch (e) {
        res.json({ error: true, message: "Bad fields" });
        return;
    }
    
    // Build / escape field arguments
    const data = Object.keys(fields).map(field => {
        return `-f "${escape(field)}:${escape(fields[field])}"`;
    }).join(' ');
    
    exec(
        `calibredb set_metadata --library-path ${req._path.lib} --dont-notify-gui ${data} ${+req.params.book}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err || data.indexOf("Backing up metadata") == -1) {
                res.json({ error: true, message: "Could not set metadata" });
            }
            else {
                res.json({ error: false });

                exec(
                    `calibredb embed_metadata --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book}`,
                    { cwd: process.env.calibredir }, (err, data, stderr) => {
                        disk.check(process.env.rootdir, (err, info) => {
                            request.put({
                                url: process.env.apiurl + req._path.lib.split('/').slice(-1)
                                    + "/books/" + +req.params.book,
                                form: { type: "metadata", freeSpace: info.free } 
                            }, (err, response, body) => {
                                return;
                            });
                        });
                    }
                );
            }
        }
    );
    
};