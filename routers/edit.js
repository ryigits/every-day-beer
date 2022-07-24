const router = require("express").Router();
const db = require("../db");
const { userLogedIn } = require("../middleware");

router.get("/edit", userLogedIn, (req, res) => {
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

router.post("/edit", userLogedIn, (req, res) => {
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
                if (signature.rowCount === 0) {
                    res.render("edit", {
                        logged: true,
                        name: req.session.name,
                        profile: profile,
                        signed: req.session.signed,
                        success: true,
                    });
                } else
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

module.exports = router;
