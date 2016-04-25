const express = require("express");
const parser = require("body-parser");
const app = express();

app.listen(process.env.port, () => {
    console.log("SERVER RUNNING ON", process.env.port);
});

app.use("/", express.static(__dirname + "/public"));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use("/library/:lib", function(req, res, next) {
    if (!req.params.lib.match(/^[A-Za-z0-9]{40}$/)) {
        res.send(1);
    }
    else {
        req.path.lib = process.env.libdir + '/' + req.params.lib;
        req.path.ul = process.env.uldir + '/' + req.params.lib;
        
        next();
    }
});
app.use("/library/:lib", require("./controllers/"));