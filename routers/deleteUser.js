const router = require("express").Router();
const db = require("../db");
const { userLogedIn } = require("../middleware");

router.get("/deleteUser", userLogedIn, (req, res) => {});

router.post("/deleteUser", userLogedIn, (req, res) => {
    if (req.body.delete) {
        return db.deleteSignature(req.session.id).then(() => {
            req.session.signed = false;
            res.redirect("/edit");
        });
    } else {
        db.deleteUser(req.session.id).then(() => {
            res.render("deleteUser", {
                success: true,
            });
        });
    }
});

module.exports = router;
