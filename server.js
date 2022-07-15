const express = require("express");
const app = express();
const port = 8080;
const hb = require("express-handlebars");
const db = require("./db");
app.listen(port, () => console.log(`petition listening on port ${port}!`));
app.use(express.static("./public"));
app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
// app.use(express.static("./petition"));
// app.use(express.static("./thanks"));
// app.use(express.static("./signatures"));
app.use(
    express.urlencoded({
        extended: false,
    })
);
app.get("/", (req, res) => {
    res.render("petition", {

    });
});

app.post("/", (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    res.render("thanks", {
        fname,
        lname
    });
});

