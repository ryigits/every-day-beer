const router = require("express").Router();
const db = require("../db");
const { userLogedOut } = require("../middleware");

router.get("/login", userLogedOut, (req, res) => {
    return res.render("login", {});
});

router.post("/login", userLogedOut, (req, res) => {
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
            return res.render("login", {
                doesNotMatch: true,
            });
        }
    });
});

module.exports = router;
