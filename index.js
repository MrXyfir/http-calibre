const parser = require("body-parser");
const app = require("express")();

let config = require("./config");
app.listen(config.environment.port, () => {
    console.log("SERVER RUNNING ON", config.environment.port);
});

/* Body Parser */
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use("/library/:lib", require("./controllers/"));