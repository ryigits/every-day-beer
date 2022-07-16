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

app.use(
    express.urlencoded({
        extended: false,
    })
);
app.get("/", (req, res) => {
    res.render("petition", {});
});

app.post("/", (req, res) => {
    setTimeout(() => {
        db.addPetition(req.body.fname, req.body.lname, req.body.url).then(
            () => {
                console.log("recording done");
            }
        );
    }, 1500);
});
