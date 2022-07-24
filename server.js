const express = require("express");
const app = express();
const port = 8080;
const hb = require("express-handlebars");
const db = require("./db");

app.listen(process.env.PORT || port, () => console.log(`petition listening on port ${port}!`));
const { userLogedIn} = require("./middleware");
const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: `Hungry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
app.use(
    express.urlencoded({
        extended: false,
    })
);
const register = require("./routers/register");
const login = require("./routers/login");
const petition = require("./routers/petition");
const edit = require("./routers/edit");
const deleteUser = require("./routers/deleteUser");
app.use(register);
app.use(login);
app.use(petition);
app.use(edit);
app.use(deleteUser);
app.use(express.static("./public"));
app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.get("/", userLogedIn, (req, res) => {
    res.redirect("/petition");
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

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});
