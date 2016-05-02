"use strict";

const request = require("request");
const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require('diskusage');

/*
    PUT library/:lib/books/:book/metadata
    REQUIRED
        data: json-string
            { fields: [{ name: string, value: string }] }
    RETURN
        { error: boolean }
    DESCRIPTION
        Sets a field in book's metadata
        Notify API of book's metadata change + server's free space
*/
module.exports = function(req, res) {
    
    let fields = [];
    
    try {
        fields = JSON.parse(req.body.data).fields;
    }
    catch (e) {
        res.json({ error: true });
        return;
    }
    
    // Build / escape field arguments
    const data = fields.map(field => {
        return `-f "${escape(field.name)}:${escape(field.value)}"`;
    }).join(' ');
    
    exec(
        `calibredb set_metadata --library-path ${req._path.lib} --dont-notify-gui ${data} ${+req.params.book}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err || data.indexOf("Backing up metadata") == -1) {
                res.json({ error: true });
            }
            else {
                res.json({ error: false });
                
                exec(
                    `calibredb embed_metadata --library-path ${req._path.lib} --dont-notify-gui ${+req.params.book}`,
                    { cwd: process.env.calibredir }, (err, data, stderr) => {
                        disk.check(process.env.rootdir, (err, info) => {
                            request.put({
                                url: process.env.apiurl + req.params.lib + "/books/" +req.params.book,
                                form: { type: "metadata", freeSpace: info.free } 
                            }, (err, response, body) => {
                                res.json({ error: false });
                            });
                        });
                    }
                );
            }
        }
    );
    
};