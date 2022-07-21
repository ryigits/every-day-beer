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
    if (req.session.id) {
        res.redirect("/petition");
    } else {
        res.redirect("/register");
    }
});

app.get("/register", (req, res) => {
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
                    console.log("User Logged in", req.session);
                    res.redirect("/petition");
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
        res.redirect("/");
    }
});

app.get("/login", (req, res) => {
    if (req.session.signed) {
        return res.render("thanks", {});
    } else {
        return res.render("login", {});
    }
});

app.post("/register", (req, res) => {
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
                res.redirect("/createProfile");
            })
            .catch((err) => {
                console.log("database error", err);
                res.render("home", {
                    showDbError: true,
                });
            });
    });
});

app.get("/createProfile", (req, res) => {
    if (req.session.id) {
        res.render("createProfile", {
            logged: true,
            name: req.session.name,
        });
    }
});

app.post("/createProfile", (req, res) => {
    db.createProfile(req.session.id, req.body.city, req.body.age).then(() => {
        res.redirect("/petition");
    });
});

app.post("/petition", (req, res) => {
    // add signature page
    if (req.session.id && !req.session.signed) {
        setTimeout(() => {
            db.addSignature(req.session.id, req.body.url).then((url) => {
                req.session.signed = true;
                res.render("thanks", {
                    url: url.rows[0].signature,
                    name: req.session.name,
                    logged: true,
                });
            });
        }, 500);
    }
});

app.get("/list", (req, res) => {
    db.getAllUsers().then((users) => {
        let list = users.rows;
        res.render("list", {
            list: list,
            logged: true,
            name: req.session.name,
        });
    });
});

app.get("/edit", (req, res) => {
    if (req.session.id) {
        db.getProfile(req.session.id).then((result) => {
            let profile = result.rows[0];
            console.log('%cserver.js line:174 req.session', 'color: #007acc;', req.session);
            res.render("edit", {
                logged: true,
                name: req.session.name,
                profile: profile,
            });
        });
    }
});

app.post("/edit", (req, res) => {
    if (req.session.id) {
        db.updateProfile(req.session.id, req.body.city, req.body.age).then( // UPDATE PROFILE EKLENMELI
            () => {
                db.getProfile(req.session.id).then((result) => {
                    let profile = result.rows[0];
                    res.render("edit", {
                        logged: true,
                        name: req.session.name,
                        profile: profile,
                        success: true,
                    });
                });
            }
        );
    } else {
        console.log(
            "%cserver.js line:192 req.session",
            "color: #007acc;",
            req.session
        );
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});
