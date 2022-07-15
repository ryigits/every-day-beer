const express = require("express");
const app = express();
const port = 8080;
const db = require("./db");
app.listen(port, () => console.log(`petition listening on port ${port}!`));

app.use(express.static("./public"));

app.get("/", (req, res) => {
    console.log("get");
});

app.get("/cities", (req, res) => {
    db.getCitites().then((results) => {
        console.log("result getcities");
        return;
    });
});

app.get("/add-city", (req, res) => {
    db.addCity("c", "a");
});
