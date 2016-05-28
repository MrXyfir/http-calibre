module.exports  = function(req, res) {
    
    res.sendFile(req._path.lib + "/metadata.db");
    
}