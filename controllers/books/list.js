"use strict";

const exec = require("child_process").exec;

/*
    GET library/:lib/books
    OPTIONAL
        limit: number
    RETURN
        [{
            author_sort: string, authors: string, cover: string, formats: string[],
            id: number, rating: number, series: string, series_index: number,
            tags: string[], title: string
        }]
    DESCRIPTION
        Return basic info for books in library
*/
module.exports = function(req, res) {
    
    exec(
        `calibredb list --library-path ${req._path.lib} --for-machine --fields author_sort,authors,cover,formats,id,rating,series,series_index,tags,title` + (req.query.limit ? ` --limit ${+req.query.limit}` : ''),
        { cwd: process.env.calibredir }, (err, data, stderr) => {
            res.send(err ? "[]" : data);
        }
    );
    
};