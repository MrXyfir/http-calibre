const parser = require("body-parser");
const app = require("express")();

let config = require("./config");
app.listen(config.environment.port, () => {
    console.log("SERVER RUNNING ON", config.environment.port);
});

/* Body Parser */
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