const router = require("express").Router();
const db = require("../db");
const { userLogedIn } = require("../middleware");

router.get("/list", userLogedIn, (req, res) => {
    db.getAllUsers().then((users) => {
        let list = users.rows;
        res.render("list", {
            list: list,
            logged: true,
            name: req.session.name,
        });
    });
});

router.get("/list/:city", userLogedIn, (req, res) => {
    const { city } = req.params;
    db.selectUsersFromCity(city).then((users) => {
        let list = users.rows;
        res.render("list", {
            list: list,
            logged: true,
            name: req.session.name,
        });
    });
});


module.exports = router;
