const express = require("express");
const app = express();
const port = 8080;
const hb = require("express-handlebars");
const db = require("./db");
const bcrypt = require("./bcrypt");
app.listen(port, () => console.log(`petition listening on port ${port}!`));
const { userLogedIn, userLogedOut, userUnsigned } = require("./middleware");
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

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.get("/", userLogedIn, (req, res) => {
    res.redirect("/petition");
});

app.get("/register", userLogedOut, (req, res) => {
    res.render("home", {
        logged: false,
    });
});

app.post("/login", userLogedOut, (req, res) => {
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
        }else{
            return res.render("login", {
                doesNotMatch: true,
            });
        }
    });
});

app.get("/petition", userLogedIn, userUnsigned, (req, res) => {
    res.render("petition", {
        logged: true,
        name: req.session.name,
    });
});

app.get("/login", userLogedOut, (req, res) => {
    return res.render("login", {});
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

app.get("/createProfile", userLogedIn, (req, res) => {
    res.render("createProfile", {
        logged: true,
        name: req.session.name,
    });
});

app.post("/createProfile", userLogedIn, (req, res) => {
    db.createProfile(req.session.id, req.body.city, req.body.age).then(() => {
        return res.redirect("/petition");
    });
});

app.post("/petition", userLogedIn, userUnsigned, (req, res) => {
    // add signature page
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

app.get("/edit", userLogedIn, (req, res) => {
    db.getProfile(req.session.id).then((result) => {
        let profile = result.rows[0];
        let signature = null;
        if (typeof profile.signature != "undefined") {
            signature = profile.signature;
        }
        res.render("edit", {
            logged: true,
            signed: req.session.signed,
            name: req.session.name,
            profile: profile,
            signature: signature,
        });
    });
});

app.post("/edit", userLogedIn, (req, res) => {
    db.updateProfile(
        req.session.id,
        req.body.first_name,
        req.body.last_name,
        req.body.age,
        req.body.city
    ).then(() => {
        db.getProfile(req.session.id).then((result) => {
            let profile = result.rows[0];
            db.getSignatureById(req.session.id).then((signature) => {
                console.log('%cserver.js line:168 signature', 'color: #007acc;', signature);
                res.render("edit", {
                    logged: true,
                    name: req.session.name,
                    profile: profile,
                    signed: req.session.signed,
                    signature: signature.rows[0].signature,
                    success: true,
                });
            });
        });
    });
});

app.post("/delete", userLogedIn, (req, res) => {
    if (req.body.delete) {
        return db.deleteSignature(req.session.id).then(() => {
            req.session.signed = false;
            res.redirect("/edit");
        });
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});
