const exec = require("child_process").exec;

/*
    GET library/:lib/books
    OPTIONAL
        limit: number
    RETURN
        { books: [{
            author_sort: string, authors: string, cover: string, formats: string[],
			tags: string[], title: string, pubdate: string, publisher: string,
            id: number, rating: number, series: string, series_index: number,
            last_modified: string, identifiers: string, size: number,
            timestamp: number, comments: string
        }]}
    DESCRIPTION
        Return metadata / info for books in library
*/
module.exports = function(req, res) {
    
    exec(
        `calibredb list --library-path ${req._path.lib} --for-machine --fields author_sort,authors,cover,formats,id,rating,series,series_index,tags,title,pubdate,publisher,last_modified,identifiers,size,timestamp,comments` + (req.query.limit ? ` --limit ${+req.query.limit}` : ''),
        (err, data, stderr) => {
            res.json({
                books: err ? [] : JSON.parse(data)
            });
        }
    );
    
};