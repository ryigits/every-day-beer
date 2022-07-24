const router = require("express").Router();
const db = require("../db");
const { userLogedIn, userUnsigned } = require("../middleware");
router.get("/petition", userLogedIn, userUnsigned, (req, res) => {
    res.render("petition", {
        logged: true,
        name: req.session.name,
    });
});

router.post("/petition", userLogedIn, userUnsigned, (req, res) => {
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

module.exports = router;