const express = require("express");
const app = express();
const port = 8080;
const helmet = require("helmet");
const moment = require("moment");
const hb = require("express-handlebars");
const db = require("./db");
const bcrypt = require("./bcrypt");
app.listen(port, () => console.log(`petition listening on port ${port}!`));
app.use(helmet());
const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: `Hungry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
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
        db.getSignaturesById(req.session.signatureId).then((result) => {
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

app.get("/login", (req, res) => {
    if (req.session.signatureId) return res.redirect("you have already login");
    res.render("login", {});
});

app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.render("login", {
            showBlankError: true,
        });
    }
    db.getSignaturesByEmail(req.body.email)
        .then((result) => {
            if (result.rows.length != 1)
                return res.render("login", {
                    doesNotMatch: true,
                });
            const hash = result.rows[0].password;
            bcrypt
                .compare(req.body.password, hash)
                .then((result) => {
                    if (result) {
                        return res.redirect("/");
                    } else {
                        return res.render("login", {
                            doesNotMatch: true,
                        });
                    }
                })
                .catch((err) => {
                    console.log("password db error", err);
                });
            return result.rows[0].id;
        })
        .then((id) => (req.session.signatureId = id));
});

app.post("/", (req, res) => {
    if (req.session.signatureId) return res.redirect("/");
    if (!req.body.fname || !req.body.lname)
        return res.render("home", {
            showBlankError: true,
        });
    if (req.body.password != req.body.repassword)
        return res.render("home", {
            showPasswordError: true,
        });
    setTimeout(() => {
        let date = moment().format();
        let email = req.body.email;
        bcrypt.hash(req.body.password).then((password) => {
            db.addPetition(
                req.body.fname,
                req.body.lname,
                req.body.url,
                date,
                email,
                password
            )
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
                    res.render("home", {
                        showDbError: true,
                    });
                });
        });
    }, 500);
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
