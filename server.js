const express = require("express");
const app = express();
const port = 8080;
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
    if (req.session.signatureId) {
        res.redirect(302, "/petition");
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
    db.getAllMembers()
        .then((result) => result.rows)
        .then((result) => {
            return (req.session.list = result);
        });
    db.getMembersByEmail(req.body.email).then((result) => {
        if (result.rows.length != 1)
            return res.render("login", {
                doesNotMatch: true,
            });
        const hash = result.rows[0].password_hash;
        bcrypt.compare(req.body.password, hash).then((result) => {
            if (result) {
                return res.redirect("/petition");
            } else {
                return res.render("login", {
                    doesNotMatch: true,
                });
            }
        });
        let member = result.rows[0];
        req.session.signed = false;
        req.session.signatureId = member.id;
        req.session.name = member.first_name;
    });
});

app.get("/petition", (req, res) => {
    db.getSignature(req.session.signatureId)
        .then((result) => {
            req.session.signature = result.rows[0].signature;
            return res.render("thanks", {
                logged: true,
                name: req.session.name,
                signature: req.session.signature,
                totalNumber: req.session.list.length,
            });
        })
        .catch(() => {
            return res.render("petition", {
                logged: true,
                name: req.session.name,
                totalNumber: req.session.list.length,
            });
        });
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
    bcrypt.hash(req.body.password).then((password) => {
        db.addMember(req.body.fname, req.body.lname, req.body.email, password)
            .then((result) => {
                return result.rows;
            })
            .then((result) => {
                req.session.signatureId = result[0].id;
                res.redirect(302, "/login");
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
    if (req.session.signatureId) {
        setTimeout(() => {
            db.addSignature(req.session.signatureId, req.body.url)
                .then((url) => {
                    req.session.signed = true;
                    res.render("thanks", {
                        url: url.rows[0].url,
                        name: req.session.name,
                        totalNumber: req.session.list.length,
                        logged: true,
                    });
                })
                .catch(() => {
                    res.render("petition", {
                        showDbError: true,
                        logged: true,
                        name: req.session.name,
                        totalNumber: req.session.list.length,
                    });
                });
        }, 500);
    }
});

app.get("/list", (req, res) => {
    if (req.session.signatureId) {
        res.render("list", {
            list: req.session.list,
            logged: true,
            name: req.session.name,
            totalNumber: req.session.list.length,
            signature: req.session.signature,
        });
    }
});

app.get("/logout", (req, res) => {
    if (req.session.signatureId) {
        req.session = null;
        res.statusCode = 205;
        res.redirect("/");
    }
});
