const express = require("express");
const app = express();
const port = 8080;
const moment = require("moment");
const hb = require("express-handlebars");
const db = require("./db");
app.listen(port, () => console.log(`petition listening on port ${port}!`));
const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: `Hungry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

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
    if (req.session.signatureId) {
        db.getAllSignaturesById(req.session.signatureId).then((result) => {
            res.render("home", {
                signed: true,
                result: result.rows[0],
            });
        });
    } else {
        res.render("home", {
            signed: false,
        });
    }
});

app.post("/", (req, res) => {
    if (req.session.signatureId) return res.redirect("/");
    if (!req.body.fname || !req.body.lname) {
        res.render("home", {
            showError: true,
        });
    } else {
        setTimeout(() => {
            let date = moment().format();
            db.addPetition(req.body.fname, req.body.lname, req.body.url, date)
                .then((result) => {
                    res.render("thanks", {
                        fname: req.body.fname,
                        lname: req.body.lname,
                        signature: req.body.url,
                    });
                    return result.rows;
                })
                .then((result) => {
                    req.session.signatureId = result[0].id;
                })
                .catch((err) => {
                    console.log("database error", err);
                    res.sendStatus(500);
                    res.render("petition", {
                        showDbError: true,
                    });
                });
        }, 500);
    }
});

app.get("/list", (req, res) => {
    db.getAllSignatures()
        .then((result) => result.rows)
        .then((result) => {
            res.render("list", {
                layout: "list",
                list: result,
                totalNumber: result.length,
            });
        })
        .catch((err) => {
            console.log(err);
            res.statusCode(500).end();
        });
});

app.get("/logout", (req, res) => {
    if (req.session.signatureId) {
        req.session = null;
        res.statusCode = 205;
        res.redirect("/");
    }
});
