const router = require("express").Router();
const db = require("../db");
const { userLogedOut } = require("../middleware");
const nodemailer = require("nodemailer");
const bcrypt = require("../bcrypt");
const generator = require("generate-password");
const MAIL_SECRET =
    process.env.MAIL_SECRET || require("../secrets.json").MAIL_SECRET;

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
            pass: MAIL_SECRET,
        },
    });

    const mailData = {
        from: "ygtsez@gmail.com",
        to: `${email}`,
        subject: "Beer Petition Password",
        html: `Hey there! Your password is <p style="color:red;font-size:25px;">${password}</p> `,
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
                res.render("mailSent", {
                    email: email,
                });
            })
            .catch(() => {
                res.render("register", {
                    showDbError: true,
                });
            });
    });
});

module.exports = router;
