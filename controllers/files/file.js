module.exports  = function(req, res) {
    
    res.sendFile(
        req._path.lib + '/' + decodeURIComponent(req.params.author) + '/'
        + decodeURIComponent(req.params.book) + '/'
        + decodeURIComponent(req.params.file)
    );
    
}