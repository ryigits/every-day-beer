const router = require("express").Router();
const db = require("../db");
const { userLogedIn } = require("../middleware");
const bcrypt = require("../bcrypt");

router.get("/changePassword", userLogedIn, (req, res) => {
    res.render("changePassword", {
        layout: "main",
        logged: true,
        name: req.session.name,
    });
});

router.post("/changePassword", userLogedIn, (req, res) => {
    const { password, rePassword } = req.body;
    if (password === rePassword) {
        bcrypt.hash(password).then((newPassword_hash) => {
            db.changePassword(req.session.id, newPassword_hash).then(() => {
                res.render("changePassword", {
                    logged: true,
                    success: true,
                });
            });
        });
    } else {
        res.render("changePassword", {
            name: req.session.name,
            doesNotMatch: true,
            logged: true,
        });
    }
});

module.exports = router;
