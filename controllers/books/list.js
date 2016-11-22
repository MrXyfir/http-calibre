const spawn = require("child_process").spawn;

/*
    GET :lib/books
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

    const calibre = spawn("calibredb", [
        "list",
        "--library-path", req._path.lib,
        "--for-machine",
        "--fields", "author_sort,authors,cover,formats,id,rating,series,"
            + "series_index,tags,title,pubdate,publisher,last_modified,"
            + "identifiers,size,timestamp,comments"
    ]);

    let output = "";

    calibre.stdout.on("data", (data) => output += data);

    calibre.stderr.on("data", (data) => {
        res.json({ books: [] });
    });

    calibre.on("close", (code) => {
        if (code == 0) {
            output = JSON.parse(output);

            // Ensure books[i].cover|formats paths are only
            // author_folder/book_folder/file and not full file paths
            res.json({
                books: output.map(book => {
                    return Object.assign({}, book, {
                        cover: book.cover.split('/').slice(-3).join('/'),
                        formats: book.formats.map(format => {
                            return format.split('/').slice(-3).join('/');
                        })
                    });
                })
            });
        }
        else {
            res.json({ books: [] });
        }
    });
    
};