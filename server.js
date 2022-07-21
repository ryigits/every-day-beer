const express = require("express");
const app = express();
const port = 8080;

const moment = require("moment");
const hb = require("express-handlebars");
const db = require("./db");
const bcrypt = require("./bcrypt");
app.listen(port, () => console.log(`petition listening on port ${port}!`));

const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: `Hungry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.use(express.static("./public"));
app.use(express.static("./public"));
app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.get("/", (req, res) => {
    if (req.session.id) {
        res.redirect("/petition");
    } else {
        res.render("home", {
            logged: false,
        });
    }
});

app.post("/login", (req, res) => {
    // login page
    if (!req.body.email || !req.body.password) {
        return res.render("login", {
            showBlankError: true,
        });
    }
    db.authUser(req.body.email, req.body.password).then((result) => {
        if (result) {
            db.getUserByEmail(req.body.email).then((user) => {
                req.session.id = user.id;
                req.session.name = user.first_name;
                db.getSignatureById(user.id).then((result) => {
                    if (result.rows.length > 0) {
                        req.session.signed = true;
                    }
                    res.redirect("petition");
                });
            });
        } else {
            res.render("login", {
                doesNotMatch: true,
            });
        }
    });
});

app.get("/petition", (req, res) => {
    console.log('%cserver.js line:69 req.session', 'color: #007acc;', req.session);
    if (req.session.id && req.session.signed) {
        res.render("thanks", {
            logged: true,
            name: req.session.name,
        });
    } else if (req.session.id) {
        res.render("petition", {
            logged: true,
            name: req.session.name,
        });
    } else {
        res.redirect(302, "/");
    }
});

app.get("/login", (req, res) => {
    if (req.session.signatureId)
        return res.render("login", {
            logAgain: true,
        });
    if (req.session.signed) {
        return res.render("thanks", {});
    } else {
        return res.render("login", {});
    }
});

app.post("/", (req, res) => {
    // also register page
    if (!req.body.fname || !req.body.lname)
        return res.render("home", {
            showBlankError: true,
        });
    if (req.body.password != req.body.repassword)
        return res.render("home", {
            showPasswordError: true,
        });
    let email = req.body.email;
    bcrypt.hash(req.body.password).then((password) => {
        db.addUser(req.body.fname, req.body.lname, email, password)
            .then((result) => {
                return result.rows;
            })
            .then((result) => {
                req.session.id = result[0].id;
                req.session.name = result[0].first_name;
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("database error", err);
                res.render("home", {
                    showDbError: true,
                });
            });
    });
});

app.post("/petition", (req, res) => {
    // add signature page
    if (req.session.id && !req.session.signed) {
        setTimeout(() => {
            db.addSignature(req.session.id, req.body.url).then((url) => {
                req.session.signed = true;
                res.render("thanks", {
                    url: url.rows[0].url,
                    name: req.session.name,
                    logged: true,
                });
            });
        }, 500);
    }
});

app.get("/list", (req, res) => {
    if (req.session.id) {
        return res.redirect(302, "/petition");
    }
    if (req.session.signed) {
        return res.render("list", {
            list: req.session.list,
            logged: true,
            name: req.session.name,
        });
    }
    res.redirect("/login");
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});
