const escape = require("js-string-escape");
const exec = require("child_process").exec;
const disk = require('diskusage');

/*
    PUT library/:lib/books/:book/metadata
    REQUIRED
        data: json-string
            { fields: [{ name: string, value: string }] }
    RETURN
        { error: boolean, freeSpace?: number }
    DESCRIPTION
        Sets a field in book's metadata
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
        `calibredb set_metadata ${data} --library-path ${req.path.lib} --dont-notify-gui ${+req.params.book}`,
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            if (err || data.indexOf("Backing up metadata") == -1) {
                res.json({ error: true });
            }
            else {
                disk.check('/', (err, info) => {
                   res.json({ error: false, freeSpace: info.free });
               });
            }
        }
    );
    
};