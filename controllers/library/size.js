const getFolderSize = require("get-folder-size");

/*
    GET :lib/size
    RETURN
        { error: boolean, size?: number }
    DESCRIPTION
        Returns a library's size in bytes
*/
module.exports = function(req, res) {
    
    getFolderSize(req._path.lib, (err, size) => {
        if (err)
            res.json({ error: true });
        else
            res.json({ error: false, size });
    });
    
};