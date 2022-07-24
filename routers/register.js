const router = require("express").Router();
const db = require("../db");
const { userLogedOut } = require("../middleware");
const nodemailer = require("nodemailer");
const bcrypt = require("../bcrypt");
const generator = require("generate-password");

router.get("/register", userLogedOut, (req, res) => {
    res.render("register", {
        logged: false,
    });
});

router.post("/register", (req, res) => {
    const { fname, lname, email } = req.body;
    let password = generator.generate({
        length: 4,
        numbers: true,
    });
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ygtsez",
            pass: "ravaawmmnlsqsfyi",
        },
    });

    const mailData = {
        from: "ygtsez@gmail.com", // sender address
        to: `${email}`, // list of receivers
        subject: "Beer Petition Activation",
        html: `Hey there! Your password is <p style="color:red;">${password}</p> `,
    };

    transporter.sendMail(mailData, function (err) {
        if (err) {
            console.log("%cregister.js line:36 err", "color: #007acc;", err);
        } else {
            console.log("mail created");
        }
    });

    bcrypt.hash(password).then((password) => {
        db.addUser(fname, lname, email, password)
            .then(() => {
                res.redirect("/login");
            })
            .catch(() => {
                res.render("register", {
                    showDbError: true,
                });
            });
    });

    // const { fname, lname, password, rePassword, email } = req.body;
    // if (!fname || !lname)
    //     return res.render("home", {
    //         showBlankError: true,
    //     });
    // if (password != rePassword)
    //     return res.render("home", {
    //         showPasswordError: true,
    //     });
    // bcrypt.hash(password).then((password) => {
    //     db.addUser(fname, lname, email, password)
    //         .then((result) => {
    //             return result.rows;
    //         })
    //         .then((result) => {
    //             req.session.id = result[0].id;
    //             req.session.name = result[0].first_name;
    //             res.redirect("/createProfile");
    //         })
    //         .catch((err) => {
    //             console.log("database error", err);
    //             res.render("home", {
    //                 showDbError: true,
    //             });
    //         });
    // });
});

module.exports = router;
