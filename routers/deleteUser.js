const router = require("express").Router();
const db = require("../db");
const { userLogedIn } = require("../middleware");

router.get("/deleteUser", (req, res) => {
    res.render("deleteUser", {
        name: req.session.name,
    });
});

router.post("/deleteUser", userLogedIn, (req, res) => {
    if (req.body.delete) {
        return db.deleteSignature(req.session.id).then(() => {
            req.session.signed = false;
            res.redirect("/edit");
        });
    } else {
        db.deleteUser(req.session.id).then(() => {
            req.session = null;
            res.render("deleteUser", {
                success: true,
            });
        });
    }
});

module.exports = router;
